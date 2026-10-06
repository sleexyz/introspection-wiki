import { SITE, citeAs, loadWiki } from '../lib/wiki';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Atom feed of paper pages, newest change first.
export const GET = async () => {
  const wiki = await loadWiki();
  const papers = [...wiki.papers].sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());
  const entries = papers.map((p) => {
    const url = `${SITE.url}/papers/${p.id}`;
    return [
      '  <entry>',
      `    <title>${esc(`${citeAs(p)}: ${p.data.title}`)}</title>`,
      `    <link href="${url}"/>`,
      `    <link rel="alternate" type="text/markdown" href="${url}.md"/>`,
      `    <id>${url}</id>`,
      `    <published>${p.data.added.toISOString()}</published>`,
      `    <updated>${p.data.updated.toISOString()}</updated>`,
      `    <summary>${esc(p.data.summary)}</summary>`,
      '  </entry>',
    ].join('\n');
  });
  const updated = papers[0]?.data.updated.toISOString() ?? new Date(0).toISOString();
  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom">',
      `  <title>${esc(SITE.name)}</title>`,
      `  <subtitle>${esc(SITE.description)}</subtitle>`,
      `  <link href="${SITE.url}/"/>`,
      `  <link rel="self" href="${SITE.url}/feed.xml"/>`,
      `  <id>${SITE.url}/</id>`,
      `  <updated>${updated}</updated>`,
      `  <author><name>${esc(SITE.name)}</name></author>`,
      ...entries,
      '</feed>',
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } },
  );
};
