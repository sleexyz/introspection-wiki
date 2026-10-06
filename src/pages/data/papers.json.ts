import { SITE, isoDate, loadWiki } from '../../lib/wiki';

export const GET = async () => {
  const wiki = await loadWiki();
  const papers = wiki.papers.map((p) => {
    const { date, added, updated, cites: _handEntered, ...rest } = p.data;
    return {
      id: p.id,
      url: `${SITE.url}/papers/${p.id}`,
      markdown_url: `${SITE.url}/papers/${p.id}.md`,
      ...rest,
      date: date && isoDate(date),
      added: isoDate(added),
      updated: isoDate(updated),
      cites: wiki.cites.get(p.id),
      cited_by: wiki.citedBy.get(p.id),
    };
  });
  return Response.json({ site: SITE.url, license: 'CC BY 4.0', papers });
};
