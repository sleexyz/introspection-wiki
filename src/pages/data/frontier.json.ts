import { SITE, frontier } from '../../lib/wiki';

export const GET = () => Response.json({ site: SITE.url, ...frontier });
