#!/usr/bin/env node
// Check page frontmatter and internal links without running a build.
//
//   node scripts/lint.mjs                  every paper, archived page, concept and thread
//   node scripts/lint.mjs <file> [...]     just these
//
// The build is the real authority (it validates against the Astro schema), but
// it takes over the whole working tree. This catches the common mistakes —
// a value outside a fixed vocabulary, a link to a page that does not exist —
// and is safe to run while other work is going on.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { MIN_QUOTE, tokenize } from '../src/lib/cite.mjs';
import { MAP_FENCE, parseMap } from '../src/lib/experiment-map.mjs';
import { EXPERIMENT_FENCE, parseExperiment } from '../src/lib/experiment.mjs';
import { CLAUDE_NOTE } from '../src/lib/remark-wiki.mjs';
import { METHOD_VALUES, STATUS_VALUES, TIER_VALUES } from '../src/lib/vocab.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');
const ids = (dir, ext) =>
  new Set(fs.readdirSync(path.join(CONTENT, dir)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length)));
const known = { papers: ids('papers', '.md'), archive: ids('archive', '.md'), concepts: ids('concepts', '.md'), threads: ids('threads', '.json') };
const STATIC_PAGES = new Set(['', 'papers', 'candidates', ...ids('pages', '.md')]);
// How many characters the headings of a table can have between them and still fit the page.
const TABLE_HEADINGS = 90;
const threadLength = (id) => JSON.parse(fs.readFileSync(path.join(CONTENT, 'threads', `${id}.json`), 'utf8')).tweets.length;

const files = process.argv.length > 2
  ? process.argv.slice(2).map((f) => path.resolve(f))
  : ['papers', 'archive', 'concepts', 'threads', 'pages'].flatMap((dir) =>
      fs.readdirSync(path.join(CONTENT, dir)).map((f) => path.join(CONTENT, dir, f)));

let problems = 0;
const say = (file, message) => {
  problems++;
  console.log(`${path.relative(ROOT, file)}: ${message}`);
};
const oneOf = (file, field, value, allowed) => {
  if (!allowed.includes(value)) say(file, `${field} is "${value}"; must be one of ${allowed.join(', ')}`);
};
const refs = (file, field, list, kind) => {
  for (const id of list ?? []) if (!known[kind].has(id)) say(file, `${field} names ${kind.slice(0, -1)} "${id}", which does not exist`);
};
const links = (file, body) => {
  // Experiment diagrams: the YAML must parse and use the fixed vocabulary.
  for (const [fence, check] of [[EXPERIMENT_FENCE, parseExperiment], [MAP_FENCE, parseMap]]) {
    for (const [, source] of body.matchAll(fence)) {
      try {
        const parsed = check(source);
        for (const node of parsed.nodes ?? []) {
          if (node.figure && !fs.existsSync(path.join(ROOT, 'public', node.figure.src))) say(file, `map figure ${node.figure.src} is not in public/`);
        }
      } catch (err) {
        say(file, err.message);
      }
    }
  }
  // Embedded thread posts: "::post <thread-id> <n>" alone on a line.
  for (const [line, id, n] of body.matchAll(/^::post\b[ \t]*(\S*)[ \t]*(\S*).*$/gm)) {
    if (!known.threads.has(id)) say(file, `"${line}" names thread "${id}", which does not exist`);
    else if (!/^\d+$/.test(n) || Number(n) < 1 || Number(n) > threadLength(id)) say(file, `"${line}": the thread has ${threadLength(id)} posts`);
  }
  // A note from the drafting model is boxed only if it opens with exactly the label.
  for (const [line] of body.matchAll(/^>[ \t]*\*\*Note\b.*$/gim)) {
    if (!line.startsWith(`> **${CLAUDE_NOTE}** `)) say(file, `"${line.slice(0, 40)}…" must open with "> **${CLAUDE_NOTE}** " to be boxed`);
  }
  // Figures: the file must exist, and needs alt text and a caption.
  for (const [, alt, src, title] of body.matchAll(/!\[([^\]]*)\]\((\/[^)\s]+)(?:\s+"([^"]*)")?\)/g)) {
    if (!fs.existsSync(path.join(ROOT, 'public', src))) say(file, `image ${src} is not in public/`);
    if (alt.length < 40) say(file, `image ${src} needs alt text that describes what the figure shows`);
    if (!title) say(file, `image ${src} needs a caption: ![alt](src "caption")`);
  }
  for (const [, target] of body.matchAll(/\]\((\/[^)\s#]*)(?:#[^)\s]*)?(?:\s+"[^"]*")?\)/g)) {
    const [, kind, id] = target.split('/');
    if (/\.[a-z0-9]+$/i.test(target)) continue; // a file such as /llms.txt
    if (id === undefined ? !STATIC_PAGES.has(kind) : !known[kind]?.has(id)) say(file, `links to ${target}, which does not exist`);
    if (target.length > 1 && target.endsWith('/')) say(file, `link ${target} has a trailing slash`);
  }
};

for (const file of files) {
  const kind = path.basename(path.dirname(file));
  const text = fs.readFileSync(file, 'utf8');

  if (kind === 'threads') {
    const t = JSON.parse(text);
    refs(file, 'papers', t.papers, 'papers');
    if (!t.summary) say(file, 'summary is empty');
    const blank = t.tweets.flatMap((tw) => tw.images).filter((i) => !i.alt).length;
    if (blank) say(file, `${blank} image(s) have no alt description`);
    continue;
  }

  const [, front, ...rest] = text.split(/^---$/m);
  const body = rest.join('---');
  let fm;
  try {
    fm = parse(front);
  } catch (err) {
    say(file, `frontmatter is not valid YAML: ${err.message}`);
    continue;
  }
  links(file, body);
  if (!fm.summary) say(file, 'summary is empty');
  if (kind === 'archive' && !known.papers.has(path.basename(file, '.md'))) {
    say(file, 'is an earlier version of a paper page that does not exist');
  }
  if (kind !== 'papers') continue;

  if (fm.format === 'outline') {
    // "At a glance" belongs to the earlier format.
    for (const f of ['questions', 'terms']) if (fm[f]) say(file, `${f} is not used by a page in the outline format; remove it`);
    if (!fm.links?.pdf) say(file, 'an outline page needs links.pdf, the file shown beside it');
    // The paper beside the page goes by what scripts/anchor.mjs found. A
    // quotation or locator added since the last run has no place in the paper.
    const id = path.basename(file, '.md');
    const placed = path.join(ROOT, 'src/data/anchors', `${id}.json`);
    if (!fs.existsSync(placed)) say(file, `has no src/data/anchors/${id}.json; run \`just paper ${id} <pdf-url>\` and \`just anchor ${id}\``);
    else {
      const anchors = JSON.parse(fs.readFileSync(placed, 'utf8'));
      if (anchors.pdf !== fm.links?.pdf) say(file, `links.pdf has changed since \`just anchor ${id}\` last ran`);
      const stale = body
        .split('\n')
        .filter((line) => !line.startsWith('!['))
        .flatMap((line) => tokenize(line))
        .filter((t) =>
          t.type === 'loc' ? !anchors.dests[t.dest] : t.type === 'quote' && t.key.length >= MIN_QUOTE && !anchors.quotes[t.key] && !anchors.elsewhere.includes(t.key),
        );
      for (const t of stale) say(file, `${t.text} has no place in the paper yet; run \`just anchor ${id}\``);
    }
    // The headings of a table are not wrapped, so long ones push the table past the page and under the paper.
    for (const [i, line] of body.split('\n').entries()) {
      if (!/^\|/.test(line) || !/^\|[\s:|-]+\|$/.test(body.split('\n')[i + 1] ?? '')) continue;
      const headings = line.split('|').slice(1, -1).map((h) => h.trim());
      const length = headings.join('').length;
      if (length > TABLE_HEADINGS) say(file, `the headings of the table "${headings.filter(Boolean)[0]} | …" run to ${length} characters and will not fit; keep them under ${TABLE_HEADINGS} together`);
    }
  } else if (fm.format) say(file, `format is "${fm.format}"; the only value is outline`);

  oneOf(file, 'tier', fm.tier, TIER_VALUES);
  oneOf(file, 'status', fm.status, STATUS_VALUES);
  refs(file, 'cites', fm.cites, 'papers');
  refs(file, 'concepts', fm.concepts, 'concepts');
  refs(file, 'threads', fm.threads, 'threads');
  if (fm.status === 'full') {
    if (!fm.sources?.length) say(file, 'a full page must list its sources');
    if (!fm.setup) say(file, 'a full page needs its setup (frontmatter `setup`)');
  }
  if (fm.questions) {
    const root = fm.questions;
    const check = (node, where) => {
      if (!node.q || !node.a) say(file, `questions: ${where} needs both a question (q) and an answer (a)`);
      for (const k of node.takeaways ?? []) {
        if (!k.title || !k.text) say(file, `questions: a takeaway under ${where} needs a title and text`);
        else if (!k.why) say(file, `questions: the takeaway "${k.title}" needs \`why\`: why it matters beyond the paper`);
        if (k.kind && !['finding', 'method'].includes(k.kind)) say(file, `questions: takeaway kind "${k.kind}" must be finding or method`);
      }
    };
    check(root, 'the leading question');
    for (const node of root.sub ?? []) {
      check(node, `"${node.q}"`);
      for (const leaf of node.sub ?? []) {
        check(leaf, `"${leaf.q}"`);
        if (leaf.sub?.length) say(file, `questions: "${leaf.q}" has sub-questions; the tree goes two levels below the leading question and no further`);
      }
    }
  }
  if (fm.takeaways) say(file, 'takeaways now go inside `questions`, under the question each one answers');
  for (const t of fm.terms ?? []) {
    if (!t.term || !t.means) say(file, 'terms: each entry needs a term and what it means');
    if (t.concept && !known.concepts.has(t.concept)) say(file, `terms: "${t.term}" names concept "${t.concept}", which does not exist`);
  }
  if (fm.evidence) say(file, 'the frontmatter key `evidence` is now `setup`');
  if (fm.setup) {
    const e = fm.setup;
    if (!e.reports_on) say(file, 'setup.reports_on is empty');
    for (const m of e.methods ?? []) oneOf(file, 'setup.methods', m, METHOD_VALUES);
    if (!e.methods?.length) say(file, 'setup.methods is empty');
    // The wiki does not label papers by which property they tested or by
    // stance; flag the old fields so they do not creep back.
    for (const f of ['faithfulness', 'grounding', 'privileged_access', 'stance', 'note']) {
      if (f in e) say(file, `setup.${f} is not used; remove it`);
    }
  }
}

console.log(problems ? `\n${problems} problem(s)` : `ok: ${files.length} file(s)`);
process.exit(problems ? 1 : 0);
