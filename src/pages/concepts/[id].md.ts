import type { APIRoute } from 'astro';
import { conceptMarkdown, mdResponse } from '../../lib/markdown';
import { loadWiki, type Concept } from '../../lib/wiki';

export async function getStaticPaths() {
  const wiki = await loadWiki();
  return wiki.concepts.map((concept) => ({ params: { id: concept.id }, props: { concept } }));
}

export const GET: APIRoute = async ({ props }) => mdResponse(await conceptMarkdown(props.concept as Concept));
