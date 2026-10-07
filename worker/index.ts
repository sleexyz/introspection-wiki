/**
 * Serves the static site, and hands agents markdown when they ask for it.
 *
 * Every page is built twice: /papers/foo (HTML) and /papers/foo.md. A static
 * host can serve both, but it cannot notice that a client sent
 * `Accept: text/markdown` on the HTML URL — which is how agents ask. Cloudflare
 * does that conversion itself only on paid zones, so this does it here, from
 * the twins the build already wrote rather than by converting HTML on the fly.
 */

// What Cloudflare's own Markdown for Agents sends, so a client that understands
// one understands the other. robots.txt states the same policy for crawlers.
const CONTENT_SIGNAL = 'ai-train=yes, search=yes, ai-input=yes';

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

		const paper = url.pathname.match(/^\/pdf\/([a-z0-9-]+)\.pdf$/);
		if (paper) return relay(paper[1], request, env);

		// An outline had a page of its own while the format was on trial. It is the paper page now.
		const outline = url.pathname.match(/^\/outlines\/(.+)$/);
		if (outline) return Response.redirect(new URL(`/papers/${outline[1]}`, url).href, 301);

		if (url.pathname.endsWith('.md')) {
			return markdown(await assetAt(markdownAlias(url.pathname) ?? url.pathname, request, env));
		}

		if (!isPage(url.pathname)) return env.ASSETS.fetch(request);

		const twin = twinOf(url.pathname);
		if (prefersMarkdown(request.headers.get('Accept'))) {
			const response = await assetAt(twin, request, env);
			// A page with no twin (the 404 page) falls through to HTML.
			if (response.ok) return markdown(response);
		}

		const response = await env.ASSETS.fetch(request);
		if (!response.ok) return response;
		const headers = new Headers(response.headers);
		headers.append('Vary', 'Accept');
		headers.append('Link', `<${twin}>; rel="alternate"; type="text/markdown"`);
		return new Response(response.body, { status: response.status, headers });
	},
} satisfies ExportedHandler<Env>;

/**
 * The paper beside its page. The reader on a paper page draws the paper's
 * PDF itself, and a browser will not let a page read a file from another site
 * unless that site says it may, which the hosts of most papers do not. So the
 * reader asks here, and this fetches the file from where the paper page links
 * it and passes it on. The site keeps no copy of its own; Cloudflare's cache
 * holds one for a day. Only the reader is served this way: anyone who opens
 * the address is sent to the authors' copy.
 */
async function relay(id: string, request: Request, env: Env): Promise<Response> {
	const listed = await assetAt('/pdf/sources.json', request, env);
	const source = listed.ok ? ((await listed.json()) as Record<string, string>)[id] : undefined;
	if (!source) return new Response('No such paper\n', { status: 404 });

	const fromReader = request.headers.get('Sec-Fetch-Site') === 'same-origin' && request.headers.get('Sec-Fetch-Dest') === 'empty';
	if (!fromReader) return Response.redirect(source, 302);

	const upstream = await fetch(source, { cf: { cacheEverything: true, cacheTtl: 86400 } });
	if (!upstream.ok) return new Response('The paper could not be fetched\n', { status: 502 });
	return new Response(upstream.body, {
		headers: {
			'Content-Type': 'application/pdf',
			'Cache-Control': 'public, max-age=86400',
			'X-Robots-Tag': 'noindex',
			Link: `<${source}>; rel="canonical"`,
		},
	});
}

/** A page URL has no file extension: /, /papers, /papers/foo. */
function isPage(pathname: string): boolean {
	return !/\.[a-z0-9]+$/i.test(pathname);
}

function twinOf(pathname: string): string {
	const trimmed = pathname.replace(/\/+$/, '');
	return trimmed === '' ? '/index.md' : `${trimmed}.md`;
}

/**
 * llms.txt allows several spellings for a page's markdown URL; the build writes
 * only one. Map /foo/index.md, /foo/index.html.md and /foo.html.md to /foo.md.
 */
function markdownAlias(pathname: string): string | null {
	const match = pathname.match(/^(.*?)(\/index(?:\.html)?|\.html)\.md$/);
	if (!match) return null;
	const [, base, suffix] = match;
	if (base === '' && suffix !== '.html') return pathname === '/index.md' ? null : '/index.md';
	return `${base}.md`;
}

/** True when the client ranks text/markdown at least as high as text/html. */
function prefersMarkdown(accept: string | null): boolean {
	if (!accept) return false;
	const quality = new Map<string, number>();
	for (const part of accept.split(',')) {
		const [type, ...params] = part.trim().toLowerCase().split(';');
		const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
		quality.set(type.trim(), q ? Number(q.slice(2)) : 1);
	}
	const md = quality.get('text/markdown') ?? 0;
	return md > 0 && md >= (quality.get('text/html') ?? 0);
}

function assetAt(pathname: string, request: Request, env: Env): Promise<Response> {
	return env.ASSETS.fetch(new Request(new URL(pathname, request.url), request));
}

function markdown(response: Response): Response {
	if (!response.ok) return response;
	const headers = new Headers(response.headers);
	headers.set('Content-Type', 'text/markdown; charset=utf-8');
	headers.set('Content-Signal', CONTENT_SIGNAL);
	headers.append('Vary', 'Accept');
	return new Response(response.body, { status: response.status, headers });
}
