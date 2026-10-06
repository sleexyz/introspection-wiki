import { conceptMarkdown, indexMarkdown, pageMarkdown, paperMarkdown, papersMarkdown, threadMarkdown } from '../lib/markdown';
import { loadWiki } from '../lib/wiki';

// The whole wiki in one fetch: every markdown twin, in reading order. The
// frontier is left out — it is a long list of papers the wiki has not read.
export const GET = async () => {
  const wiki = await loadWiki();
  const docs = await Promise.all([
    indexMarkdown(),
    pageMarkdown('about'),
    papersMarkdown(),
    ...wiki.concepts.map(conceptMarkdown),
    ...wiki.papers.map(paperMarkdown),
    ...wiki.threads.map(threadMarkdown),
  ]);
  return new Response(docs.map((d) => d.trimEnd()).join('\n\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
