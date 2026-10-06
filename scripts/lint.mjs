#!/usr/bin/env node
// Check page frontmatter and internal links without running a build.
//
//   node scripts/lint.mjs                  every paper, concept and thread
//   node scripts/lint.mjs <file> [...]     just these
//
// The build is the real authority (it validates against the Astro schema), but
// it takes over the whole working tree. This catches the common mistakes —
// a value outside a fixed vocabulary, a link to a page that does not exist —
// and is safe to run while other work is going on.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { MAP_FENCE, parseMap } from '../src/lib/experiment-map.mjs';
import { EXPERIMENT_FENCE, parseExperiment } from '../src/lib/experiment.mjs';
import { LEVEL_VALUES, METHOD_VALUES, STANCE_VALUES, STATUS_VALUES, TIER_VALUES } from '../src/lib/vocab.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');
const ids = (dir, ext) =>
  new Set(fs.readdirSync(path.join(CONTENT, dir)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length)));
const known = { papers: ids('papers', '.md'), concepts: ids('concepts', '.md'), threads: ids('threads', '.json') };
const STATIC_PAGES = new Set(['', 'papers', 'frontier', ...ids('pages', '.md')]);
const threadLength = (id) => JSON.parse(fs.readFileSync(path.join(CONTENT, 'threads', `${id}.json`), 'utf8')).tweets.length;

const files = process.argv.length > 2
  ? process.argv.slice(2).map((f) => path.resolve(f))
  : ['papers', 'concepts', 'threads', 'pages'].flatMap((dir) =>
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
  if (kind !== 'papers') continue;

  oneOf(file, 'tier', fm.tier, TIER_VALUES);
  oneOf(file, 'status', fm.status, STATUS_VALUES);
  refs(file, 'cites', fm.cites, 'papers');
  refs(file, 'concepts', fm.concepts, 'concepts');
  refs(file, 'threads', fm.threads, 'threads');
  if (fm.status === 'full') {
    if (!fm.sources?.length) say(file, 'a full page must list its sources');
    if (!fm.evidence) say(file, 'a full page needs an evidence card');
  }
  if (fm.evidence) {
    const e = fm.evidence;
    if (!e.reports_on) say(file, 'evidence.reports_on is empty');
    for (const m of e.methods ?? []) oneOf(file, 'evidence.methods', m, METHOD_VALUES);
    if (!e.methods?.length) say(file, 'evidence.methods is empty');
    for (const f of ['faithfulness', 'grounding', 'privileged_access']) oneOf(file, `evidence.${f}`, e[f], LEVEL_VALUES);
    oneOf(file, 'evidence.stance', e.stance, STANCE_VALUES);
  }
}

console.log(problems ? `\n${problems} problem(s)` : `ok: ${files.length} file(s)`);
process.exit(problems ? 1 : 0);
