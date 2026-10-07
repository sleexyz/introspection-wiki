// Read a paper's PDF for the scripts that work from it: where its words are,
// and where its sections, figures, tables and footnotes start.
//
//   import { readPdf } from './pdf.mjs';
//   const pdf = readPdf('/path/to/paper.pdf');
//
// Used by paper.mjs (the inventory of a new paper), anchor.mjs (the places a
// page cites) and figure.mjs (cutting a figure by its number). Needs poppler's
// pdftotext and pdfinfo on the PATH. Lengths are PDF points from the top left
// of the page, which is also one pixel of a page rendered at 72 dpi.
import { execFileSync } from 'node:child_process';
import { skeleton } from '../src/lib/cite.mjs';

const poppler = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
const unescape = (s) =>
  s.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" })[e]);
export const round = (n) => Math.round(n * 10) / 10;

/**
 * @returns {{
 *   pages: number,
 *   words: { p: number, line: number, x0: number, y0: number, x1: number, y1: number, t: string }[],
 *   lines: { p: number, x0: number, y0: number, x1: number, y1: number, words: number[] }[],
 *   crop: [number, number],          the left and right edge of everything printed
 *   margin: number,                  the left edge of the text block
 *   dests: Record<string, number[]>, "sec:5.1", "app:B", "fig:3", "tab:1", "fn:2", "abstract" -> [page, y, height]
 *   titles: Record<string, string>,  the words of each heading, and the first line of each caption
 *   starts: Record<string, number>,  the index in `words` at which each begins
 *   rects: (from: number, to: number) => number[][],
 *   find: (key: string) => number[][][],
 * }}
 */
export function readPdf(file) {
  // Every word with its box, in reading order, grouped into lines.
  const words = [];
  const lines = [];
  const heights = [];
  let block = -1;
  for (const m of poppler('pdftotext', ['-bbox-layout', file, '-']).matchAll(
    /<page width="[\d.]+" height="([\d.]+)"|<block |<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"|<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g,
  )) {
    if (m[1]) heights.push(Number(m[1]));
    else if (m[0] === '<block ') block++;
    else if (m[2]) lines.push({ p: heights.length, block, x0: +m[2], y0: +m[3], x1: +m[4], y1: +m[5], words: [] });
    else {
      lines.at(-1).words.push(words.length);
      words.push({ p: heights.length, line: lines.length - 1, x0: +m[6], y0: +m[7], x1: +m[8], y1: +m[9], t: unescape(m[10]) });
    }
  }
  const first = (line) => words[line.words[0]]?.t;
  const second = (line) => words[line.words[1]]?.t;
  const text = (line) => line.words.map((i) => words[i].t).join(' ');

  // The left edge of the text block: where most lines start.
  const begins = new Map();
  for (const l of lines) begins.set(Math.round(l.x0), (begins.get(Math.round(l.x0)) ?? 0) + 1);
  const margin = [...begins].sort((a, b) => b[1] - a[1])[0][0];

  // hyperref leaves a named destination for every heading, float and footnote.
  // A heading's destination can sit at the foot of the page before it, and a
  // float's is numbered across figures and tables together, so each is only
  // where to start looking; the position kept is that of the text itself.
  const named = [...poppler('pdfinfo', ['-dests', file]).matchAll(/^\s*(\d+) \[ XYZ\s+\S+\s+(\S+)\s+\S+\s*\] "([^"]+)"$/gm)].map(
    (m) => ({ page: +m[1], top: heights[m[1] - 1] - Number(m[2]), name: m[3] }),
  );
  const dests = {};
  const titles = {};
  const starts = {};
  const set = (key, line, top = line.y0, title = text(line)) => {
    if (dests[key]) return;
    dests[key] = [line.p, round(top), round(line.y1 - top)];
    titles[key] = title;
    starts[key] = line.words[0];
  };

  for (const d of named) {
    const heading = d.name.match(/^(?:sub){0,2}section\.(\d+(?:\.\d+){0,2}|[A-Z](?:\.\d+){1,2})$|^appendix\.([A-Z])$/);
    if (heading) {
      const label = heading[1] ?? heading[2];
      // The number of a heading stands alone at the margin, with its title beside it.
      const title = (l) => lines.find((t) => t.p === l.p && Math.abs(t.y0 - l.y0) < 1.5 && t.x0 > l.x1);
      const line = lines.find(
        (l) =>
          (l.p > d.page || (l.p === d.page && l.y0 >= d.top - 3)) &&
          l.words.length === 1 &&
          first(l) === label &&
          Math.abs(l.x0 - margin) < 2 &&
          title(l),
      );
      if (line) set(`${/^[A-Z]/.test(label) ? 'app' : 'sec'}:${label}`, line, line.y0, text(title(line)));
    }
    const note = d.name.match(/^Hfootnote\.(\d+)$/);
    if (note) {
      const line = lines.filter((l) => l.p === d.page && l.y0 >= d.top - 4).sort((a, b) => a.y0 - b.y0)[0];
      if (line) set(`fn:${note[1]}`, line);
    }
  }

  // A figure or table runs from the top of its float to the first line of its
  // caption. A caption opens a block with "Figure 3:" or "Figure 3." or, in
  // some styles, a bare "Figure 3" followed by a capital; a sentence that
  // happens to start a line with "Figure 3 shows" does not.
  const floats = named.filter((d) => /^(figure|table)(\.caption)?\.\d+$/.test(d.name));
  const opens = (line) => lines[lines.indexOf(line) - 1]?.block !== line.block;
  for (const line of lines) {
    const kind = { Figure: 'fig', Table: 'tab' }[first(line)];
    const [, n, mark] = second(line)?.match(/^(\d+)([:.]?)$/) ?? [];
    if (!kind || !n || !opens(line) || !(mark || /^\p{Lu}/u.test(words[line.words[2]]?.t ?? ''))) continue;
    const top = floats
      .filter((d) => d.page === line.p && d.top <= line.y0 + 12)
      .map((d) => d.top)
      .sort((a, b) => b - a)[0];
    set(`${kind}:${n}`, line, top ?? line.y0);
  }

  // The abstract, under its heading. Where it has none, it is the longest
  // block of text on the first page before the first section.
  const heading = lines.find((l) => l.p <= 2 && l.words.length === 1 && /^abstract$/i.test(first(l)));
  if (heading) set('abstract', heading);
  else {
    const before = lines.filter((l) => l.p === 1 && l.words[0] < (starts['sec:1'] ?? Infinity));
    const size = new Map();
    for (const l of before) size.set(l.block, (size.get(l.block) ?? 0) + l.words.length);
    const [longest, count] = [...size].sort((a, b) => b[1] - a[1])[0] ?? [];
    if (count > 40) set('abstract', before.find((l) => l.block === longest));
  }

  // The paper as one string of letters and digits, and the word each came from.
  let doc = '';
  const owner = [];
  words.forEach((w, i) => {
    const s = skeleton(w.t);
    doc += s;
    for (let k = 0; k < s.length; k++) owner.push(i);
  });

  /** One rectangle per line of text between two words: [page, x, y, w, h]. */
  const rects = (from, to) => {
    const out = [];
    for (let i = from; i <= to; i++) {
      const w = words[i];
      const last = out.at(-1);
      if (last?.line === w.line) {
        last.x0 = Math.min(last.x0, w.x0);
        last.x1 = Math.max(last.x1, w.x1);
        last.y0 = Math.min(last.y0, w.y0);
        last.y1 = Math.max(last.y1, w.y1);
      } else out.push({ ...w });
    }
    return out.map((r) => [r.p, round(r.x0), round(r.y0), round(r.x1 - r.x0), round(r.y1 - r.y0)]);
  };

  /** Every place a quotation occurs, each as its rectangles. `key` is the quotation's skeleton. */
  const find = (key) => {
    const found = [];
    for (let at = doc.indexOf(key); at !== -1; at = doc.indexOf(key, at + 1)) {
      found.push(rects(owner[at], owner[at + key.length - 1]));
    }
    return found;
  };

  // The band that holds what is printed, less the odd word far out in a margin
  // (arXiv stamps its identifier up the side of the first page).
  const edge = (values, share) => values.sort((a, b) => a - b)[Math.floor((values.length - 1) * share)];
  const crop = [round(edge(words.map((w) => w.x0), 0.004)), round(edge(words.map((w) => w.x1), 0.996))];
  return { pages: heights.length, words, lines, crop, margin, dests, titles, starts, rects, find };
}

/** The numbers in a run of text that are worth checking: any with two digits or more, a decimal point or a percent sign. */
export const numbers = (text) => (text.match(/\d+(?:\.\d+)?%?/g) ?? []).filter((n) => /[.%]/.test(n) || n.length > 1);

/**
 * How many words each numbered section has, and its share of the main text
 * (the abstract through the last numbered section). The inside of a figure is
 * left out; captions and tables are counted. Good to a percent or two.
 */
export function shares(pdf) {
  const { words, lines, dests, starts, titles } = pdf;
  const heads = Object.keys(dests)
    .filter((k) => k === 'abstract' || /^sec:\d+$/.test(k))
    .sort((a, b) => starts[a] - starts[b]);
  if (!heads.length) return [];
  // The main text ends where the references, the acknowledgments or the appendices begin.
  const after = starts[heads.at(-1)];
  const back = lines.find(
    (l) => l.words[0] > after && l.words.length <= 2 && /^(references|bibliography|acknowledge?ments?)$/i.test(words[l.words[0]].t),
  );
  const appendix = Math.min(...Object.keys(dests).filter((k) => k.startsWith('app:')).map((k) => starts[k]), Infinity);
  const end = Math.min(back ? back.words[0] : Infinity, appendix, words.length);
  const figures = Object.entries(dests).filter(([k]) => k.startsWith('fig:'));
  const inFigure = (w) => figures.some(([, [p, top, h]]) => w.p === p && w.y0 >= top - 1 && w.y1 <= top + h - 6);
  const count = (from, to) => words.slice(from, to).filter((w) => !inFigure(w) && /[\p{L}]{2}/u.test(w.t)).length;

  const rows = heads.map((key, i) => ({ key, title: titles[key], words: count(starts[key], i + 1 < heads.length ? starts[heads[i + 1]] : end) }));
  const main = rows.reduce((sum, r) => sum + r.words, 0);
  for (const r of rows) r.share = Math.round((100 * r.words) / main);
  if (appendix < Infinity) rows.push({ key: 'appendices', title: 'all appendices', words: count(appendix, words.length) });
  return rows;
}
