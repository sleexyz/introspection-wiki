#!/usr/bin/env node
// Find where an outline's locators and quotations sit in the paper's PDF.
//
//   node scripts/anchor.mjs <paper-id>
//
// Reads src/content/outlines/<paper-id>.md and the paper's PDF, and writes
// src/data/anchors/<paper-id>.json: for every section, figure, table and
// footnote its page and height on the page, and for every quotation in the
// outline the rectangles its words occupy. The outline page uses these to
// scroll the paper beside it and to highlight the passage being discussed.
//
// Run it again whenever the outline's quotations or locators change. It exits
// with an error if a quotation is in neither the paper nor its threads, which
// is the check that every quotation on the page can be found in its source.
//
// The PDF is expected at data/raw/papers/<paper-id>/paper.pdf (override with
// PAPER_PDF=/path/to.pdf) and must be the file the paper page links as `pdf`.
// Only positions are written, never the paper's text. Needs poppler's
// pdftotext and pdfinfo on the PATH. Lengths are PDF points from the top left
// of the page.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { MIN_QUOTE, skeleton, tokenize } from '../src/lib/cite.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const [paperId] = process.argv.slice(2);
if (!paperId) {
  console.error('usage: anchor.mjs <paper-id>');
  process.exit(1);
}
const need = (file, what) => {
  if (!fs.existsSync(file)) {
    console.error(`no ${what} at ${path.relative(ROOT, file)}`);
    process.exit(1);
  }
  return file;
};
const pdf = need(process.env.PAPER_PDF ?? path.join(ROOT, 'data/raw/papers', paperId, 'paper.pdf'), 'PDF');
const outline = fs.readFileSync(need(path.join(ROOT, 'src/content/outlines', `${paperId}.md`), 'outline'), 'utf8');
const paper = parse(fs.readFileSync(path.join(ROOT, 'src/content/papers', `${paperId}.md`), 'utf8').split(/^---$/m)[1]);
if (!paper.links?.pdf) {
  console.error(`papers/${paperId} has no links.pdf, so there is nothing for the outline page to show`);
  process.exit(1);
}

const poppler = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
const unescape = (s) =>
  s.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" })[e]);
const round = (n) => Math.round(n * 10) / 10;

// Every word of the paper with its box, in reading order, grouped into lines.
const words = [];
const lines = [];
const heights = [];
for (const m of poppler('pdftotext', ['-bbox-layout', pdf, '-']).matchAll(
  /<page width="[\d.]+" height="([\d.]+)"|<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"|<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g,
)) {
  if (m[1]) heights.push(Number(m[1]));
  else if (m[2]) lines.push({ p: heights.length, x0: +m[2], y0: +m[3], x1: +m[4], y1: +m[5], words: [] });
  else {
    lines.at(-1).words.push(words.length);
    words.push({ p: heights.length, line: lines.length - 1, x0: +m[6], y0: +m[7], x1: +m[8], y1: +m[9], t: unescape(m[10]) });
  }
}
// The left edge of the text block: where most lines start.
const starts = new Map();
for (const l of lines) starts.set(Math.round(l.x0), (starts.get(Math.round(l.x0)) ?? 0) + 1);
const margin = [...starts].sort((a, b) => b[1] - a[1])[0][0];
const first = (line) => words[line.words[0]]?.t;
const second = (line) => words[line.words[1]]?.t;

// The paper as one string of letters and digits, and the word each came from.
let doc = '';
const owner = [];
words.forEach((w, i) => {
  const s = skeleton(w.t);
  doc += s;
  for (let k = 0; k < s.length; k++) owner.push(i);
});

/** One rectangle per line of text between two words: [page, x, y, w, h]. */
function rects(from, to) {
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
}

function occurrences(key) {
  const found = [];
  for (let at = doc.indexOf(key); at !== -1; at = doc.indexOf(key, at + 1)) {
    found.push(rects(owner[at], owner[at + key.length - 1]));
  }
  return found;
}

// hyperref leaves a named destination for every heading, float and footnote.
// A heading's destination can sit at the foot of the page before it, and a
// float's is numbered across figures and tables together, so each is only
// where to start looking; the position kept is that of the text itself.
const named = [...poppler('pdfinfo', ['-dests', pdf]).matchAll(/^\s*(\d+) \[ XYZ\s+\S+\s+(\S+)\s+\S+\s*\] "([^"]+)"$/gm)].map(
  (m) => ({ page: +m[1], top: heights[m[1] - 1] - Number(m[2]), name: m[3] }),
);
const dests = {};
const at = (line, h = line.y1 - line.y0) => [line.p, round(line.y0), round(h)];

for (const d of named) {
  const heading = d.name.match(/^(?:sub)?section\.(\d(?:\.\d)?|[A-Z]\.\d)$|^appendix\.([A-Z])$/);
  if (heading) {
    const label = heading[1] ?? heading[2];
    // The number of a heading stands alone at the margin, with its title beside it.
    const line = lines.find(
      (l) =>
        (l.p > d.page || (l.p === d.page && l.y0 >= d.top - 3)) &&
        l.words.length === 1 &&
        first(l) === label &&
        Math.abs(l.x0 - margin) < 2 &&
        lines.some((title) => title.p === l.p && Math.abs(title.y0 - l.y0) < 1.5 && title.x0 > l.x1),
    );
    if (line) dests[`${/^[A-Z]/.test(label) ? 'app' : 'sec'}:${label}`] = at(line);
  }
  const note = d.name.match(/^Hfootnote\.(\d+)$/);
  if (note) {
    const line = lines.filter((l) => l.p === d.page && l.y0 >= d.top - 4).sort((a, b) => a.y0 - b.y0)[0];
    if (line) dests[`fn:${note[1]}`] = at(line);
  }
}

// A figure or table runs from the top of its float to the first line of its caption.
const floats = named.filter((d) => /^(figure|table)\.caption\./.test(d.name));
for (const line of lines) {
  const kind = { Figure: 'fig', Table: 'tab' }[first(line)];
  const n = second(line)?.match(/^(\d+):$/)?.[1];
  if (!kind || !n) continue;
  const top = floats
    .filter((d) => d.page === line.p && d.top <= line.y0 + 12)
    .map((d) => d.top)
    .sort((a, b) => b - a)[0];
  dests[`${kind}:${n}`] ??= top === undefined ? at(line) : [line.p, round(top), round(line.y1 - top)];
}

const abstract = lines.find((l) => l.p === 1 && l.words.length === 1 && first(l) === 'Abstract');
if (abstract) dests.abstract = at(abstract);

// What the outline cites. A line of markdown is one block of the page, and a
// figure's line is left out: its alt text and caption are the wiki's words.
const body = outline.split(/^---$/m).slice(2).join('---');
const quoted = new Map();
const located = new Set();
for (const line of body.split('\n')) {
  if (line.startsWith('![')) continue;
  for (const t of tokenize(line)) {
    if (t.type === 'quote' && t.key.length >= MIN_QUOTE) quoted.set(t.key, t.text);
    if (t.type === 'loc') located.add(t.dest);
  }
}

// A quotation that is not in the paper may be from one of the authors' threads.
const threadDir = path.join(ROOT, 'src/content/threads');
const threads = fs
  .readdirSync(threadDir)
  .map((f) => ({ id: f.replace(/\.json$/, ''), ...JSON.parse(fs.readFileSync(path.join(threadDir, f), 'utf8')) }))
  .filter((t) => t.papers?.includes(paperId) || paper.threads?.includes(t.id))
  .map((t) => skeleton(t.tweets.map((tw) => [tw.text, ...tw.images.map((i) => i.alt)].join(' ')).join(' ')))
  .join(' ');

const quotes = {};
const elsewhere = [];
const lost = [];
for (const [key, text] of quoted) {
  const found = occurrences(key);
  if (found.length) quotes[key] = found;
  else if (threads.includes(key)) elsewhere.push(key);
  else lost.push(text);
}
const missing = [...located].filter((d) => !dests[d]);

const xs = words.map((w) => [w.x0, w.x1]);
const out = {
  pdf: paper.links.pdf,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(pdf)).digest('hex'),
  pages: heights.length,
  // The band of the page that holds text. The reader crops the margins outside it.
  crop: [round(Math.min(...xs.map((x) => x[0]))), round(Math.max(...xs.map((x) => x[1])))],
  dests,
  quotes,
  elsewhere,
};

// One entry to a line, so that a change to the outline is a small diff.
const table = (o) => `{\n${Object.entries(o).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n  }`;
const file = path.join(ROOT, 'src/data/anchors', `${paperId}.json`);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(
  file,
  `{\n${Object.entries(out)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${k === 'dests' || k === 'quotes' ? table(v) : JSON.stringify(v)}`)
    .join(',\n')}\n}\n`,
);

console.log(
  `${path.relative(ROOT, file)}: ${Object.keys(quotes).length} quotations placed in the paper, ${elsewhere.length} found in its threads, ${Object.keys(dests).length} locations`,
);
for (const text of lost) console.log(`not in the paper or its threads: ${text}`);
for (const d of missing) console.log(`the outline cites ${d}, which the PDF does not have`);
process.exit(lost.length || missing.length ? 1 : 0);
