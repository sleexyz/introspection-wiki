import { SITE, loadWiki } from '../../lib/wiki';

// Citation edges among the papers that have pages. `source` cites `target`.
export const GET = async () => {
  const wiki = await loadWiki();
  return Response.json({
    site: SITE.url,
    nodes: wiki.papers.map((p) => ({ id: p.id, title: p.data.title, year: p.data.year, tier: p.data.tier, url: `${SITE.url}/papers/${p.id}` })),
    edges: wiki.papers.flatMap((p) => wiki.cites.get(p.id)!.map((target) => ({ source: p.id, target }))),
  });
};
