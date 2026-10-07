import { candidatesMarkdown, mdResponse } from '../lib/markdown';

export const GET = async () => mdResponse(await candidatesMarkdown());
