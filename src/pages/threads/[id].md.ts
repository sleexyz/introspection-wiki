import type { APIRoute } from 'astro';
import { mdResponse, threadMarkdown } from '../../lib/markdown';
import { loadWiki, type Thread } from '../../lib/wiki';

export async function getStaticPaths() {
  const wiki = await loadWiki();
  return wiki.threads.map((thread) => ({ params: { id: thread.id }, props: { thread } }));
}

export const GET: APIRoute = async ({ props }) => mdResponse(await threadMarkdown(props.thread as Thread));
