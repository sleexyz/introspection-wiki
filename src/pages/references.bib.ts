import { bibtex, loadWiki } from '../lib/wiki';

export const GET = async () => {
  const wiki = await loadWiki();
  return new Response(wiki.papers.map(bibtex).join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
