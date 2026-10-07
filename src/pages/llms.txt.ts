import { absolutize, candidatesSummary } from '../lib/markdown';
import { SITE, TIERS, citeAs, loadWiki } from '../lib/wiki';

// The index an agent reads first: https://llmstxt.org. An H1, a blockquote, some
// orientation, then H2 sections of links. "Optional" is the spec's name for the
// section a reader short on context may skip.
export const GET = async () => {
  const wiki = await loadWiki();
  const out = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    'A self-report counts as introspection here only if it is faithful (it matches what the model actually does or represents) and grounded (it is caused by the state it describes). Each paper page is an outline of the paper: its claims, the evidence for each, and the job of every part, with the place in the paper of everything it reports. Most papers have only a stub so far; an earlier page for each, in the format the wiki started with, is kept under /archive/.',
    '',
    'Every link below is a markdown file. Any page URL on this site also returns markdown when requested with `Accept: text/markdown`, or with `.md` appended. Summaries are drafted by an AI model from the sources each page lists; each page states whether a person has reviewed it.',
    '',
    '## Start here',
    '',
    '- [Index](/): every page in the wiki, grouped',
    '- [About](/about): how pages are written and how the wiki is organized',
    '- [Papers table](/papers): every paper that has a page, with what it studies, its methods and its models, side by side',
    '- [Reading the diagrams](/diagrams): the notation used for every experiment diagram',
    '',
  ];
  for (const { tier, label } of TIERS) {
    const list = wiki.papers.filter((p) => p.data.tier === tier);
    if (!list.length) continue;
    out.push(`## ${label} papers`, '');
    for (const p of list) out.push(`- [${citeAs(p)}: ${p.data.title}](/papers/${p.id}): ${p.data.summary}`);
    out.push('');
  }
  out.push('## Concepts', '', ...wiki.concepts.map((c) => `- [${c.data.title}](/concepts/${c.id}): ${c.data.summary}`), '');
  out.push('## Threads', '', ...wiki.threads.map((t) => `- [${t.data.title}](/threads/${t.id}): ${t.data.summary}`), '');
  out.push(
    '## Data',
    '',
    '- [llms-full.txt](/llms-full.txt): every page above in one file',
    '- [papers.json](/data/papers.json): all paper pages as structured records',
    '- [graph.json](/data/graph.json): citation edges between the papers in the wiki',
    '- [references.bib](/references.bib): BibTeX for every paper',
    '',
    '## Optional',
    '',
    `- [Candidates](/candidates): ${candidatesSummary(wiki)}`,
    '- [frontier.json](/data/frontier.json): the candidates one citation away, as data',
  );
  return new Response(absolutize(out.join('\n')) + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
