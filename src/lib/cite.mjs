/**
 * Where a statement on an outline page sits in the paper.
 *
 * An outline gives the location of everything it reports, in two forms that
 * this module reads straight out of the prose:
 *
 *   - a locator: "§5.1", "Appendix B.6", "B.6", "B.3.1", "Figure 3", "Figures
 *     5c and 5d", "Table 2", "footnote 2", "Abstract";
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

const TOKEN =
  /"([^"\n]+)"|“([^”\n]+)”|§(\d+(?:\.\d+){0,2})()|Appendix ([A-Z](?:\.\d+){0,2})()|\b([A-Z]\.\d+(?:\.\d+)?)()\b|(Figure|Table)s? (\d+)[a-d]?((?:(?:,| and|, and) \d+[a-d]?)*)|[Ff]ootnote (\d+)|\bAbstract\b/g;

/**
 * Split a run of text into plain text, quotations and locators, in order.
 * A locator's `dest` is its key in the anchors file: "sec:5.1", "app:B.6",
 * "fig:3", "tab:2", "fn:2", "abstract".
 *
 * @param {string} text
 * @returns {{ type: 'text' | 'quote' | 'loc', text: string, key?: string, dest?: string }[]}
 */
export function tokenize(text) {
  const out = [];
  let at = 0;
  const plain = (to) => {
    if (to > at) out.push({ type: 'text', text: text.slice(at, to) });
  };
  for (const m of text.matchAll(TOKEN)) {
    const quoted = m[1] ?? m[2];
    if (quoted !== undefined) {
      plain(m.index);
      out.push({ type: 'quote', text: m[0], key: skeleton(quoted) });
    } else if (m[9]) {
      // "Figures 5c and 5d": one locator for each number, the words between left as text.
      const kind = m[9] === 'Figure' ? 'fig' : 'tab';
      const head = m[0].slice(0, m[0].length - m[11].length);
      plain(m.index);
      out.push({ type: 'loc', text: head, dest: `${kind}:${m[10]}` });
      let rest = m.index + head.length;
      for (const more of m[11].matchAll(/\d+[a-d]?/g)) {
        const start = m.index + head.length + more.index;
        out.push({ type: 'text', text: text.slice(rest, start) });
        out.push({ type: 'loc', text: more[0], dest: `${kind}:${parseInt(more[0], 10)}` });
        rest = start + more[0].length;
      }
    } else {
      const dest =
        m[3] !== undefined
          ? `sec:${m[3]}`
          : m[5] !== undefined
            ? `app:${m[5]}`
            : m[7] !== undefined
              ? `app:${m[7]}`
              : m[12] !== undefined
                ? `fn:${m[12]}`
                : 'abstract';
      plain(m.index);
      out.push({ type: 'loc', text: m[0], dest });
    }
    at = m.index + m[0].length;
  }
  plain(text.length);
  return out;
}

/**
 * Give each quotation the locator it is cited to: the nearest one in the same
 * run of text, which is the one after it in '"…" (§4)' and the one before it
 * in "Appendix B.2 says …". The same words can occur twice in a paper; the
 * hint says which occurrence is meant.
 */
export function withHints(tokens) {
  return tokens.map((t, i) => {
    if (t.type !== 'quote') return t;
    const after = tokens.findIndex((x, k) => k > i && x.type === 'loc');
    const before = tokens.findLastIndex((x, k) => k < i && x.type === 'loc');
    const nearest = after === -1 || (before !== -1 && i - before < after - i) ? before : after;
    return { ...t, hint: tokens[nearest]?.dest };
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
