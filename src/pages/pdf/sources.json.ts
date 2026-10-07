import { getAnchors } from '../../lib/anchors';
import { loadWiki } from '../../lib/wiki';

// Which papers the reader on a paper page may ask the Worker for, and where
// each one's PDF really lives. worker/index.ts reads this; it relays nothing
// that is not listed here.
export const GET = async () => {
  const wiki = await loadWiki();
  const sources = wiki.papers.flatMap((p) => (p.data.links.pdf && getAnchors(p.id) ? [[p.id, p.data.links.pdf]] : []));
  return Response.json(Object.fromEntries(sources));
};
