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
 * @typedef {{ id: string, kind: keyof typeof NODE_KINDS, n?: number, title?: string, text?: string, value?: string, href?: string }} Node
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
      return (
        `<div class="xm-node xm-${node.kind}" style="grid-column: ${rails + 1}; grid-row: ${row(i)}">` +
        `<div class="xp-kind">${esc(label)}</div>` +
        (title ? `<div class="xm-title">${title}</div>` : '') +
        (node.value ? `<div class="xp-value">${t(node.value)}</div>` : '') +
        (node.text ? `<div class="xm-text">${t(node.text)}</div>` : '') +
        arrivals +
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
    `<span class="xm-key"><span class="xm-key-line xm-motivates"></span> motivated</span> ` +
    `<span class="xp-foot"><a href="/diagrams#the-map">How to read this</a></span></figcaption>` +
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
    for (const e of m.edges.filter((edge) => edge.from === i)) {
      out.push(`  - ${e.motivates ? 'motivated' : 'showed'} → ${name(m.nodes[e.to])}${e.why ? ` ("${e.why}")` : ''}`);
    }
  });
  return untoned(out.join('\n'));
}
