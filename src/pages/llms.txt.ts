import { absolutize } from '../lib/markdown';
import { SITE, TIERS, citeAs, frontier, loadWiki } from '../lib/wiki';

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
    'A self-report counts as introspection here only if it is faithful (it matches what the model actually does or represents) and grounded (it is caused by the state it describes). Each paper page carries an evidence card saying which of those the paper tested.',
    '',
    'Every link below is a markdown file. Any page URL on this site also returns markdown when requested with `Accept: text/markdown`, or with `.md` appended. Summaries are drafted by an AI model from the sources each page lists; each page states whether a person has reviewed it.',
    '',
    '## Start here',
    '',
    '- [Index](/): every page in the wiki, grouped',
    '- [About](/about): how pages are written, and what the tiers and evidence-card labels mean',
    '- [Papers table](/papers): every paper with its evidence card, side by side',
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
    `- [Frontier](/frontier): ${frontier.candidates.length} candidate papers one citation away that have no page yet`,
    '- [frontier.json](/data/frontier.json): the same candidates as data',
  );
  return new Response(absolutize(out.join('\n')) + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
