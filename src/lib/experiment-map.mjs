// @ts-check
import { parse } from 'yaml';
import { ARROW, esc, inline, untoned } from './experiment.mjs';

/**
 * The experiment map: how a paper's experiments lead into one another.
 *
 * Where an experiment diagram (experiment.mjs) shows how one experiment was
 * run, the map shows why it was run: a directed graph whose nodes are the
 * experiments and what each one showed, and whose arrows are of two kinds —
 * an experiment *showed* a finding, and a finding *motivated* the next
 * experiment. Written as YAML in a fenced block tagged `map`:
 *
 *     ```map
 *     nodes:
 *       - { id: e1, kind: experiment, n: 1, title: Train on decisions, text: Can it also report them?, href: "#1-..." }
 *       - { id: f1, kind: finding, text: Faithful self-report emerges late., value: 0.25 → 0.83 }
 *       - { id: e2, kind: experiment, n: 2, title: Locate the preferences }
 *     edges:
 *       - { from: e1, to: f1 }
 *       - { from: f1, to: e2, why: So what changed inside the model? }
 *     ```
 *
 * An experiment node can carry a `sketch`: a small schematic of what the
 * experiment does, built from three shapes (see sketchSvg). A finding node can
 * carry a `figure`: the paper's own key graph for that result.
 *
 * Nodes are drawn top to bottom in the order given, and every arrow points
 * down the page. An arrow between neighbors is a short one between them, with
 * its `why` beside it. An arrow that skips over other nodes runs down a rail in
 * the left margin, so that an experiment motivated by two earlier findings
 * visibly collects both.
 */

export const NODE_KINDS = /** @type {const} */ ({
  question: 'Starting question',
  experiment: 'Experiment',
  finding: 'Showed',
  claim: 'Conclusion',
});

export const MAP_FENCE = /^```map\n([\s\S]*?)\n```$/gm;

/**
 * @typedef {{ src: string, alt: string, caption?: string }} Figure
 * @typedef {{ alt: string, rows: any[] }} Sketch
 * @typedef {{ id: string, kind: keyof typeof NODE_KINDS, n?: number, title?: string, text?: string, value?: string, href?: string,
 *   sketch?: Sketch, figure?: Figure }} Node
 * @typedef {{ from: number, to: number, why?: string, motivates: boolean }} Edge
 * @typedef {{ nodes: Node[], edges: Edge[], symbols: Record<string, string> }} ExperimentMap
 */

/** Parse and check a map. Throws with a message that names what is wrong. */
export function parseMap(source) {
  const raw = parse(source);
  const fail = (/** @type {string} */ message) => {
    throw new Error(`experiment map: ${message}`);
  };
  if (!Array.isArray(raw?.nodes) || raw.nodes.length < 2) fail('needs a list of at least two `nodes`');

  const index = new Map();
  raw.nodes.forEach((/** @type {any} */ node, /** @type {number} */ i) => {
    if (!node.id) fail(`node ${i + 1} has no id`);
    if (index.has(node.id)) fail(`two nodes share the id "${node.id}"`);
    if (!(node.kind in NODE_KINDS)) fail(`node "${node.id}" has kind "${node.kind}"; must be one of ${Object.keys(NODE_KINDS).join(', ')}`);
    if (!node.title && !node.text) fail(`node "${node.id}" is empty`);
    if (node.figure && !(node.figure.src && node.figure.alt)) fail(`the figure on node "${node.id}" needs a src and alt text`);
    if (node.sketch) {
      if (!node.sketch.alt) fail(`the sketch on node "${node.id}" needs alt text`);
      for (const r of node.sketch.rows ?? []) {
        const type = SKETCH_ROWS.find((t) => t in r);
        if (!type) fail(`the sketch on node "${node.id}" has a row that is not one of ${SKETCH_ROWS.join(', ')}`);
      }
    }
    index.set(node.id, i);
  });

  const edges = (raw.edges ?? []).map((/** @type {any} */ edge) => {
    for (const end of [edge.from, edge.to]) if (!index.has(end)) fail(`an edge names node "${end}", which does not exist`);
    const from = index.get(edge.from);
    const to = index.get(edge.to);
    if (from >= to) fail(`the edge ${edge.from} → ${edge.to} points up the page; list nodes in the order they happened`);
    // What an experiment shows is a result; everything else is a reason to go on.
    return { from, to, why: edge.why, motivates: raw.nodes[from].kind !== 'experiment' && raw.nodes[to].kind !== 'claim' };
  });

  return /** @type {ExperimentMap} */ ({ nodes: raw.nodes, edges, symbols: raw.symbols ?? {} });
}

/**
 * A sketch is a short stack of rows, each one of three shapes, drawn small and
 * in outline so that it hints at the experiment without competing with it:
 *
 *   strip  a bar divided into ranges: layers trained or frozen, kept or removed.
 *          { n: 40, parts: [{ to: 20, style: on, label: trained }, { to: 40, style: off, label: frozen }], cut: 20 }
 *   axis   a line with marked points: checkpoints along training, values swept.
 *          { label: training steps, marks: [{ at: 0.22, label: "1000", tone: unfaithful }] }
 *   bars   two small profiles, one above the line and one below, to show whether
 *          they line up. { up: [1, 3, 9, 2], down: [1, 3, 8, 2], label: same weights, tone: faithful }
 *
 * A row may also be `note`: a line of small text. Colors follow the diagrams:
 * a `track` or a `tone` on a part, a mark or a row.
 */
const SKETCH_ROWS = /** @type {const} */ (['strip', 'axis', 'bars', 'note']);
const SK_W = 168;

/** @param {Sketch} sketch */
function sketchSvg(sketch) {
  const attrs = (/** @type {any} */ o) => (o?.tone ? ` data-tone="${o.tone}"` : '') + (o?.track ? ` data-track="${o.track}"` : '');
  const f = (/** @type {number} */ n) => Math.round(n * 10) / 10;
  const text = (/** @type {number} */ x, /** @type {number} */ y, /** @type {string} */ s, /** @type {string} */ anchor = 'start', extra = '') =>
    `<text class="sk-text" x="${f(x)}" y="${f(y)}" text-anchor="${anchor}"${extra}>${esc(s)}</text>`;
  let y = 2;
  const out = [];
  for (const row of sketch.rows ?? []) {
    if (row.note) {
      out.push(text(0, y + 9, typeof row.note === 'string' ? row.note : row.note.text, 'start', attrs(row.note)));
      y += 14;
    } else if (row.strip) {
      const { n, parts = [], cut, label } = row.strip;
      const x = (/** @type {number} */ i) => (i / n) * SK_W;
      let from = 0;
      for (const part of parts) {
        const w = x(part.to) - x(from);
        out.push(`<rect class="sk-part sk-${part.style ?? 'on'}" x="${f(x(from) + 0.5)}" y="${y + 0.5}" width="${f(w - 1)}" height="9" rx="1.5"${attrs(part)}/>`);
        if (part.label) out.push(text(x(from) + w / 2, y + 20, part.label, 'middle', attrs(part)));
        from = part.to;
      }
      if (cut !== undefined) out.push(`<path class="sk-cut" d="M${f(x(cut))} ${y - 2}v14"/>`);
      y += parts.some((/** @type {any} */ p) => p.label) ? 26 : 14;
      if (label) {
        out.push(text(0, y + 7, label));
        y += 13;
      }
    } else if (row.axis) {
      const { marks = [], label } = row.axis;
      out.push(`<path class="sk-axis" d="M0 ${y + 5}H${SK_W - 5}"/><path class="sk-axis" d="M${SK_W - 8} ${y + 2}l4 3-4 3"/>`);
      for (const mark of marks) {
        const mx = mark.at * (SK_W - 10);
        out.push(`<circle class="sk-dot" cx="${f(mx)}" cy="${y + 5}" r="3.2"${attrs(mark)}/>`);
        if (mark.label) out.push(text(mx, y + 19, mark.label, 'middle', attrs(mark)));
      }
      y += 24;
      if (label) {
        out.push(text(0, y + 7, label));
        y += 13;
      }
    } else if (row.bars) {
      const { up = [], down = [], label } = row.bars;
      const count = Math.max(up.length, down.length);
      const peak = Math.max(...up, ...down, 1);
      const bw = Math.min(9, (SK_W * 0.62) / count);
      const mid = y + 13;
      up.forEach((/** @type {number} */ v, /** @type {number} */ i) => {
        const h = (v / peak) * 12;
        out.push(`<rect class="sk-bar" x="${f(i * bw)}" y="${f(mid - h)}" width="${f(bw - 1.5)}" height="${f(h)}" data-track="behavior"/>`);
      });
      down.forEach((/** @type {number} */ v, /** @type {number} */ i) => {
        const h = (v / peak) * 12;
        out.push(`<rect class="sk-bar" x="${f(i * bw)}" y="${mid + 1}" width="${f(bw - 1.5)}" height="${f(h)}" data-track="report"/>`);
      });
      if (label) out.push(text(count * bw + 6, mid + 3, label, 'start', attrs(row.bars)));
      y += 30;
    }
  }
  return `<svg class="sk" viewBox="0 0 ${SK_W} ${y}" width="${SK_W}" height="${y}" role="img" aria-label="${esc(sketch.alt)}">${out.join('')}</svg>`;
}

const nodeName = (/** @type {Node} */ node, /** @type {ExperimentMap} */ m) => {
  if (node.kind === 'experiment') return `experiment ${node.n ?? ''}`.trim();
  if (node.kind === 'finding') {
    const source = m.edges.find((e) => m.nodes[e.to] === node && m.nodes[e.from].kind === 'experiment');
    return source ? `what experiment ${m.nodes[source.from].n ?? ''} showed`.replace('  ', ' ') : 'an earlier finding';
  }
  return NODE_KINDS[node.kind].toLowerCase();
};

/** @param {ExperimentMap} m */
export function mapHtml(m) {
  const t = (/** @type {string} */ s) => inline(s, m.symbols);
  const row = (/** @type {number} */ i) => 2 * i + 1;

  // An arrow between neighbors is drawn between them. Any other runs down a
  // rail: shortest spans closest to the nodes, and no two rails that overlap
  // in the same column.
  const near = m.edges.filter((e) => e.to === e.from + 1);
  const far = m.edges.filter((e) => e.to > e.from + 1).sort((a, b) => a.to - a.from - (b.to - b.from));
  /** @type {Edge[][]} */
  const levels = [];
  const level = new Map();
  for (const edge of far) {
    let l = levels.findIndex((taken) => taken.every((o) => edge.to < o.from || edge.from > o.to));
    if (l < 0) l = levels.push([]) - 1;
    levels[l].push(edge);
    level.set(edge, l);
  }
  const rails = levels.length;

  const railsHtml = far
    .map((e) => {
      const column = rails - level.get(e);
      return `<div class="xm-rail${e.motivates ? ' xm-motivates' : ''}" style="grid-column: ${column} / ${rails + 1}; grid-row: ${row(e.from)} / ${row(e.to)}"></div>`;
    })
    .join('');

  const nodesHtml = m.nodes
    .map((node, i) => {
      // An arrow that arrives by rail has nowhere to carry its label, so the
      // node it arrives at says where it came from and why.
      const arrivals = far
        .filter((e) => e.to === i)
        .map((e) => `<div class="xm-also">Also from ${esc(nodeName(m.nodes[e.from], m))}${e.why ? `: ${t(e.why)}` : ''}</div>`)
        .join('');
      const title = node.title ? (node.href ? `<a href="${esc(node.href)}">${t(node.title)}</a>` : t(node.title)) : '';
      const label = node.kind === 'experiment' ? `Experiment ${node.n ?? ''}` : NODE_KINDS[node.kind];
      // A sketch sits beside an experiment's words; a figure sits under a
      // finding's, since a graph needs the width.
      const words =
        `<div class="xp-kind">${esc(label)}</div>` +
        (title ? `<div class="xm-title">${title}</div>` : '') +
        (node.value ? `<div class="xp-value">${t(node.value)}</div>` : '') +
        (node.text ? `<div class="xm-text">${t(node.text)}</div>` : '') +
        arrivals;
      const figure = node.figure
        ? `<a class="xm-figure" href="${esc(node.figure.src)}"><img src="${esc(node.figure.src)}" alt="${esc(node.figure.alt)}" loading="lazy">` +
          (node.figure.caption ? `<span class="xm-figure-caption">${esc(node.figure.caption)}</span>` : '') +
          `</a>`
        : '';
      return (
        `<div class="xm-node xm-${node.kind}${node.sketch ? ' xm-with-sketch' : ''}" style="grid-column: ${rails + 1}; grid-row: ${row(i)}">` +
        (node.sketch ? `<div class="xm-words">${words}</div><div class="xm-sketch">${sketchSvg(node.sketch)}</div>` : words) +
        figure +
        `</div>`
      );
    })
    .join('');

  const linksHtml = near
    .map(
      (e) =>
        `<div class="xm-link${e.motivates ? ' xm-motivates' : ''}" style="grid-column: ${rails + 1}; grid-row: ${row(e.from) + 1}">` +
        `${ARROW}${e.why ? `<span class="xp-via">${t(e.why)}</span>` : ''}</div>`,
    )
    .join('');

  return (
    `<figure class="xm" style="--rails:${rails}">` +
    `<div class="xm-grid">${railsHtml}${nodesHtml}${linksHtml}</div>` +
    `<figcaption><span class="xm-key"><span class="xm-key-line"></span> showed</span> ` +
    `<span class="xm-key"><span class="xm-key-line xm-motivates"></span> motivated</span></figcaption>` +
    `</figure>`
  );
}

/**
 * The same map as an outline, for the markdown twin.
 * @param {ExperimentMap} m
 */
export function mapText(m) {
  const name = (/** @type {Node} */ node) =>
    node.kind === 'experiment' ? `Experiment ${node.n ?? ''}${node.title ? `: ${node.title}` : ''}` : nodeName(node, m);
  const out = ['**Map of the experiments** (each arrow is either "showed" or "motivated")', ''];
  m.nodes.forEach((node, i) => {
    const head = node.kind === 'experiment' ? `Experiment ${node.n ?? ''}` : NODE_KINDS[node.kind];
    out.push(`- **${head}.** ${[node.title, node.value, node.text].filter(Boolean).join('. ')}`);
    if (node.sketch) out.push(`  - Sketch: ${node.sketch.alt}`);
    if (node.figure) out.push(`  - ![${node.figure.alt}](${node.figure.src}${node.figure.caption ? ` "${node.figure.caption}"` : ''})`);
    for (const e of m.edges.filter((edge) => edge.from === i)) {
      out.push(`  - ${e.motivates ? 'motivated' : 'showed'} → ${name(m.nodes[e.to])}${e.why ? ` ("${e.why}")` : ''}`);
    }
  });
  return untoned(out.join('\n'));
}
