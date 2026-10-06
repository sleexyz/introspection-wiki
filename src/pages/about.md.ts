import { mdResponse, pageMarkdown } from '../lib/markdown';

export const GET = async () => mdResponse(await pageMarkdown('about'));
