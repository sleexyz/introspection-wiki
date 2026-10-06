import { getCollection, type CollectionEntry } from 'astro:content';
import crawledEdges from '../data/edges.json';
import frontierData from '../data/frontier.json';

export const SITE = {
  name: 'LLM Introspection Wiki',
  url: 'https://introspection.infinite.fun',
  repo: 'https://github.com/sleexyz/introspection-wiki',
  description:
    'Papers and resources on introspection in large language models: the ability of a model to report on its own internal states in a way that is both faithful and causally grounded.',
};

export type Paper = CollectionEntry<'papers'>;
export type Concept = CollectionEntry<'concepts'>;
export type Thread = CollectionEntry<'threads'>;
export type Tier = Paper['data']['tier'];

export type Candidate = {
  key: string;
  title: string;
  year?: number;
  authors?: string[];
  author_count?: number;
  url?: string;
  arxiv?: string;
  citation_count?: number;
  cited_by: string[];
  cites: string[];
  score: number;
  found_via: string;
  note?: string;
  triage: string;
};

export const frontier = frontierData as {
  generated: string;
  source: string;
  min_score: number;
  neighbors_seen: number;
  missing: string[];
  candidates: Candidate[];
};

export const TIERS: { tier: Tier; label: string; blurb: string }[] = [
  { tier: 'seed', label: 'Seed', blurb: 'The paper this wiki grew from.' },
  { tier: 'core', label: 'Core', blurb: 'Work on introspection itself.' },
  { tier: 'adjacent', label: 'Adjacent', blurb: 'Neighboring questions the core work leans on.' },
];

export type Wiki = {
  papers: Paper[];
  concepts: Concept[];
  threads: Thread[];
  paper: Map<string, Paper>;
  /** paper id -> ids of the wiki papers it cites */
  cites: Map<string, string[]>;
  /** paper id -> ids of the wiki papers that cite it */
  citedBy: Map<string, string[]>;
};

let cached: Promise<Wiki> | undefined;

/** Everything on the site, cross-checked. Throws on a link to a page that does not exist. */
export function loadWiki(): Promise<Wiki> {
  return (cached ??= build());
}

async function build(): Promise<Wiki> {
  const [papers, concepts, threads] = await Promise.all([
    getCollection('papers'),
    getCollection('concepts'),
    getCollection('threads'),
  ]);
  const tierRank = (p: Paper) => TIERS.findIndex((t) => t.tier === p.data.tier);
  papers.sort((a, b) => tierRank(a) - tierRank(b) || a.data.year - b.data.year || a.id.localeCompare(b.id));
  concepts.sort((a, b) => a.data.title.localeCompare(b.data.title));
  threads.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const paper = new Map(papers.map((p) => [p.id, p]));
  const conceptIds = new Set(concepts.map((c) => c.id));
  const threadIds = new Set(threads.map((t) => t.id));
  const need = (ok: boolean, from: string, kind: string, id: string) => {
    if (!ok) throw new Error(`${from} points at ${kind} "${id}", which does not exist`);
  };

  const pairs = new Set<string>();
  for (const p of papers) {
    for (const id of p.data.cites) {
      need(paper.has(id), `papers/${p.id}`, 'paper', id);
      pairs.add(`${p.id} ${id}`);
    }
    for (const id of p.data.concepts) need(conceptIds.has(id), `papers/${p.id}`, 'concept', id);
    for (const id of p.data.threads) need(threadIds.has(id), `papers/${p.id}`, 'thread', id);
  }
  for (const t of threads) for (const id of t.data.papers) need(paper.has(id), `threads/${t.id}`, 'paper', id);
  // The crawler's edges are a snapshot; a page renamed since then just drops out.
  for (const [from, to] of crawledEdges as string[][]) if (paper.has(from) && paper.has(to)) pairs.add(`${from} ${to}`);

  const cites = new Map<string, string[]>(papers.map((p) => [p.id, []]));
  const citedBy = new Map<string, string[]>(papers.map((p) => [p.id, []]));
  for (const pair of pairs) {
    const [from, to] = pair.split(' ');
    cites.get(from)!.push(to);
    citedBy.get(to)!.push(from);
  }
  const order = new Map(papers.map((p, i) => [p.id, i]));
  for (const list of [...cites.values(), ...citedBy.values()]) list.sort((a, b) => order.get(a)! - order.get(b)!);

  return { papers, concepts, threads, paper, cites, citedBy };
}

const lastName = (name: string) => name.trim().split(/\s+/).pop()!;

/** "Lindsey (2025)", "Comsa & Shanahan (2025)", "Binder et al. (2024)". */
export function citeAs(p: Paper): string {
  const { authors, year } = p.data;
  const who =
    authors.length === 1
      ? lastName(authors[0])
      : authors.length === 2
        ? `${lastName(authors[0])} & ${lastName(authors[1])}`
        : `${lastName(authors[0])} et al.`;
  return `${who} (${year})`;
}

export function paperLinks(p: Paper): { label: string; href: string }[] {
  const l = p.data.links;
  const host = (u: string) => new URL(u).hostname.replace(/^www\./, '');
  return [
    l.arxiv && { label: `arXiv:${l.arxiv}`, href: `https://arxiv.org/abs/${l.arxiv}` },
    l.doi && { label: 'DOI', href: `https://doi.org/${l.doi}` },
    l.url && { label: host(l.url), href: l.url },
    l.project && { label: 'project page', href: l.project },
    l.pdf && { label: 'PDF', href: l.pdf },
    l.code && { label: 'code', href: l.code },
    l.s2 && { label: 'Semantic Scholar', href: `https://www.semanticscholar.org/paper/${l.s2}` },
  ].filter((x): x is { label: string; href: string } => Boolean(x));
}

/** The one link to send a reader to for the paper itself. */
export function primaryLink(p: Paper): string | undefined {
  const l = p.data.links;
  return l.url ?? l.project ?? (l.arxiv ? `https://arxiv.org/abs/${l.arxiv}` : l.doi ? `https://doi.org/${l.doi}` : l.pdf);
}

const NAMES_A_YEAR = /\b(?:19|20)\d{2}\b/;

/** "arXiv 2025", or just "ICLR 2025" when the venue already names its year. */
export function venueLine(p: Paper): string {
  const { venue, year } = p.data;
  if (!venue) return String(year);
  return NAMES_A_YEAR.test(venue) ? venue : `${venue} ${year}`;
}

export function statusLine(p: Paper): string {
  if (p.data.status === 'stub') return 'Stub: no summary yet';
  return p.data.reviewed ? 'Summary reviewed by a person' : 'AI-drafted summary, not yet reviewed by a person';
}

// Frontmatter dates parse as UTC midnight; formatting them in the build
// machine's timezone would show every date a day early west of Greenwich.
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const longDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export const EVIDENCE_LABELS = {
  tested: 'tested',
  argued: 'argued, not tested',
  'not-addressed': 'not addressed',
} as const;

export function bibtex(p: Paper): string {
  const { title, authors, year, venue, links } = p.data;
  const key = p.id.split('-')[0];
  const proceedings = Boolean(venue && NAMES_A_YEAR.test(venue));
  const article = Boolean(venue) && !proceedings && !/arxiv|lesswrong|thread/i.test(venue!);
  const fields: [string, string | undefined][] = [
    ['title', `{${title}}`],
    ['author', authors.join(' and ')],
    ['year', String(year)],
    [proceedings ? 'booktitle' : article ? 'journal' : 'howpublished', venue],
    ['eprint', links.arxiv],
    ['archivePrefix', links.arxiv && 'arXiv'],
    ['doi', links.doi],
    ['url', primaryLink(p)],
  ];
  const body = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(',\n');
  return `@${proceedings ? 'inproceedings' : article ? 'article' : 'misc'}{${key},\n${body}\n}`;
}
