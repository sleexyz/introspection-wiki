/**
 * Where a statement on an outline page sits in the paper.
 *
 * An outline gives the location of everything it reports, in two forms that
 * this module reads straight out of the prose:
 *
 *   - a locator: "§5.1", "Appendix B.6", "Appendices C and F", "B.6", "B.3.1",
 *     "Figure 3", "Figures 5c and 5d", "Table 2", "footnote 2", "Abstract";
 *   - a quotation, between double quotes.
 *
 * scripts/anchor.mjs finds each of them in the paper's PDF and writes the
 * positions to src/data/anchors/<paper-id>.json. remark-wiki.mjs then turns
 * each one into an element that carries its position, and the reader on the
 * outline page (PaperPane.astro) scrolls the paper to it. The linter uses the
 * same tokenizer, so all three agree on what counts as a locator or a quote.
 */

/**
 * A string reduced to its letters and digits. A quotation and the paper's text
 * are compared in this form, so a line break, a hyphen put in by the
 * typesetter, a ligature or a curly quote never stops a match.
 */
export const skeleton = (s) =>
  s
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** A quotation shorter than this, as a skeleton, is too short to place reliably. */
export const MIN_QUOTE = 6;

const LABEL = String.raw`[A-Z](?:\.\d+){0,2}`;
const TOKEN = new RegExp(
  [
    String.raw`"(?<q1>[^"\n]+)"`,
    String.raw`“(?<q2>[^”\n]+)”`,
    String.raw`§(?<sec>\d+(?:\.\d+){0,2})`,
    String.raw`Appendices (?<apps>${LABEL}(?:(?:,| and|, and) ${LABEL})+)`,
    String.raw`Appendix (?<app>${LABEL})`,
    // A bare "B.1" is an appendix section unless it numbers something else.
    String.raw`(?<!(?:Figure|Fig\.|Table|Tab\.|Prompt|Listing|Algorithm|Equation|Eq\.|Theorem|Lemma|Proposition|Corollary|Definition|Example|Box|Step) )\b(?<bare>[A-Z]\.\d+(?:\.\d+)?)\b`,
    String.raw`(?<float>Figure|Table)s? (?<floats>\d+[a-d]?(?:(?:,| and|, and) \d+[a-d]?)*)`,
    String.raw`[Ff]ootnote (?<fn>\d+)`,
    String.raw`\b(?<abstract>Abstract)\b`,
  ].join('|'),
  'g',
);

/**
 * Split a run of text into plain text, quotations and locators, in order.
 * A locator's `dest` is its key in the anchors file: "sec:5.1", "app:B.6",
 * "fig:3", "tab:2", "fn:2", "abstract". A bare "B.1" is an appendix section
 * unless it is the number of something else ("Prompt B.1", "Table B.2").
 *
 * @param {string} text
 * @returns {{ type: 'text' | 'quote' | 'loc', text: string, key?: string, dest?: string }[]}
 */
export function tokenize(text) {
  const out = [];
  let at = 0;
  const plain = (to) => {
    if (to > at) out.push({ type: 'text', text: text.slice(at, to) });
    at = to;
  };
  // "Figures 5c and 5d", "Appendices C and F": one locator for each item, the
  // first carrying the word before it, and the words between left as text.
  const list = (m, items, item, dest) => {
    const start = m.index + m[0].length - items.length;
    [...items.matchAll(item)].forEach((found, i) => {
      const from = i ? start + found.index : m.index;
      plain(from);
      out.push({ type: 'loc', text: text.slice(from, start + found.index + found[0].length), dest: dest(found[0]) });
      at = start + found.index + found[0].length;
    });
  };
  for (const m of text.matchAll(TOKEN)) {
    const g = m.groups;
    const quoted = g.q1 ?? g.q2;
    if (quoted !== undefined) {
      plain(m.index);
      out.push({ type: 'quote', text: m[0], key: skeleton(quoted) });
    } else if (g.floats) {
      list(m, g.floats, /\d+[a-d]?/g, (n) => `${g.float === 'Figure' ? 'fig' : 'tab'}:${parseInt(n, 10)}`);
    } else if (g.apps) {
      list(m, g.apps, new RegExp(LABEL, 'g'), (label) => `app:${label}`);
    } else {
      plain(m.index);
      const dest = g.sec ? `sec:${g.sec}` : g.app ? `app:${g.app}` : g.bare ? `app:${g.bare}` : g.fn ? `fn:${g.fn}` : 'abstract';
      out.push({ type: 'loc', text: m[0], dest });
    }
    at = m.index + m[0].length;
  }
  plain(text.length);
  return out;
}

/**
 * Give each quotation the locator it is cited to: the nearest one in the same
 * block (a paragraph, a list item, a table row), which is the one after it in
 * '"…" (§4)' and the one before it in "Appendix B.2 says …". The same words
 * can occur twice in a paper; the hint says which occurrence is meant.
 *
 * Nearness is counted in quotations and locators, not in characters, so the
 * answer is the same whether the block is read as markdown or as a tree.
 */
export function withHints(tokens) {
  const cited = tokens.filter((t) => t.type !== 'text');
  return tokens.map((t) => {
    if (t.type !== 'quote') return t;
    const i = cited.indexOf(t);
    const after = cited.findIndex((x, k) => k > i && x.type === 'loc');
    const before = cited.findLastIndex((x, k) => k < i && x.type === 'loc');
    const nearest = after === -1 || (before !== -1 && i - before < after - i) ? before : after;
    return { ...t, hint: cited[nearest]?.dest };
  });
}

/**
 * Of the places a quotation occurs, the one meant: the first at or after the
 * hinted locator, else the first in the paper.
 *
 * @param {number[][][]} occurrences each a list of [page, x, y, w, h] rectangles
 * @param {number[] | undefined} hint [page, y, …] of the hinted locator
 */
export function choose(occurrences, hint) {
  if (!hint) return occurrences[0];
  const [page, y] = hint;
  return occurrences.find(([[p, , top]]) => p > page || (p === page && top >= y - 6)) ?? occurrences.at(-1);
}

/**
 * What a token is tied to in the paper, if anything: a locator to its page
 * and height, a quotation to the rectangles of its words. `anchors` is the
 * file scripts/anchor.mjs wrote.
 */
export function tie(token, anchors) {
  const dest = token.type === 'loc' && anchors.dests[token.dest];
  if (dest) return { kind: token.dest.split(':')[0], href: `${anchors.pdf}#page=${dest[0]}`, at: dest.join(',') };
  const found = token.type === 'quote' && token.key.length >= MIN_QUOTE && anchors.quotes[token.key];
  if (found) return { rects: choose(found, anchors.dests[token.hint]).map((r) => r.join(',')).join(';') };
  return null;
}

const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/**
 * The same for a string of HTML that some other part of the site has already
 * drawn (an experiment diagram, a term's definition): its text is tied to the
 * paper where it stands. Text inside a link, a heading, code or a button is
 * left as it is, and so is every character of the text: a tied piece is only
 * wrapped.
 */
export function citeHtml(html, anchors) {
  let closed = 0;
  return html.replace(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*>|[^<]+/g, (piece, slash, tag) => {
    if (tag) {
      if (/^(a|pre|code|script|style|button|h[1-6])$/i.test(tag)) closed += slash ? -1 : 1;
      return piece;
    }
    if (closed > 0) return piece;
    // A quotation mark may be written as an entity. In text it means the same bare.
    return withHints(tokenize(piece.replace(/&quot;|&#34;|&#x22;/gi, '"')))
      .map((token) => {
        const to = tie(token, anchors);
        if (!to) return token.text;
        return to.rects
          ? `<span class="cite cite-q" data-rects="${to.rects}">${token.text}</span>`
          : `<a class="cite cite-l" href="${attr(to.href)}" data-at="${to.at}" data-kind="${to.kind}">${token.text}</a>`;
      })
      .join('');
  });
}
