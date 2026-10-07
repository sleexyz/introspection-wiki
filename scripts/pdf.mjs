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

// A float set beside the text, with the text running round it, comes out of
// pdftotext read straight across the page: a line of the text and a line of
// the caption as one line, and the rest of the float between the lines of the
// text. Such a float is known by its caption, which starts at one side of a
// gap that the next line leaves clear too. Whatever lies on the caption's
// side of that gap is taken out of the text and put after the block it was
// in, the caption at the head of a block of its own. The text then reads on
// unbroken, so a quotation from it can be placed, and the caption is found
// like any other.
const BESIDE = 8; // the least room, in points, left between a float and the text beside it
const captioned = (ws, at) => /^(Figure|Table)$/.test(ws[at]?.t ?? '') && /^\d+[:.]$/.test(ws[at + 1]?.t ?? '');
const around = (ws) => ({
  x0: Math.min(...ws.map((w) => w.x0)),
  y0: Math.min(...ws.map((w) => w.y0)),
  x1: Math.max(...ws.map((w) => w.x1)),
  y1: Math.max(...ws.map((w) => w.y1)),
});
/** The lines of one block of text, with any float set beside them moved to the end. */
function unwrap(block, newBlock) {
  for (const [i, line] of block.entries()) {
    const ws = line.words;
    for (let k = 1; k < ws.length; k++) {
      // The caption is right of the gap, or left of it with words of its own before the gap.
      const flank = captioned(ws, k) ? 1 : captioned(ws, 0) && k > 2 ? 0 : -1;
      if (ws[k].x0 - ws[k - 1].x1 < BESIDE || flank < 0) continue;
      // Which side of the gap a word is on, and whether a line keeps the gap clear.
      const middle = (ws[k - 1].x1 + ws[k].x0) / 2;
      const side = (w) => (w.x1 <= middle - 3 ? 0 : w.x0 >= middle + 3 ? 1 : -1);
      const clear = (l) => l?.words.every((w) => side(w) >= 0);
      if (!clear(block[i + 1] ?? block[i - 1])) continue;
      // The lines the float stands beside: those around the caption that keep the gap clear.
      let [from, to] = [i, i];
      while (clear(block[from - 1])) from--;
      while (clear(block[to + 1])) to++;
      const [above, caption] = [newBlock(), newBlock()];
      const text = [];
      const float = [];
      block.slice(from, to + 1).forEach((l, n) => {
        const mine = l.words.filter((w) => side(w) === flank);
        const rest = l.words.filter((w) => side(w) !== flank);
        if (rest.length) text.push({ ...l, words: rest, ...around(rest), beside: true });
        if (mine.length) float.push({ ...l, block: from + n < i ? above : caption, words: mine, ...around(mine) });
      });
      return [...unwrap([...block.slice(0, from), ...text, ...block.slice(to + 1)], newBlock), ...float];
    }
  }
  return block;
}

/**
 * @returns {{
 *   pages: number,
 *   words: { p: number, line: number, x0: number, y0: number, x1: number, y1: number, t: string }[],
 *   lines: { p: number, x0: number, y0: number, x1: number, y1: number, words: number[] }[],
 *   crop: [number, number],          the left and right edge of everything printed
 *   margin: number,                  the left edge of the text block
 *   dests: Record<string, number[]>, "sec:5.1", "app:B", "fig:3", "tab:1", "fn:2", "abstract" -> [page, y, height]
 *   sides: Record<string, number[]>, for a float narrower than the page, its left and right edge
 *   titles: Record<string, string>,  the words of each heading, and the first line of each caption
 *   starts: Record<string, number>,  the index in `words` at which each begins
 *   rects: (from: number, to: number) => number[][],
 *   find: (key: string) => number[][][],
 *   section: (page: number, y: number) => string | undefined,
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
  // Block by block, take any float set beside the text out of it, and number the words and lines again.
  const read = lines.map((l) => ({ ...l, words: l.words.map((i) => words[i]) }));
  words.length = lines.length = 0;
  for (let from = 0, to = 0; from < read.length; from = to) {
    while (read[to]?.block === read[from].block) to++;
    for (const l of unwrap(read.slice(from, to), () => ++block)) {
      lines.push({ ...l, words: l.words.map((w) => words.push({ ...w, line: lines.length }) - 1) });
    }
  }
  const first = (line) => words[line.words[0]]?.t;
  const second = (line) => words[line.words[1]]?.t;
  const text = (line) => line.words.map((i) => words[i].t).join(' ');

  // A page number, and a running head or foot that repeats from page to page,
  // sit in the stream of words wherever a sentence runs over a page break. They
  // are left out of the text that quotations are matched against.
  const pageLines = (p) => lines.filter((l) => l.p === p && l.words.length).sort((a, b) => a.y0 - b.y0);
  const edges = heights.flatMap((_, i) => [pageLines(i + 1)[0], pageLines(i + 1).at(-1)]).filter(Boolean);
  const seen = new Map();
  for (const l of edges) seen.set(skeleton(text(l)), (seen.get(skeleton(text(l))) ?? 0) + 1);
  for (const l of edges) {
    const number = l.words.length === 1 && /^\d+$/.test(first(l));
    if (number || seen.get(skeleton(text(l))) >= 3) for (const i of l.words) words[i].aside = true;
  }

  // The left edge of the text block: where most lines start.
  const begins = new Map();
  for (const l of lines) begins.set(Math.round(l.x0), (begins.get(Math.round(l.x0)) ?? 0) + 1);
  const margin = [...begins].sort((a, b) => b[1] - a[1])[0][0];

  // The band that holds what is printed, less the odd word far out in a margin
  // (arXiv stamps its identifier up the side of the first page).
  const edge = (values, share) => values.sort((a, b) => a - b)[Math.floor((values.length - 1) * share)];
  const crop = [round(edge(words.map((w) => w.x0), 0.004)), round(edge(words.map((w) => w.x1), 0.996))];

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
  const ends = {};
  const sides = {};
  const across = {}; // how far each heading runs across the page
  const set = (key, line, top = line.y0, title = text(line), from = line.words[0]) => {
    if (dests[key]) return;
    dests[key] = [line.p, round(top), round(line.y1 - top)];
    titles[key] = title;
    starts[key] = from;
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
      // Beside a figure, the title can come before its number in the stream of words.
      if (line) {
        const key = `${/^[A-Z]/.test(label) ? 'app' : 'sec'}:${label}`;
        if (!dests[key]) across[key] = [line.x0, title(line).x1];
        set(key, line, line.y0, text(title(line)), Math.min(line.words[0], title(line).words[0]));
      }
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
  const captions = lines.flatMap((line) => {
    const kind = { Figure: 'fig', Table: 'tab' }[first(line)];
    const [, n, mark] = second(line)?.match(/^(\d+)([:.]?)$/) ?? [];
    const caption = kind && n && opens(line) && (mark || /^\p{Lu}/u.test(words[line.words[2]]?.t ?? ''));
    return caption ? [{ key: `${kind}:${n}`, line }] : [];
  });

  // A paper set with the caption package has each float's destination at the
  // top of the float. Any other has it at the caption, and the top is found on
  // the page instead: a float starts under the last thing above its caption
  // that is not part of it. That is a heading, or else a running head, another
  // caption or a line of running text over the same columns. With nothing
  // above it, the float starts where the type area does. A line of running
  // text is set in the size most of the paper is, starts where a column does
  // or stands beside a float, and has no gaps as wide as those between the
  // cells of a table; the words inside a figure or a table seldom pass all
  // three. The short last line of a paragraph goes with the lines before it.
  const atTop = floats.some((d) => d.name.includes('.caption.'));
  const sizes = new Map();
  for (const w of words) sizes.set(round(w.y1 - w.y0), (sizes.get(round(w.y1 - w.y0)) ?? 0) + 1);
  const size = [...sizes].sort((a, b) => b[1] - a[1])[0]?.[0];
  const columns = [...begins].filter(([, n]) => n > lines.length / 20).map(([x]) => x);
  const running = (l) => {
    const ws = l.words.map((i) => words[i]);
    const sized = ws.filter((w) => Math.abs(w.y1 - w.y0 - size) < size / 20);
    const placed = l.beside || columns.some((x) => Math.abs(l.x0 - x) < 2);
    return placed && ws.length >= 4 && sized.length > ws.length / 2 && ws.every((w, i) => !i || w.x0 - ws[i - 1].x1 < 12);
  };
  const outside = new Set([...captions.map((c) => c.line), ...lines.filter(running)].map((l) => l.block));
  const typeTop = Math.min(...lines.filter((l) => running(l) && !words[l.words[0]].aside).map((l) => l.y0));
  const own = (cap) => lines.filter((l) => l.block === cap.block);
  const width = (cap) => [Math.min(...own(cap).map((l) => l.x0)), Math.max(...own(cap).map((l) => l.x1))];
  // `beside` leaves out a heading that does not reach over the float: one may stand next to a raised float.
  const under = (cap, beside = false) => {
    const [x0, x1] = width(cap);
    const above = (p, y) => p === cap.p && y <= cap.y0 + 1;
    const over = (l) => l.x0 < x1 && l.x1 > x0 && (outside.has(l.block) || l.words.every((i) => words[i].aside));
    const heading = (k) => /^(sec|app):/.test(k) && !(beside && (across[k][0] >= x1 || across[k][1] <= x0));
    const last = Math.max(
      ...lines.filter((l) => above(l.p, l.y1) && over(l)).map((l) => l.y1),
      ...Object.entries(dests).flatMap(([k, [p, y, h]]) => (heading(k) && above(p, y + h) ? [y + h] : [])),
    );
    // Clear of the descenders of the line above.
    return Number.isFinite(last) ? Math.min(last + 4, cap.y0) : Math.min(typeTop, cap.y0);
  };
  // A float set beside the text can be raised above the line it was placed at,
  // and its destination is at that line. Its own words then reach higher: those
  // within its sides, above the destination, that belong to nothing else.
  const raised = (cap, top) => {
    const [x0, x1] = width(cap);
    const floor = under(cap, true);
    const own = lines.filter(
      (l) => l.p === cap.p && l.y0 >= floor - 4 && l.y0 < top && l.x0 >= x0 - 2 && l.x1 <= x1 + 2 && !outside.has(l.block),
    );
    return Math.min(top, ...own.map((l) => l.y0 - 2));
  };
  for (const { key, line } of captions) {
    const top = floats
      .filter((d) => d.page === line.p && d.top <= line.y0 + 12)
      .map((d) => d.top)
      .sort((a, b) => b - a)[0];
    // A caption that runs to a second line well short of the page's width is
    // under a float set beside the text, or in one column of two.
    const [x0, x1] = width(line);
    if (!dests[key] && own(line).length > 1 && x1 - x0 < (crop[1] - crop[0]) * 0.6) sides[key] = [round(x0), round(x1)];
    const marked = top ?? line.y0;
    set(key, line, atTop ? (sides[key] ? raised(line, marked) : marked) : under(line));
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
    if (count > 40) {
      set('abstract', before.find((l) => l.block === longest));
      ends.abstract = before.findLast((l) => l.block === longest).words.at(-1) + 1;
    }
  }

  /** The section a place on a page falls in: the last heading at or before it. */
  const section = (page, y) =>
    Object.keys(dests)
      .filter((k) => /^(sec|app|abstract)/.test(k) && (dests[k][0] < page || (dests[k][0] === page && dests[k][1] <= y + 2)))
      .sort((a, b) => starts[b] - starts[a])[0];

  // The paper as one string of letters and digits, and the word each came from.
  let doc = '';
  const owner = [];
  words.forEach((w, i) => {
    if (w.aside) return;
    const s = skeleton(w.t);
    doc += s;
    for (let k = 0; k < s.length; k++) owner.push(i);
  });

  /** One rectangle per line of text between two words: [page, x, y, w, h]. */
  const rects = (from, to) => {
    const out = [];
    for (let i = from; i <= to; i++) {
      const w = words[i];
      if (w.aside) continue;
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

  return { pages: heights.length, words, lines, crop, margin, dests, sides, titles, starts, ends, rects, find, section };
}

/** The numbers in a run of text that are worth checking: any with two digits or more, a decimal point or a percent sign. */
export const numbers = (text) => (text.match(/\d+(?:\.\d+)?%?/g) ?? []).filter((n) => /[.%]/.test(n) || n.length > 1);

/**
 * How many words each numbered section has, and for a top-level section its
 * share of the main text (the abstract through the last numbered section).
 * A sub-section's count runs to the next heading of any level. The inside of
 * a figure is left out, but not the text beside a figure narrower than the
 * page; captions and tables are counted. Good to a percent or two.
 */
export function shares(pdf) {
  const { words, lines, dests, sides, starts, ends, titles } = pdf;
  const all = Object.keys(dests)
    .filter((k) => k === 'abstract' || k.startsWith('sec:'))
    .sort((a, b) => starts[a] - starts[b]);
  const top = all.filter((k) => !k.includes('.'));
  if (!top.length) return [];
  // The main text ends where the references, the acknowledgments or the appendices begin.
  const after = starts[top.at(-1)];
  // Set in small capitals, the first letter of a heading comes out as a word by itself: "R EFERENCES".
  // A statement on ethics, impact, reproducibility or the use of AI can come before either.
  const BACK = /^(references|bibliography|acknowledge?ments?|(ai|llm)usestatement|(ethics|impact|reproducibility)statement|broaderimpacts?)$/i;
  const heads = (l) => [words[l.words[0]].t, l.words.map((i) => words[i].t).join('')];
  const back = lines.find((l) => l.words[0] > after && l.words.length <= 6 && heads(l).some((t) => BACK.test(t)));
  const appendix = Math.min(...Object.keys(dests).filter((k) => k.startsWith('app:')).map((k) => starts[k]), Infinity);
  const end = Math.min(back ? back.words[0] : Infinity, appendix, words.length);
  const figures = Object.entries(dests).filter(([k]) => k.startsWith('fig:'));
  const beside = (w, [x0, x1] = [-Infinity, Infinity]) => w.x1 > x0 - 2 && w.x0 < x1 + 2;
  const inFigure = (w) => figures.some(([k, [p, top_, h]]) => w.p === p && w.y0 >= top_ - 1 && w.y1 <= top_ + h - 6 && beside(w, sides[k]));
  const count = (from, to) => words.slice(from, to).filter((w) => !w.aside && !inFigure(w) && /[\p{L}]{2}/u.test(w.t)).length;
  const next = (list, key) => starts[list[list.indexOf(key) + 1]] ?? end;

  const rows = all.map((key) => {
    const sub = key.includes('.');
    return { key, title: titles[key], sub, words: count(starts[key], Math.min(ends[key] ?? Infinity, next(sub ? all : top, key))) };
  });
  const main = rows.filter((r) => !r.sub).reduce((sum, r) => sum + r.words, 0);
  for (const r of rows) if (!r.sub) r.share = Math.round((100 * r.words) / main);
  if (appendix < Infinity) rows.push({ key: 'appendices', title: 'all appendices', words: count(appendix, words.length) });
  return rows;
}
