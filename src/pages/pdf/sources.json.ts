import { getAnchors } from '../../lib/anchors';
import { loadWiki } from '../../lib/wiki';

// Which papers the reader on an outline page may ask the Worker for, and where
// each one's PDF really lives. worker/index.ts reads this; it relays nothing
// that is not listed here.
export const GET = async () => {
  const wiki = await loadWiki();
  const sources = wiki.outlines.flatMap((o) => {
    const pdf = wiki.paper.get(o.id)!.data.links.pdf;
    return pdf && getAnchors(o.id) ? [[o.id, pdf]] : [];
  });
  return Response.json(Object.fromEntries(sources));
};
