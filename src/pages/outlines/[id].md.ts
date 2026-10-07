import type { APIRoute } from 'astro';
import { mdResponse, outlineMarkdown } from '../../lib/markdown';
import { loadWiki, type Outline } from '../../lib/wiki';

export async function getStaticPaths() {
  const wiki = await loadWiki();
  return wiki.outlines.map((outline) => ({ params: { id: outline.id }, props: { outline } }));
}

export const GET: APIRoute = async ({ props }) => mdResponse(await outlineMarkdown(props.outline as Outline));
