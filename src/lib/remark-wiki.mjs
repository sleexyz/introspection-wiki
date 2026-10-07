import fs from 'node:fs';
import path from 'node:path';
import { mapHtml, parseMap } from './experiment-map.mjs';
import { experimentHtml, parseExperiment } from './experiment.mjs';

/**
 * Four block-level conventions for page bodies, and one for links.
 *
 * 1. A post from an imported thread, embedded where it is discussed:
 *
 *        ::post diatkinson-identifying-introspection 4
 *
 *    renders as the official X embed for the thread's fourth post, followed by
 *    the wiki's description of its figure. Summaries are organized around the
 *    authors' own threads, and this puts each post next to the text about it.
 *
 * 2. A figure. An image alone in a paragraph, with a title:
 *
 *        ![What the figure shows, in words.](/figures/<paper-id>/fig2.png "Figure 2 of the paper. Caption.")
 *
 *    renders as <figure> with the title as its caption. The alt text is the
 *    description a reader without the image gets, so it carries the content.
 *
 * 3. An experiment diagram. A fenced block tagged `experiment`, holding YAML
 *    in the notation defined in experiment.mjs, renders as the diagram. A
 *    block tagged `map` (experiment-map.mjs) renders as the graph of how a
 *    paper's experiments lead into one another.
 *
 * All three are plain text in the source, so the markdown twin of a page can
 * rewrite the same source for a reader that only gets text — see expandPosts
 * and expandExperiments in markdown.ts.
 *
 * 4. A note from the model that drafted the page. A blockquote that opens with
 *    the label in bold:
 *
 *        > **Note from Claude:** The claim that leads is the last one.
 *
 *    renders as a boxed aside under that label. The text around it reports
 *    what a paper says; the note is the drafter's own observation. The source
 *    already reads correctly as markdown, so the twin leaves it as it is.
 *
 * 5. A link to a paper page that is still a stub gets class="stub", which
 *    colors it red. Templates do the same for their own links with PaperLink.
 */

const ROOT = path.resolve(import.meta.dirname, '../..');
export const POST_LINE = /^::post[ \t]+([a-z0-9-]+)[ \t]+(\d+)[ \t]*$/;
export const CLAUDE_NOTE = 'Note from Claude:';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PAPER_LINK = /^\/papers\/([a-z0-9-]+)(?:#.*)?$/;

/** Read from the target's frontmatter each time, like post(), so nothing here outlives an edit. */
function isStub(paperId) {
  const file = path.join(ROOT, 'src/content/papers', `${paperId}.md`);
  if (!fs.existsSync(file)) return false;
  const frontmatter = fs.readFileSync(file, 'utf8').split(/^---[ \t]*$/m)[1] ?? '';
  return /^status:[ \t]*["']?stub["']?[ \t]*$/m.test(frontmatter);
}

function markStubLinks(node) {
  if (node.type === 'link') {
    const match = node.url.match(PAPER_LINK);
    if (match && isStub(match[1])) {
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, className: ['stub'] } };
    }
  }
  node.children?.forEach(markStubLinks);
}

function post(threadId, n) {
  const file = path.join(ROOT, 'src/content/threads', `${threadId}.json`);
  if (!fs.existsSync(file)) throw new Error(`::post names thread "${threadId}", which does not exist`);
  const thread = JSON.parse(fs.readFileSync(file, 'utf8'));
  const tweet = thread.tweets[n - 1];
  if (!tweet) throw new Error(`::post ${threadId} ${n}: the thread has only ${thread.tweets.length} posts`);
  const notes = tweet.images
    .filter((img) => img.alt)
    .map((img) => `<p class="figure-note"><b>Figure.</b> ${esc(img.alt)}</p>`)
    .join('');
  return (
    `<div class="post" id="post-${n}">` +
    `<p class="post-n"><a href="/threads/${threadId}#post-${n}">Post ${n} of ${thread.tweets.length}</a></p>` +
    `${tweet.html}${notes}</div>`
  );
}

/** The box for a blockquote that opens with the label, or null for any other node. */
function claudeNote(node) {
  const label = node.children?.[0]?.children?.[0];
  if (node.type !== 'blockquote' || label?.type !== 'strong' || label.children[0]?.value !== CLAUDE_NOTE) return null;
  // The label sits on a line of its own in the box, so it drops its colon there.
  label.data = { hProperties: { className: ['claude-label'] }, hChildren: [{ type: 'text', value: CLAUDE_NOTE.slice(0, -1) }] };
  return { ...node, data: { hName: 'aside', hProperties: { className: ['claude-note'] } } };
}

/** Width and height from a PNG header, so the page does not shift as it loads. */
function pngSize(src) {
  const file = path.join(ROOT, 'public', src);
  if (!src.endsWith('.png') || !fs.existsSync(file)) return '';
  const header = fs.readFileSync(file).subarray(0, 24);
  return ` width="${header.readUInt32BE(16)}" height="${header.readUInt32BE(20)}"`;
}

function figure({ url, alt, title }) {
  return (
    `<figure><img src="${esc(url)}" alt="${esc(alt ?? '')}"${pngSize(url)} loading="lazy">` +
    `<figcaption>${esc(title)}</figcaption></figure>`
  );
}

export default function remarkWiki() {
  return (tree) => {
    markStubLinks(tree);
    tree.children = tree.children.map((node) => {
      if (node.type === 'code' && node.lang === 'experiment') {
        return { type: 'html', value: experimentHtml(parseExperiment(node.value)) };
      }
      if (node.type === 'code' && node.lang === 'map') {
        return { type: 'html', value: mapHtml(parseMap(node.value)) };
      }
      const note = claudeNote(node);
      if (note) return note;
      if (node.type !== 'paragraph' || node.children.length !== 1) return node;
      const [only] = node.children;
      if (only.type === 'text') {
        const match = only.value.match(POST_LINE);
        if (match) return { type: 'html', value: post(match[1], Number(match[2])) };
      }
      if (only.type === 'image' && only.title) return { type: 'html', value: figure(only) };
      return node;
    });
  };
}
