import { getEntry } from 'astro:content';
import { POST_LINE } from './remark-wiki.mjs';
import {
  SITE,
  TIERS,
  EVIDENCE_LABELS,
  bibtex,
  citeAs,
  frontier,
  isoDate,
  loadWiki,
  paperLinks,
  statusLine,
  type Candidate,
  type Concept,
  type Paper,
  type Thread,
} from './wiki';

// The markdown twin of every page. These are written for a reader that only
// gets text: links are absolute and point at other twins, structured fields are
// spelled out as lists and tables, and figures appear as their descriptions.

/** Rewrite site-relative links to absolute ones, pointing pages at their twins. */
export function absolutize(md: string): string {
  return md.replace(/\]\(\/([^)\s#]*)(#[^)\s]*)?(\s+"[^"]*")?\)/g, (_, path: string, hash = '', title = '') => {
    if (path === '') return `](${SITE.url}/index.md${hash})`;
    const isFile = /\.[a-z0-9]+$/i.test(path);
    return `](${SITE.url}/${path}${isFile ? '' : '.md'}${hash}${title})`;
  });
}

const quoted = (s: string) => s.split('\n').map((l) => `> ${l}`.trimEnd()).join('\n');

/**
 * A page body embeds thread posts with `::post <thread-id> <n>` lines (see
 * remark-wiki.mjs). In HTML those become X embeds; here they become the post's
 * text, quoted, with the description of its figure.
 */
function expandPosts(body: string, threads: Thread[]): string {
  return body.replace(new RegExp(POST_LINE.source, 'gm'), (line, id: string, n: string) => {
    const thread = threads.find((t) => t.id === id);
    const tweet = thread?.data.tweets[Number(n) - 1];
    if (!thread || !tweet) return line;
    const { name, handle } = thread.data.author;
    return [
      `Post ${n} of ${thread.data.tweets.length} by ${name} (@${handle}), ${tweet.url}:`,
      '',
      quoted(tweet.text),
      ...tweet.images.filter((img) => img.alt).flatMap((img) => ['', `Figure in the post: ${img.alt}`]),
    ].join('\n');
  });
}

export const mdResponse = (body: string) =>
  new Response(body.trimEnd() + '\n', { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });

const paperLine = (p: Paper) => `- [${citeAs(p)}: ${p.data.title}](/papers/${p.id}): ${p.data.summary}`;

const footer = (path: string) =>
  `---\n\nSource: ${SITE.url}${path} · Part of the [${SITE.name}](/) · Index for agents: [llms.txt](/llms.txt)`;

export async function paperMarkdown(p: Paper): Promise<string> {
  const wiki = await loadWiki();
  const d = p.data;
  const out: string[] = [`# ${d.title}`, '', `> ${d.summary}`, ''];

  out.push(`- Authors: ${d.authors.join(', ')}`);
  out.push(`- Published: ${[d.venue, d.date ? isoDate(d.date) : !d.venue?.includes(String(d.year)) && d.year].filter(Boolean).join(', ')}`);
  out.push(`- Links: ${paperLinks(p).map((l) => `[${l.label}](${l.href})`).join(' · ')}`);
  out.push(`- Tier: ${d.tier}`);
  out.push(`- Page status: ${statusLine(p)}`);
  if (d.sources.length) out.push(`- Written from: ${d.sources.join('; ')}`);
  if (d.concepts.length) {
    const titles = d.concepts.map((id) => wiki.concepts.find((c) => c.id === id)!);
    out.push(`- Concepts: ${titles.map((c) => `[${c.data.title}](/concepts/${c.id})`).join(', ')}`);
  }
  out.push('');

  if (d.evidence) {
    const e = d.evidence;
    out.push(
      '## Evidence card',
      '',
      '| | |',
      '|---|---|',
      `| What the model reports on | ${e.reports_on} |`,
      `| Methods | ${e.methods.join(', ')} |`,
      `| Faithfulness (does the report match the model's behavior?) | ${EVIDENCE_LABELS[e.faithfulness]} |`,
      `| Grounding (is the report caused by the state it describes?) | ${EVIDENCE_LABELS[e.grounding]} |`,
      `| Privileged access (does the model know itself better than an outside observer could?) | ${EVIDENCE_LABELS[e.privileged_access]} |`,
      `| Stance | ${e.stance} |`,
      `| Models | ${e.models.join(', ') || 'n/a'} |`,
      '',
    );
    if (e.note) out.push(e.note, '');
  }

  out.push(expandPosts(p.body?.trim() ?? '', wiki.threads), '');

  const threads = wiki.threads.filter((t) => d.threads.includes(t.id) || t.data.papers.includes(p.id));
  if (threads.length) {
    out.push('## Threads', '');
    for (const t of threads) out.push(`- [${t.data.title}](/threads/${t.id}): ${t.data.summary}`);
    out.push('');
  }

  const cites = wiki.cites.get(p.id)!.map((id) => wiki.paper.get(id)!);
  const citedBy = wiki.citedBy.get(p.id)!.map((id) => wiki.paper.get(id)!);
  if (cites.length) out.push('## Cites, within this wiki', '', ...cites.map(paperLine), '');
  if (citedBy.length) out.push('## Cited by, within this wiki', '', ...citedBy.map(paperLine), '');

  out.push('## BibTeX', '', '```bibtex', bibtex(p), '```', '', footer(`/papers/${p.id}`));
  return absolutize(out.join('\n'));
}

export async function conceptMarkdown(c: Concept): Promise<string> {
  const wiki = await loadWiki();
  const papers = wiki.papers.filter((p) => p.data.concepts.includes(c.id));
  const out = [`# ${c.data.title}`, '', `> ${c.data.summary}`, ''];
  if (c.data.aliases.length) out.push(`Also called: ${c.data.aliases.join(', ')}.`, '');
  out.push(c.body?.trim() ?? '', '');
  if (papers.length) out.push('## Papers tagged with this concept', '', ...papers.map(paperLine), '');
  out.push(footer(`/concepts/${c.id}`));
  return absolutize(out.join('\n'));
}

export async function threadMarkdown(t: Thread): Promise<string> {
  const wiki = await loadWiki();
  const d = t.data;
  const out = [
    `# ${d.title}`,
    '',
    `> ${d.summary}`,
    '',
    `- Author: ${d.author.name} ([@${d.author.handle}](https://x.com/${d.author.handle}))`,
    `- Posted: ${isoDate(d.date)}, ${d.tweets.length} posts`,
    `- Original: ${d.url}`,
    ...d.papers.map((id) => `- About: [${wiki.paper.get(id)!.data.title}](/papers/${id})`),
    '',
    'The post text below is quoted verbatim. Figure descriptions are written by this wiki.',
    '',
  ];
  d.tweets.forEach((tw, i) => {
    out.push(`## ${i + 1}/${d.tweets.length}`, '', quoted(tw.text), '');
    for (const img of tw.images) out.push(`Figure: ${img.alt || 'image, not yet described'}`, '');
    if (tw.quote) {
      out.push(`Quoting ${tw.quote.author.name} (@${tw.quote.author.handle}), ${isoDate(tw.quote.date)}, ${tw.quote.url}:`, '');
      out.push(quoted(tw.quote.text), '');
    }
    out.push(`[Post ${i + 1} on X](${tw.url})`, '');
  });
  out.push(footer(`/threads/${t.id}`));
  return absolutize(out.join('\n'));
}

export async function indexMarkdown(): Promise<string> {
  const wiki = await loadWiki();
  const out = [`# ${SITE.name}`, '', `> ${SITE.description}`, ''];
  out.push(
    'A self-report counts as introspection here only if it is **faithful** (it matches what the model actually does or represents) and **grounded** (it is caused by the state it describes, rather than arrived at some other way). See [About](/about) for how pages are written and what the labels mean.',
    '',
  );
  for (const { tier, label, blurb } of TIERS) {
    const list = wiki.papers.filter((p) => p.data.tier === tier);
    if (list.length) out.push(`## ${label} papers`, '', blurb, '', ...list.map(paperLine), '');
  }
  out.push('## Concepts', '', ...wiki.concepts.map((c) => `- [${c.data.title}](/concepts/${c.id}): ${c.data.summary}`), '');
  out.push('## Threads', '', ...wiki.threads.map((t) => `- [${t.data.title}](/threads/${t.id}): ${t.data.summary}`), '');
  out.push(
    '## More',
    '',
    `- [All papers as a table](/papers): every page with its evidence card`,
    `- [Frontier](/frontier): ${frontier.candidates.length} candidate papers not yet in the wiki`,
    `- [About](/about)`,
    `- [Everything in one file](/llms-full.txt)`,
    `- Data: [papers.json](/data/papers.json), [graph.json](/data/graph.json), [frontier.json](/data/frontier.json), [references.bib](/references.bib)`,
    '',
    footer('/'),
  );
  return absolutize(out.join('\n'));
}

export async function papersMarkdown(): Promise<string> {
  const wiki = await loadWiki();
  const out = [
    '# Papers',
    '',
    `> Every paper page in the ${SITE.name}, with its evidence card.`,
    '',
    'Faithfulness, grounding and privileged access say whether the paper tested the property, argued about it, or did not address it. They do not say what it found; the stance column does. See [About](/about) for the definitions.',
    '',
    '| Paper | Tier | Reports on | Faithfulness | Grounding | Privileged access | Stance |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const p of wiki.papers) {
    const e = p.data.evidence;
    const cells = e
      ? [e.reports_on, EVIDENCE_LABELS[e.faithfulness], EVIDENCE_LABELS[e.grounding], EVIDENCE_LABELS[e.privileged_access], e.stance]
      : ['(stub)', '', '', '', ''];
    out.push(`| [${citeAs(p)}: ${p.data.title}](/papers/${p.id}) | ${p.data.tier} | ${cells.join(' | ')} |`);
  }
  out.push('', footer('/papers'));
  return absolutize(out.join('\n'));
}

export const TRIAGE_LABELS: Record<string, string> = {
  add: 'Suggested: add',
  maybe: 'Suggested: maybe',
  skip: 'Suggested: skip',
  unreviewed: 'Not yet triaged',
};
export const TRIAGE_ORDER = ['add', 'maybe', 'unreviewed', 'skip'];

export function candidateByline(c: Candidate): string {
  const authors = c.authors?.length ? c.authors.join(', ') + ((c.author_count ?? 0) > c.authors.length ? ' et al.' : '') : '';
  return [authors, c.year].filter(Boolean).join(', ');
}

export async function frontierMarkdown(): Promise<string> {
  const wiki = await loadWiki();
  const short = (id: string) => (wiki.paper.has(id) ? citeAs(wiki.paper.get(id)!) : id);
  const out = [
    '# Frontier',
    '',
    `> ${frontier.candidates.length} papers one citation away from the wiki that do not have a page yet.`,
    '',
    `The crawler looked at the references and citers of every paper page and saw ${frontier.neighbors_seen} distinct neighbors. A neighbor is listed here if it connects to at least ${frontier.min_score} wiki papers, or if someone added it as a lead. The triage labels are suggestions, made from each candidate's title and its place in the citation graph and not from reading it. A candidate becomes a page only after a person accepts it. Last crawled ${frontier.generated}. Source: ${frontier.source}.`,
    '',
  ];
  for (const triage of TRIAGE_ORDER) {
    const list = frontier.candidates.filter((c) => (TRIAGE_LABELS[c.triage] ? c.triage : 'unreviewed') === triage);
    if (!list.length) continue;
    out.push(`## ${TRIAGE_LABELS[triage]} (${list.length})`, '');
    for (const c of list) {
      const title = c.url ? `[${c.title}](${c.url})` : c.title;
      const links = [
        c.cites.length && `cites ${c.cites.map(short).join('; ')}`,
        c.cited_by.length && `cited by ${c.cited_by.map(short).join('; ')}`,
      ].filter(Boolean);
      out.push(`- ${title}${candidateByline(c) ? ` (${candidateByline(c)})` : ''}. ${[c.note, ...links].filter(Boolean).join('. ')}.`);
    }
    out.push('');
  }
  out.push(footer('/frontier'));
  return absolutize(out.join('\n'));
}

export async function pageMarkdown(id: string): Promise<string> {
  const page = (await getEntry('pages', id))!;
  return absolutize([`# ${page.data.title}`, '', `> ${page.data.summary}`, '', page.body?.trim() ?? '', '', footer(`/${id}`)].join('\n'));
}
