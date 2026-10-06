import { indexMarkdown, mdResponse } from '../lib/markdown';

export const GET = async () => mdResponse(await indexMarkdown());
