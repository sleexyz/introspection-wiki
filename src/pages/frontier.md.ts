import { frontierMarkdown, mdResponse } from '../lib/markdown';

export const GET = async () => mdResponse(await frontierMarkdown());
