import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { mdResponse, pageMarkdown } from '../lib/markdown';

export async function getStaticPaths() {
  const pages = await getCollection('pages');
  return pages.map((page) => ({ params: { page: page.id } }));
}

export const GET: APIRoute = async ({ params }) => mdResponse(await pageMarkdown(params.page!));
