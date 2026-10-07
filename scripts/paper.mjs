#!/usr/bin/env node
// Fetch a paper and take stock of it: the first step of writing its page.
//
//   node scripts/paper.mjs <paper-id> <pdf-url>   fetch the PDF, then take stock
//   node scripts/paper.mjs <paper-id>             take stock of the PDF already fetched
//
// Writes, under data/raw/papers/<paper-id>/ (gitignored, never published):
//   paper.pdf   the paper, which every other script reads from here
//   paper.txt   its text, laid out as on the page, to read
// and prints the inventory the page is checked against: every section, figure,
// table and footnote with its page, the words each section gets, and the box
// each figure occupies.
//
// An arXiv link without a version is resolved to the latest version, and the
// script prints the versioned link. Put that one in the page's `links.pdf`:
// the page stores positions in this exact file, and the reader shows the file
// `links.pdf` names.
//
// Needs poppler's pdftotext and pdfinfo on the PATH.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { readPdf, shares } from './pdf.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const UA = 'introspection-wiki (+https://introspection.infinite.fun)';
const [paperId, given] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(paperId ?? '')) {
  console.error('usage: paper.mjs <paper-id> [pdf-url]');
  process.exit(1);
}
const dir = path.join(ROOT, 'data/raw/papers', paperId);
const pdf = path.join(dir, 'paper.pdf');

if (given) {
  let url = given;
  const arxiv = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(v\d+)?/);
  if (arxiv) {
    let version = arxiv[2];
    const feed = await (await fetch(`https://export.arxiv.org/api/query?id_list=${arxiv[1]}`, { headers: { 'User-Agent': UA } })).text();
    version ??= feed.match(new RegExp(`arxiv\\.org/abs/${arxiv[1].replace('.', '\\.')}(v\\d+)`))?.[1] ?? '';
    url = `https://arxiv.org/pdf/${arxiv[1]}${version}`;
    const field = (tag) => [...feed.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1].replace(/\s+/g, ' ').trim());
    console.log(`arXiv:${arxiv[1]}${version}`);
    console.log(`  title:     ${field('title')[1] ?? ''}`);
    console.log(`  authors:   ${field('name').join(', ')}`);
    console.log(`  posted:    ${(field('published')[0] ?? '').slice(0, 10)}`);
    console.log(`  links.pdf: ${url}`);
  }
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const bytes = Buffer.from(await res.arrayBuffer());
  if (!res.ok || bytes.subarray(0, 5).toString() !== '%PDF-') {
    console.error(`${url} did not return a PDF (${res.status} ${res.headers.get('content-type')})`);
    process.exit(1);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(pdf, bytes);
  console.log(`fetched ${url}`);
}
if (!fs.existsSync(pdf)) {
  console.error(`no PDF at ${path.relative(ROOT, pdf)}; give its link: paper.mjs ${paperId} <pdf-url>`);
  process.exit(1);
}
execFileSync('pdftotext', ['-layout', pdf, path.join(dir, 'paper.txt')]);

const p = readPdf(pdf);
const sha = crypto.createHash('sha256').update(fs.readFileSync(pdf)).digest('hex');
console.log(`\n${path.relative(ROOT, pdf)}: ${p.pages} pages, sha256 ${sha.slice(0, 16)}`);
console.log(`text to read: ${path.relative(ROOT, path.join(dir, 'paper.txt'))}`);

const ordered = Object.keys(p.dests).sort((a, b) => p.starts[a] - p.starts[b]);
const show = (kinds, heading, line) => {
  const keys = ordered.filter((k) => kinds.includes(k.split(':')[0]));
  if (!keys.length) return;
  console.log(`\n${heading}`);
  for (const k of keys) console.log(line(k, p.dests[k]));
};
const locator = (k) => {
  const [kind, n] = k.split(':');
  return { sec: `§${n}`, app: `Appendix ${n}`, fig: `Figure ${n}`, tab: `Table ${n}`, fn: `footnote ${n}`, abstract: 'Abstract' }[kind];
};
const clip = (s, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

show(['abstract', 'sec', 'app'], 'Sections', (k, [page]) => `  ${locator(k).padEnd(14)} p. ${String(page).padStart(2)}  ${k === 'abstract' ? '' : clip(p.titles[k])}`);
show(['fig', 'tab'], 'Figures and tables', (k, [page, top, h]) => {
  // What `figure.mjs auto` would cut: the float, down to just above its caption.
  const caption = top + h - 11;
  const box = k.startsWith('fig') ? `  box ${Math.round(p.margin - 6)} ${Math.round(top - 2)} ${Math.round(p.crop[1] - p.margin + 12)} ${Math.round(caption - top)}` : '';
  return `  ${locator(k).padEnd(14)} p. ${String(page).padStart(2)}${box}  ${clip(p.titles[k], 60)}`;
});
show(['fn'], 'Footnotes', (k, [page]) => `  ${locator(k).padEnd(14)} p. ${String(page).padStart(2)}  ${clip(p.titles[k])}`);

const rows = shares(p);
if (rows.length) {
  console.log('\nWords, and share of the main text');
  for (const r of rows) {
    console.log(`  ${(r.key === 'appendices' ? 'Appendices' : locator(r.key)).padEnd(14)} ${String(r.words).padStart(6)}${r.share === undefined ? '' : `  ${String(r.share).padStart(3)}%`}`);
  }
}
if (!ordered.some((k) => k.startsWith('sec'))) {
  console.log('\nNo numbered headings were found. The PDF may have no named destinations; locators will then have no place in it.');
}
