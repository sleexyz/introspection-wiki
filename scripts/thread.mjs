#!/usr/bin/env node
// Import a thread from X as a thread page.
//
//   node scripts/thread.mjs <post-url> <thread-id> [paper-id ...]
//   node scripts/thread.mjs https://x.com/diatkinson/status/2107280696809304180 \
//        diatkinson-identifying-introspection atkinson2026-identifying-introspection
//
// Writes src/content/threads/<thread-id>.json: every post's text plus the
// official embed markup from X's oEmbed endpoint. The thread itself is walked
// through FxTwitter, since oEmbed only knows single posts.
//
// Images and the raw API response go to data/raw/threads/<thread-id>/, which is
// gitignored: we embed posts, we do not rehost their media.
//
// Re-running is safe. `title`, `summary`, `papers`, the author's display name
// and every image's `alt` are written by hand afterwards and are kept.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const UA = 'introspection-wiki (+https://introspection.infinite.fun)';

const [postUrl, threadId, ...paperIds] = process.argv.slice(2);
const postId = postUrl?.match(/status\/(\d+)/)?.[1];
if (!postId || !threadId) {
  console.error('usage: node scripts/thread.mjs <post-url> <thread-id> [paper-id ...]');
  process.exit(1);
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}

const person = (a) => ({ name: a.name, handle: a.screen_name });
const when = (t) => new Date(t.created_timestamp * 1000).toISOString();

const raw = await getJson(`https://api.fxtwitter.com/2/thread/${postId}`);
const posts = raw.thread?.length ? raw.thread : [raw.status];
if (!posts[0]) throw new Error('FxTwitter returned no posts');

const rawDir = path.join(ROOT, 'data/raw/threads', threadId);
fs.mkdirSync(path.join(rawDir, 'media'), { recursive: true });
fs.writeFileSync(path.join(rawDir, 'thread.fxtwitter.json'), JSON.stringify(raw, null, 1));

const file = path.join(ROOT, 'src/content/threads', `${threadId}.json`);
const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const previousAlt = new Map((previous.tweets ?? []).map((t) => [t.id, t.images?.map((i) => i.alt) ?? []]));

const tweets = [];
for (const post of posts) {
  const url = `https://x.com/${post.author.screen_name}/status/${post.id}`;
  // hide_thread keeps each embed to its own post instead of repeating its parent.
  const embed = await getJson(
    `https://publish.x.com/oembed?url=${encodeURIComponent(url)}&omit_script=1&dnt=1&hide_thread=1`,
  );
  const photos = (post.media?.all ?? []).filter((m) => m.type === 'photo');
  for (const [n, photo] of photos.entries()) {
    const res = await fetch(photo.url, { headers: { 'User-Agent': UA } });
    if (res.ok) fs.writeFileSync(path.join(rawDir, 'media', `${post.id}-${n}.jpg`), Buffer.from(await res.arrayBuffer()));
  }
  tweets.push({
    id: post.id,
    url,
    date: when(post),
    text: post.text,
    html: embed.html.trim(),
    images: photos.map((_, n) => ({ alt: previousAlt.get(post.id)?.[n] ?? '' })),
    ...(post.quote && {
      quote: {
        url: `https://x.com/${post.quote.author.screen_name}/status/${post.quote.id}`,
        author: person(post.quote.author),
        date: when(post.quote),
        text: post.quote.text,
      },
    }),
  });
  console.error(`${tweets.length}/${posts.length} ${post.text.replace(/\s+/g, ' ').slice(0, 70)}`);
}

const first = posts[0];
const thread = {
  title: previous.title ?? `${first.author.name}: ${first.text.split('\n')[0].slice(0, 80)}`,
  summary: previous.summary ?? '',
  platform: 'x',
  author: previous.author ?? person(first.author),
  url: tweets[0].url,
  date: tweets[0].date.slice(0, 10),
  papers: [...new Set([...(previous.papers ?? []), ...paperIds])],
  tweets,
};
fs.writeFileSync(file, JSON.stringify(thread, null, 2) + '\n');

const undescribed = tweets.flatMap((t) => t.images).filter((i) => !i.alt).length;
console.error(`\nwrote ${path.relative(ROOT, file)}: ${tweets.length} posts`);
if (!thread.summary) console.error('  still needs: summary');
if (undescribed) console.error(`  still needs: ${undescribed} figure description(s), from data/raw/threads/${threadId}/media/`);
