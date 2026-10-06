#!/usr/bin/env node
// Cut a figure out of a paper's PDF.
//
//   node scripts/figure.mjs page <paper-id> <page>
//       Renders the page at 72 dpi to data/raw/papers/<paper-id>/pages/p<page>.png.
//       Open it and read off the figure's box. At 72 dpi one pixel is one PDF
//       point, so a US-letter page is 612 x 792.
//
//   node scripts/figure.mjs crop <paper-id> <page> <x> <y> <width> <height> <name>
//       Cuts that box (in the 72-dpi page's pixels) at 220 dpi and writes
//       public/figures/<paper-id>/<name>.png. Open the result and check the
//       edges: nothing clipped, no caption or body text included.
//
// The PDF is expected at data/raw/papers/<paper-id>/paper.pdf (override with
// PAPER_PDF=/path/to.pdf). Needs poppler's pdftocairo on the PATH.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DPI = 220;
const [mode, paperId, page, ...rest] = process.argv.slice(2);
const usage = () => {
  console.error('usage: figure.mjs page <paper-id> <page>\n       figure.mjs crop <paper-id> <page> <x> <y> <width> <height> <name>');
  process.exit(1);
};
if (!paperId || !/^\d+$/.test(page ?? '')) usage();

const pdf = process.env.PAPER_PDF ?? path.join(ROOT, 'data/raw/papers', paperId, 'paper.pdf');
if (!fs.existsSync(pdf)) {
  console.error(`no PDF at ${pdf}`);
  process.exit(1);
}
const cairo = (args, out) => execFileSync('pdftocairo', ['-png', '-singlefile', '-f', page, '-l', page, ...args, pdf, out]);

if (mode === 'page') {
  const dir = path.join(ROOT, 'data/raw/papers', paperId, 'pages');
  fs.mkdirSync(dir, { recursive: true });
  cairo(['-r', '72'], path.join(dir, `p${page}`));
  console.log(path.join(dir, `p${page}.png`));
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
