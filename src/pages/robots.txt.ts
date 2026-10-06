import { SITE } from '../lib/wiki';

// Content signals (https://contentsignals.org) say what collected content may be
// used for. This wiki wants to be found, quoted and learned from.
export const GET = () =>
  new Response(
    [
      `# ${SITE.name}: written to be read by people and by machines.`,
      `# Agents: start at ${SITE.url}/llms.txt`,
      '',
      'User-agent: *',
      'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
      'Allow: /',
      '',
      `Sitemap: ${SITE.url}/sitemap.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
