#!/usr/bin/env node
// Crawl one hop out from the wiki's papers and rebuild the frontier.
//
//   node scripts/crawl.mjs             fetch whatever is missing, then rebuild
//   node scripts/crawl.mjs --offline   rebuild from the cache only
//   node scripts/crawl.mjs --refresh   refetch everything
//
// For every paper page it asks Semantic Scholar for the paper's references and
// for the papers that cite it. Anything that is not already a page becomes a
// candidate, scored by how many distinct wiki papers it touches. Candidates
// touching two or more land in src/data/frontier.json; in-wiki citation edges
// land in src/data/edges.json.
//
// Raw responses are cached under data/raw/s2/ (gitignored), so an interrupted
// run resumes where it stopped. Without S2_API_KEY the shared pool is heavily
// throttled and a cold crawl can take a long time — a run that gives up on some
// papers still writes the frontier and lists what is missing.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAPERS = path.join(ROOT, 'src/content/papers');
const CACHE = path.join(ROOT, 'data/raw/s2');
const DATA = path.join(ROOT, 'src/data');

const API = 'https://api.semanticscholar.org/graph/v1';
const FIELDS = 'paperId,title,year,publicationDate,externalIds,citationCount,authors';
const UA = 'introspection-wiki (+https://introspection.infinite.fun)';
const MIN_SCORE = 2;
const MAX_ATTEMPTS = 25;

const args = new Set(process.argv.slice(2));
const offline = args.has('--offline');
const refresh = args.has('--refresh');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback);
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 1) + '\n');

function loadPapers() {
  return fs
    .readdirSync(PAPERS)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const text = fs.readFileSync(path.join(PAPERS, f), 'utf8');
      const fm = parse(text.split(/^---$/m)[1]);
      return { id: f.replace(/\.md$/, ''), ...fm, links: fm.links ?? {} };
    });
}

/** The identifier Semantic Scholar should look this paper up by, if any. */
function s2Id({ links }) {
  if (links.s2) return links.s2;
  if (links.arxiv) return `arXiv:${links.arxiv}`;
  if (links.doi) return `DOI:${links.doi}`;
  return null;
}

async function s2(pathname) {
  const headers = { 'User-Agent': UA };
  if (process.env.S2_API_KEY) headers['x-api-key'] = process.env.S2_API_KEY;
  let delay = 4000;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let status = 0;
    try {
      const res = await fetch(API + pathname, { headers, signal: AbortSignal.timeout(45_000) });
      if (res.ok) return await res.json();
      status = res.status;
    } catch {
      // network error or timeout: treat like a throttle and retry
    }
    if (status === 404) return null;
    if (status && status !== 429 && status < 500) throw new Error(`S2 ${status} for ${pathname}`);
    await sleep(delay);
    delay = Math.min(delay * 1.5, 60_000);
  }
  throw new Error(`S2 kept throttling ${pathname}`);
}

/** One direction of one paper's neighborhood, from cache or the API. */
async function neighbors(paper, kind) {
  const file = path.join(CACHE, `${paper.id}.${kind}.json`);
  if (!refresh && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (offline) return null;
  const id = s2Id(paper);
  if (!id) return null;
  const field = kind === 'references' ? 'citedPaper' : 'citingPaper';
  const out = [];
  for (let offset = 0; offset !== undefined; ) {
    const page = await s2(`/paper/${encodeURIComponent(id)}/${kind}?fields=${FIELDS}&limit=1000&offset=${offset}`);
    if (!page) break;
    out.push(...(page.data ?? []).map((row) => row[field]).filter(Boolean));
    offset = page.next;
  }
  writeJson(file, out);
  await sleep(1500);
  return out;
}

/**
 * Semantic Scholar has no reference list for some preprints. arXiv's HTML
 * rendering does: each bibliography item is a run of `ltx_bibblock` spans —
 * authors, then title, then venue — so the second block is the title.
 */
async function arxivBibliography(paper) {
  const file = path.join(CACHE, `${paper.id}.bib.json`);
  if (!refresh && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (offline || !paper.links.arxiv) return null;
  const res = await fetch(`https://arxiv.org/html/${paper.links.arxiv}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const titles = parseBibliography(await res.text());
  writeJson(file, titles);
  return titles;
}

export function parseBibliography(html) {
  const text = (s) =>
    s
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#x27;|&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[.,]$/, '')
      // Some styles fold the date into the title block: "…classification, 2021".
      .replace(/,\s*(?:[a-z]{3,9}\.?\s+)?(?:19|20)\d{2}$/i, '');
  return html
    .split(/<li[^>]*class="ltx_bibitem"/)
    .slice(1)
    .map((item) => item.split('</li>')[0].split(/<span class="ltx_bibblock">/)[2])
    .filter(Boolean)
    .map(text)
    .filter((t) => t.length > 8)
    .map((title) => ({ paperId: null, title }));
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const papers = loadPapers();

  // Every way a neighbor might turn out to be a page we already have.
  const wikiBy = new Map();
  for (const p of papers) {
    if (p.links.s2) wikiBy.set(`s2:${p.links.s2}`, p.id);
    if (p.links.arxiv) wikiBy.set(`arxiv:${p.links.arxiv}`, p.id);
    wikiBy.set(`t:${norm(p.title)}`, p.id);
  }
  const wikiId = (n) =>
    wikiBy.get(`s2:${n.paperId}`) ?? wikiBy.get(`arxiv:${n.externalIds?.ArXiv}`) ?? wikiBy.get(`t:${norm(n.title)}`);

  const candidates = new Map();
  const byTitle = new Map();
  const edges = new Set();
  const missing = [];

  const touch = (n, wikiPaper, direction) => {
    if (!n.title) return;
    const title = norm(n.title);
    let key = n.paperId ? `s2:${n.paperId}` : byTitle.get(title) ?? `t:${title}`;
    if (!candidates.has(key) && byTitle.has(title)) key = byTitle.get(title);
    let c = candidates.get(key);
    if (!c) {
      c = { key, title: n.title, cited_by: new Set(), cites: new Set() };
      candidates.set(key, c);
      byTitle.set(title, key);
    }
    if (n.paperId) {
      c.year ??= n.year ?? undefined;
      c.arxiv ??= n.externalIds?.ArXiv;
      c.doi ??= n.externalIds?.DOI;
      c.s2 ??= n.paperId;
      c.citation_count ??= n.citationCount ?? undefined;
      c.authors ??= (n.authors ?? []).slice(0, 3).map((a) => a.name);
      c.author_count ??= (n.authors ?? []).length;
    }
    c[direction].add(wikiPaper.id);
  };

  for (const paper of papers) {
    for (const kind of ['references', 'citations']) {
      let list = null;
      try {
        list = await neighbors(paper, kind);
        if (kind === 'references' && list && list.length === 0) list = (await arxivBibliography(paper)) ?? list;
      } catch (err) {
        console.error(`  ${paper.id} ${kind}: ${err.message}`);
      }
      if (!list) {
        if (s2Id(paper)) missing.push(`${paper.id} (${kind})`);
        continue;
      }
      console.error(`${paper.id} ${kind}: ${list.length}`);
      for (const n of list) {
        const other = wikiId(n);
        if (other === paper.id) continue;
        if (other) edges.add(kind === 'references' ? `${paper.id} ${other}` : `${other} ${paper.id}`);
        else touch(n, paper, kind === 'references' ? 'cited_by' : 'cites');
      }
    }
  }

  // Leads are candidates someone found by other means (a search, a thread).
  for (const lead of readJson(path.join(DATA, 'leads.json'), [])) {
    const key =
      [...candidates.values()].find((c) => (lead.arxiv && c.arxiv === lead.arxiv) || norm(c.title) === norm(lead.title))
        ?.key ?? `t:${norm(lead.title)}`;
    const c = candidates.get(key) ?? { key, title: lead.title, cited_by: new Set(), cites: new Set() };
    Object.assign(c, { lead: true, found_via: lead.found_via, lead_note: lead.note });
    c.arxiv ??= lead.arxiv;
    c.year ??= lead.year;
    c.url ??= lead.url;
    candidates.set(key, c);
  }

  const triage = readJson(path.join(DATA, 'triage.json'), {});
  const frontier = [...candidates.values()]
    .map((c) => {
      const cited_by = [...c.cited_by].sort();
      const cites = [...c.cites].sort();
      const url =
        c.url ??
        (c.arxiv ? `https://arxiv.org/abs/${c.arxiv}` : c.doi ? `https://doi.org/${c.doi}` : c.s2 ? `https://www.semanticscholar.org/paper/${c.s2}` : undefined);
      return {
        key: c.key,
        title: c.title,
        year: c.year,
        authors: c.authors,
        author_count: c.author_count,
        url,
        arxiv: c.arxiv,
        citation_count: c.citation_count,
        cited_by,
        cites,
        score: new Set([...cited_by, ...cites]).size,
        found_via: c.lead ? c.found_via ?? 'lead' : 'citation-graph',
        note: triage[c.key]?.note ?? c.lead_note,
        triage: triage[c.key]?.triage ?? 'unreviewed',
      };
    })
    .filter((c) => c.score >= MIN_SCORE || c.found_via !== 'citation-graph' || triage[c.key])
    .sort((a, b) => b.score - a.score || (b.citation_count ?? 0) - (a.citation_count ?? 0) || a.title.localeCompare(b.title));

  writeJson(path.join(DATA, 'frontier.json'), {
    generated: new Date().toISOString().slice(0, 10),
    source: 'Semantic Scholar Graph API, with arXiv HTML bibliographies where Semantic Scholar has no reference list',
    min_score: MIN_SCORE,
    neighbors_seen: candidates.size,
    missing,
    candidates: frontier,
  });
  writeJson(
    path.join(DATA, 'edges.json'),
    [...edges].sort().map((e) => e.split(' ')),
  );
  console.error(
    `\n${candidates.size} neighbors seen, ${frontier.length} on the frontier, ${edges.size} in-wiki edges` +
      (missing.length ? `\nnot crawled yet: ${missing.join(', ')}` : ''),
  );
}

if (import.meta.filename === process.argv[1]) await main();
