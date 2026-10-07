#!/usr/bin/env node
// Cut a figure out of a paper's PDF.
//
//   node scripts/figure.mjs page <paper-id> <page> [dpi]
//       Renders the page at 72 dpi to data/raw/papers/<paper-id>/pages/p<page>.png.
//       Open it and read off the figure's box. At 72 dpi one pixel is one PDF
//       point, so a US-letter page is 612 x 792. To read small print in a
//       figure, give a dpi (200 is enough); the file is then p<page>@<dpi>.png,
//       and boxes are still measured on the 72-dpi one.
//
//   node scripts/figure.mjs crop <paper-id> <page> <x> <y> <width> <height> <name>
//       Cuts that box (in the 72-dpi page's pixels) at 220 dpi and writes
//       public/figures/<paper-id>/<name>.png. Open the result and check the
//       edges: nothing clipped, no caption or body text included.
//
//   node scripts/figure.mjs auto <paper-id> <figure-number> <name>
//       Finds the figure in the PDF and cuts it: the width of the text block,
//       from the top of the float to just above its caption. It prints the
//       box it used. Check the edges the same way, and if a side is off, or
//       only one panel is wanted, run `crop` with the box adjusted.
//
// The PDF is expected at data/raw/papers/<paper-id>/paper.pdf (override with
// PAPER_PDF=/path/to.pdf). Needs poppler's pdftocairo on the PATH.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DPI = 220;
let [mode, paperId, page, ...rest] = process.argv.slice(2);
const usage = () => {
  console.error(
    'usage: figure.mjs page <paper-id> <page>\n       figure.mjs crop <paper-id> <page> <x> <y> <width> <height> <name>\n       figure.mjs auto <paper-id> <figure-number> <name>',
  );
  process.exit(1);
};
if (!paperId || !/^\d+$/.test(page ?? '')) usage();

const pdf = process.env.PAPER_PDF ?? path.join(ROOT, 'data/raw/papers', paperId, 'paper.pdf');
if (!fs.existsSync(pdf)) {
  console.error(`no PDF at ${pdf}`);
  process.exit(1);
}
if (mode === 'auto') {
  const { readPdf } = await import('./pdf.mjs');
  const found = readPdf(pdf);
  const at = found.dests[`fig:${page}`];
  if (!at) {
    console.error(`the PDF has no Figure ${page}`);
    process.exit(1);
  }
  const [onPage, top, height] = at;
  // The float ends at the first line of its caption, which is about 11 points tall.
  const box = [found.margin - 6, top - 2, found.crop[1] - found.margin + 12, height - 11].map(Math.round);
  console.log(`Figure ${page}: page ${onPage}, box ${box.join(' ')}`);
  [mode, page, rest] = ['crop', String(onPage), [...box, rest[0]]];
}
const cairo = (args, out) => execFileSync('pdftocairo', ['-png', '-singlefile', '-f', page, '-l', page, ...args, pdf, out]);

if (mode === 'page') {
  const dir = path.join(ROOT, 'data/raw/papers', paperId, 'pages');
  fs.mkdirSync(dir, { recursive: true });
  const dpi = /^\d+$/.test(rest[0] ?? '') ? rest[0] : '72';
  const name = dpi === '72' ? `p${page}` : `p${page}@${dpi}`;
  cairo(['-r', dpi], path.join(dir, name));
  console.log(path.join(dir, `${name}.png`));
} else if (mode === 'crop') {
  const [x, y, w, h] = rest.slice(0, 4).map(Number);
  const name = rest[4];
  if (![x, y, w, h].every(Number.isFinite) || !/^[a-z0-9-]+$/.test(name ?? '')) usage();
  const scale = (n) => String(Math.round((n * DPI) / 72));
  const dir = path.join(ROOT, 'public/figures', paperId);
  fs.mkdirSync(dir, { recursive: true });
  cairo(['-r', String(DPI), '-x', scale(x), '-y', scale(y), '-W', scale(w), '-H', scale(h)], path.join(dir, name));
  console.log(`/figures/${paperId}/${name}.png`);
} else usage();
