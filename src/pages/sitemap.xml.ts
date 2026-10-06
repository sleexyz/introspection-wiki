import { getCollection } from 'astro:content';
import { SITE, frontier, isoDate, loadWiki } from '../lib/wiki';

export const GET = async () => {
  const wiki = await loadWiki();
  const pages = await getCollection('pages');
  const newest = (dates: Date[]) => isoDate(new Date(Math.max(...dates.map((d) => d.getTime()))));
  const latest = newest(wiki.papers.map((p) => p.data.updated));
  const urls: [string, string][] = [
    ['/', latest],
    ['/papers', latest],
    ['/frontier', frontier.generated],
    ...pages.map((p): [string, string] => [`/${p.id}`, isoDate(p.data.updated)]),
    ...wiki.papers.map((p): [string, string] => [`/papers/${p.id}`, isoDate(p.data.updated)]),
    ...wiki.concepts.map((c): [string, string] => [`/concepts/${c.id}`, isoDate(c.data.updated)]),
    ...wiki.threads.map((t): [string, string] => [`/threads/${t.id}`, isoDate(t.data.date)]),
  ];
  const body = urls.map(([path, lastmod]) => `  <url><loc>${SITE.url}${path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
