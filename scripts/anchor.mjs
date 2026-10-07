#!/usr/bin/env node
// Find where a paper page's locators and quotations sit in the paper's PDF,
// and check the page against the paper while at it.
//
//   node scripts/anchor.mjs <paper-id>
//
// Reads src/content/papers/<paper-id>.md and the paper's PDF, and writes
// src/data/anchors/<paper-id>.json: for every section, figure, table and
// footnote its page and height on the page, and for every quotation on the
// page the rectangles its words occupy. The paper page uses these to show the
// paper beside it and to mark whatever the reader clicks.
//
// Run it again whenever the page's quotations or locators change. It checks
// four things. Two stop it with an error:
//   - a quotation that is in neither the paper nor its threads;
//   - a locator the paper does not have ("Figure 9" in a paper with eight).
// Two are listed for the writer to look at:
//   - parts of the paper the page never mentions;
//   - numbers on the page that are in neither the paper nor its threads.
//
// The PDF is expected at data/raw/papers/<paper-id>/paper.pdf, where
// `just paper` puts it (override with PAPER_PDF=/path/to.pdf), and must be the
// file the page links as `pdf`. Only positions are written, never the paper's
// text.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { MIN_QUOTE, skeleton, tokenize } from '../src/lib/cite.mjs';
import { numbers, readPdf } from './pdf.mjs';

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
const file = need(process.env.PAPER_PDF ?? path.join(ROOT, 'data/raw/papers', paperId, 'paper.pdf'), 'PDF');
const [, front, ...rest] = fs.readFileSync(need(path.join(ROOT, 'src/content/papers', `${paperId}.md`), 'paper page'), 'utf8').split(/^---$/m);
const paper = parse(front);
if (!paper.links?.pdf) {
  console.error(`papers/${paperId} has no links.pdf, so there is no paper to show beside the page`);
  process.exit(1);
}
const pdf = readPdf(file);

// What the page cites. A line of markdown is one block of the page. A figure's
// line is left out, since its alt text and caption are the wiki's words, and
// so is a note, which is the drafting model's.
const body = rest.join('---');
const quoted = new Map();
const located = new Set();
const figures = new Set();
const stated = new Set();
for (const line of body.split('\n')) {
  if (line.startsWith('![')) {
    for (const t of tokenize(line.match(/"([^"]*)"\)\s*$/)?.[1] ?? '')) if (t.type === 'loc') figures.add(t.dest);
    continue;
  }
  let prose = '';
  for (const t of tokenize(line)) {
    if (t.type === 'quote' && t.key.length >= MIN_QUOTE) quoted.set(t.key, t.text);
    if (t.type === 'loc') located.add(t.dest);
    if (t.type === 'text') prose += t.text;
  }
  if (!line.startsWith('> ')) for (const n of numbers(prose.replace(/\]\([^)]*\)/g, ']'))) stated.add(n);
}

// A quotation or a number that is not in the paper may be from one of the authors' threads.
const threadDir = path.join(ROOT, 'src/content/threads');
const threadText = fs
  .readdirSync(threadDir)
  .map((f) => ({ id: f.replace(/\.json$/, ''), ...JSON.parse(fs.readFileSync(path.join(threadDir, f), 'utf8')) }))
  .filter((t) => t.papers?.includes(paperId) || paper.threads?.includes(t.id))
  .map((t) => t.tweets.map((tw) => [tw.text, ...tw.images.map((i) => i.alt)].join(' ')).join(' '))
  .join(' ');
const threads = skeleton(threadText);

const quotes = {};
const elsewhere = [];
const lost = [];
for (const [key, text] of quoted) {
  const found = pdf.find(key);
  if (found.length) quotes[key] = found;
  else if (threads.includes(key)) elsewhere.push(key);
  else lost.push(text);
}
const missing = [...located, ...figures].filter((d) => !pdf.dests[d]);

const out = {
  pdf: paper.links.pdf,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  pages: pdf.pages,
  // The band of the page that holds text. The reader crops the margins outside it.
  crop: pdf.crop,
  dests: pdf.dests,
  quotes,
  elsewhere,
};

// One entry to a line, so that a change to the page is a small diff.
const table = (o) => `{\n${Object.entries(o).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')}\n  }`;
const target = path.join(ROOT, 'src/data/anchors', `${paperId}.json`);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(
  target,
  `{\n${Object.entries(out)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${k === 'dests' || k === 'quotes' ? table(v) : JSON.stringify(v)}`)
    .join(',\n')}\n}\n`,
);

console.log(
  `${path.relative(ROOT, target)}: ${Object.keys(quotes).length} quotations placed in the paper, ${elsewhere.length} found in its threads, ${Object.keys(pdf.dests).length} locations`,
);
for (const text of lost) console.log(`not in the paper or its threads: ${text}`);
for (const d of missing) console.log(`the page cites ${d}, which the PDF does not have`);

const name = (key) => {
  const [kind, n] = key.split(':');
  return { sec: `§${n}`, app: `Appendix ${n}`, fig: `Figure ${n}`, tab: `Table ${n}`, fn: `footnote ${n}`, abstract: 'Abstract' }[kind];
};
const unmentioned = Object.keys(pdf.dests)
  .filter((k) => !located.has(k) && !figures.has(k))
  .sort((a, b) => pdf.starts[a] - pdf.starts[b]);
if (unmentioned.length) console.log(`\nnever mentioned on the page: ${unmentioned.map(name).join(', ')}`);

const inPaper = new Set(pdf.words.flatMap((w) => numbers(w.t)));
const inThreads = new Set(numbers(threadText));
const unsourced = [...stated].filter((n) => !inPaper.has(n) && !inThreads.has(n));
if (unsourced.length) console.log(`\nnumbers on the page that are not in the paper or its threads: ${unsourced.join(', ')}`);

process.exit(lost.length || missing.length ? 1 : 0);
