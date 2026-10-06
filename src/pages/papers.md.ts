import { mdResponse, papersMarkdown } from '../lib/markdown';

export const GET = async () => mdResponse(await papersMarkdown());
