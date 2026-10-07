import type { APIRoute } from 'astro';
import { mdResponse, paperMarkdown } from '../../lib/markdown';
import { loadWiki, type Archived } from '../../lib/wiki';

export async function getStaticPaths() {
  const wiki = await loadWiki();
  return wiki.archive.map((paper) => ({ params: { id: paper.id }, props: { paper } }));
}

export const GET: APIRoute = async ({ props }) => mdResponse(await paperMarkdown(props.paper as Archived, true));
