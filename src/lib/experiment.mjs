// @ts-check
import { parse } from 'yaml';

/**
 * The experiment diagram: one notation for every experiment on the wiki.
 *
 * A diagram is written as YAML in a fenced block:
 *
 *     ```experiment
 *     question: Can a model trained only to decide also say how it decides?
 *     lanes: [{ name: Behavior, track: behavior }, { name: Self-report, track: report }]
 *     steps:
 *       - stage: data
 *         all:
 *           - { kind: data, title: 100 fictional characters, text: ... }
 *       - stage: probe
 *         cells:
 *           - items: [{ kind: prompt, quote: "Would you choose A or B?" }]
 *           - items: [{ kind: prompt, quote: "How did you weight each attribute?" }]
 *     ```
 *
 * It reads top to bottom through up to seven stages, always in this order and
 * always with these names, so a reader who has learned one diagram can read
 * them all. It opens with why the experiment was run (what prompted it, what
 * it was meant to find out, what it was meant to build for later) and closes
 * with what it led to, so each diagram carries its own place in the argument. Columns are lanes: conditions or tracks that run in parallel. A
 * cell that spans lanes is shared by them, so reading across a row shows what
 * differs between conditions and what is held the same.
 *
 * A box should show an instance, not describe one: the actual prompt, a row of
 * the data, a reply. That goes in `example`, set in monospace. An example taken
 * from the paper names where (`from: Appendix A.2`); one without a source is
 * labeled "illustrative" automatically, so an invented value can never pass
 * for a reported one.
 *
 * The same source renders two ways: as HTML for the page (experimentHtml) and
 * as an outline for the markdown twin (experimentText). Text stays text in
 * both, which is the point: nothing in a diagram is locked inside an image.
 *
 * The vocabulary is explained to readers in src/content/pages/diagrams.md.
 */

export const STAGES = /** @type {const} */ (['why', 'data', 'model', 'probe', 'score', 'compare', 'next']);
const STAGE_LABEL = { why: 'Why', data: 'Data', model: 'Model', probe: 'Probe', score: 'Score', compare: 'Compare', next: 'Next' };

// Every box is one of these. `change` is anything done to a model or a
// pipeline (fine-tune, freeze, inject, ablate, filter) and is labeled with its
// own verb.
export const KINDS = /** @type {const} */ ({
  // Why: the three ways an experiment is motivated.
  because: 'Prompted by',
  aim: 'To find out',
  product: 'To build',
  data: 'Data',
  truth: 'Ground truth',
  model: 'Model',
  change: 'Change',
  prompt: 'Prompt',
  reply: 'Reply',
  read: 'Readout',
  measure: 'Measure',
  judge: 'Judge',
  result: 'Result',
  // Next: where its result is used.
  leads: 'Leads to',
});

// The two things this literature compares, plus what only the experimenter knows.
export const TRACKS = /** @type {const} */ (['behavior', 'report', 'truth']);

// The two kinds of model it contrasts. A lane, a box or a run of text can take
// a tone, and wears it everywhere: red for unfaithful, blue for faithful.
export const TONES = /** @type {const} */ (['unfaithful', 'faithful']);
const TONED = new RegExp(`\\{(${TONES.join('|')})\\|([^}]+)\\}`, 'g');

/** Drop the tone markup, keeping the words: for readers that only get text. */
export const untoned = (/** @type {string} */ s) => s.replace(TONED, '$2');

export const PROPERTIES = /** @type {const} */ ({
  faithfulness: 'Faithfulness',
  grounding: 'Grounding',
  'privileged-access': 'Privileged access',
});

export const EXPERIMENT_FENCE = /^```experiment\n([\s\S]*?)\n```$/gm;

/**
 * @typedef {{ kind: keyof typeof KINDS, verb?: string, title?: string, value?: string, quote?: string,
 *   text?: string, example?: string, from?: string, tags: string[], track?: string, tone?: string }} Item
 * @typedef {{ start: number, span: number, via?: string, items: Item[] }} Cell
 * @typedef {{ stage: typeof STAGES[number], cells: Cell[] }} Step
 * @typedef {{ title?: string, question?: string, lanes: { name: string, track?: string, tone?: string }[],
 *   symbols: Record<string, string>, steps: Step[], finding?: string, paper?: string, bears_on: string[] }} Experiment
 */

/** Parse and check a diagram. Throws with a message that names what is wrong. */
export function parseExperiment(source) {
  const raw = parse(source);
  const fail = (/** @type {string} */ message) => {
    throw new Error(`experiment diagram: ${message}`);
  };
  if (!raw || typeof raw !== 'object') fail('the block is empty');
  if (!Array.isArray(raw.steps) || raw.steps.length === 0) fail('needs a list of `steps`');

  const lanes = (raw.lanes ?? [{ name: '' }]).map((/** @type {any} */ l) => (typeof l === 'string' ? { name: l } : l));
  for (const lane of lanes) {
    if (lane.track && !TRACKS.includes(lane.track)) fail(`lane track "${lane.track}" is not one of ${TRACKS.join(', ')}`);
    if (lane.tone && !TONES.includes(lane.tone)) fail(`lane tone "${lane.tone}" is not one of ${TONES.join(', ')}`);
  }

  let last = -1;
  const steps = raw.steps.map((/** @type {any} */ step, /** @type {number} */ n) => {
    const order = STAGES.indexOf(step.stage);
    if (order < 0) fail(`step ${n + 1} has stage "${step.stage}"; must be one of ${STAGES.join(', ')}`);
    if (order < last) fail(`step ${n + 1} (${step.stage}) comes after a later stage; stages run ${STAGES.join(' → ')}`);
    last = order;

    const given = step.all ? [{ span: 'all', items: step.all, via: step.via }] : step.cells;
    if (!Array.isArray(given)) fail(`step ${n + 1} (${step.stage}) needs \`all\` or \`cells\``);
    let start = 0;
    const cells = given.map((/** @type {any} */ cell) => {
      const span = cell.span === 'all' ? lanes.length : cell.span ?? 1;
      const items = (cell.items ?? []).map((/** @type {any} */ item) => {
        if (!(item.kind in KINDS)) fail(`step ${n + 1} (${step.stage}) has an item of kind "${item.kind}"; must be one of ${Object.keys(KINDS).join(', ')}`);
        if (item.track && !TRACKS.includes(item.track)) fail(`item track "${item.track}" is not one of ${TRACKS.join(', ')}`);
        if (item.tone && !TONES.includes(item.tone)) fail(`item tone "${item.tone}" is not one of ${TONES.join(', ')}`);
        if (item.from && !item.example) fail(`step ${n + 1} (${step.stage}) has a \`from\` with no \`example\``);
        if (!item.title && !item.text && !item.quote && !item.value && !item.example) fail(`step ${n + 1} (${step.stage}) has an empty ${item.kind} item`);
        return { ...item, example: item.example && String(item.example).trimEnd(), tags: item.tags ?? [] };
      });
      const placed = { start, span, via: cell.via, items };
      start += span;
      return placed;
    });
    if (start !== lanes.length) fail(`step ${n + 1} (${step.stage}) fills ${start} lane(s) but the diagram has ${lanes.length}`);
    return { stage: step.stage, cells };
  });

  const bears_on = raw.bears_on ?? [];
  for (const p of bears_on) if (!(p in PROPERTIES)) fail(`bears_on "${p}" is not one of ${Object.keys(PROPERTIES).join(', ')}`);

  return /** @type {Experiment} */ ({
    title: raw.title,
    question: raw.question,
    lanes,
    symbols: raw.symbols ?? {},
    steps,
    finding: raw.finding,
    paper: raw.paper,
    bears_on,
  });
}

export const esc = (/** @type {string} */ s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Inline text: `code`, *emphasis*, [links](/path) and {faithful|toned words}. Inside code, a declared
 * symbol is colored by its track wherever it stands alone, so `corr(p̂, p̃)`
 * shows at a glance that it joins a behavior quantity to a report quantity.
 */
export function inline(text, symbols) {
  const names = Object.keys(symbols).sort((a, b) => b.length - a.length);
  const symbol = names.length
    ? new RegExp(`(?<![\\p{L}\\p{N}_])(${names.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\p{L}\\p{N}_\\p{M}])`, 'gu')
    : null;
  return String(text)
    .split(/(`[^`]+`)/)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        const code = esc(part.slice(1, -1));
        return `<code>${symbol ? code.replace(symbol, (s) => `<span class="xp-sym" data-track="${symbols[s]}">${s}</span>`) : code}</code>`;
      }
      return esc(part)
        .replace(TONED, '<span class="xp-tone" data-tone="$1">$2</span>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    })
    .join('');
}

// 16px line icons, drawn in the current text color.
const ICONS = {
  because: '<path d="M3 2.5V8h9.5"/><path d="m9.5 5 3 3-3 3"/>',
  aim: '<circle cx="8" cy="8" r="5.5"/><path d="M6.4 6.5a1.7 1.7 0 1 1 2.5 1.5c-.6.3-.9.6-.9 1.2"/><circle cx="8" cy="11.2" r=".5" fill="currentColor"/>',
  product: '<path d="M2.5 5.2 8 2.5l5.5 2.7v5.6L8 13.5l-5.5-2.7z"/><path d="M2.5 5.2 8 8l5.5-2.8M8 8v5.5"/>',
  leads: '<path d="M2.5 8h10"/><path d="m9 4.5 3.5 3.5L9 11.5"/>',
  data: '<path d="M5 2.5h8.5v8.5"/><rect x="2.5" y="5" width="8.5" height="8.5" rx="1"/>',
  truth: '<rect x="3.5" y="7" width="9" height="6.5" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>',
  // The motif for a model: a small head with an antenna. It takes the tone of
  // the model it stands for, filled lightly, so the faithful and unfaithful
  // models are recognizable wherever they turn up.
  model: '<rect x="2.5" y="5" width="11" height="8.5" rx="2" fill="currentColor" fill-opacity=".16"/><path d="M8 5V2.6"/><circle cx="8" cy="2" r=".6" fill="currentColor"/><circle cx="5.9" cy="8.4" r=".7" fill="currentColor"/><circle cx="10.1" cy="8.4" r=".7" fill="currentColor"/><path d="M6.4 11h3.2"/>',
  change: '<path d="M9 1.5 3.5 9H8l-1 5.5L12.5 7H8z"/>',
  prompt: '<path d="M2.5 3.5h11v7.5H6l-3.5 3z"/>',
  reply: '<path d="M13.5 3.5h-11V11H10l3.5 3z"/>',
  read: '<circle cx="8" cy="8" r="4.5"/><path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3"/>',
  measure: '<path d="M11.5 3.5h-7L8 8l-3.5 4.5h7"/>',
  judge: '<rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/><path d="m5 8.2 2.2 2.2L11 6"/>',
  result: '<path d="M3 6h10M3 10h10"/>',
};
const icon = (/** @type {string} */ kind) =>
  `<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[kind]}</svg>`;

export const ARROW =
  '<svg viewBox="0 0 12 22" width="12" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 1v19M1.5 15.5 6 20.5l4.5-5"/></svg>';

/** Where an example came from. No source means it was made up to show the form. */
const exampleLabel = (/** @type {Item} */ item) => (item.from ? `Example, ${item.from}` : 'Example, illustrative');

const kindLabel = (/** @type {Item} */ item) => (item.kind === 'change' && item.verb ? item.verb : KINDS[item.kind]);

/** @param {Experiment} x */
export function experimentHtml(x) {
  const t = (/** @type {string} */ s) => inline(s, x.symbols);
  const many = x.lanes.length > 1;
  const col = (/** @type {Cell} */ c) => `grid-column: ${c.start + 2} / span ${c.span}`;

  const itemHtml = (/** @type {Item} */ item, /** @type {{ track?: string, tone?: string } | undefined} */ lane) => {
    const track = item.track ?? lane?.track;
    const tone = item.tone ?? lane?.tone;
    return (
      `<div class="xp-item xp-k-${item.kind}"${track ? ` data-track="${track}"` : ''}${tone ? ` data-tone="${tone}"` : ''}>` +
      `<div class="xp-kind">${icon(item.kind)}<span>${esc(kindLabel(item))}</span></div>` +
      (item.title ? `<div class="xp-title">${t(item.title)}</div>` : '') +
      (item.value ? `<div class="xp-value">${t(item.value)}</div>` : '') +
      (item.quote ? `<blockquote class="xp-quote">${esc(item.quote)}</blockquote>` : '') +
      (item.text ? `<div class="xp-text">${t(item.text)}</div>` : '') +
      (item.example ? `<div class="xp-example"><div class="xp-eg">${esc(exampleLabel(item))}</div><pre>${esc(item.example)}</pre></div>` : '') +
      (item.tags.length ? `<ul class="xp-tags">${item.tags.map((tag) => `<li>${t(tag)}</li>`).join('')}</ul>` : '') +
      `</div>`
    );
  };

  const laneAttrs = (/** @type {{ track?: string, tone?: string }} */ l) =>
    (l.track ? ` data-track="${l.track}"` : '') + (l.tone ? ` data-tone="${l.tone}"` : '');

  // A lane is named on each cell that belongs to it, not in a header row: a
  // diagram often opens with rows shared by every lane, and a header above
  // those would label a division that has not happened yet.
  let row = 0;
  const rows = [];

  x.steps.forEach((step, n) => {
    const prev = x.steps[n - 1];
    if (prev) {
      // One arrow wherever a cell above feeds a cell below: centered on the
      // lanes the two share. A shared cell above two lane cells therefore
      // forks, and two lane cells above a shared one merge.
      const arrows = [];
      for (const above of prev.cells) {
        for (const below of step.cells) {
          const from = Math.max(above.start, below.start);
          const to = Math.min(above.start + above.span, below.start + below.span);
          if (to <= from || !above.items.length || !below.items.length) continue;
          const via = below.via && !arrows.some((a) => a.includes(`>${t(below.via)}<`)) ? `<span class="xp-via">${t(below.via)}</span>` : '';
          arrows.push(`<div class="xp-arrow" style="grid-column: ${from + 2} / span ${to - from}">${ARROW}${via}</div>`);
        }
      }
      rows.push(`<div class="xp-row xp-conn" style="--row:${++row}">${arrows.join('')}</div>`);
    }

    const label = prev?.stage === step.stage ? '' : STAGE_LABEL[step.stage];
    const cells = step.cells
      .filter((c) => c.items.length)
      .map((c) => {
        const lane = c.span === 1 ? x.lanes[c.start] : undefined;
        const wide = c.span > 1 || !many;
        return (
          `<div class="xp-cell${wide ? ' xp-wide' : ''}"${lane ? laneAttrs(lane) : ''} style="${col(c)}">` +
          (many && lane ? `<div class="xp-lane-tag">${lane.tone ? icon('model') : ''}${esc(lane.name)}</div>` : '') +
          c.items.map((item) => itemHtml(item, lane)).join('') +
          `</div>`
        );
      })
      .join('');
    rows.push(`<div class="xp-row xp-step" style="--row:${++row}"><div class="xp-stage">${label}</div>${cells}</div>`);
  });

  const foot = [
    x.paper && `Paper: ${esc(x.paper)}`,
    x.bears_on.length && `Bears on: ${x.bears_on.map((p) => `<a href="/concepts/${p}">${PROPERTIES[p].toLowerCase()}</a>`).join(', ')}`,
  ].filter(Boolean);

  const head =
    (x.title ? `<strong class="xp-name">${t(x.title)}</strong>` : '') + (x.question ? `<span class="xp-question">${t(x.question)}</span>` : '');

  return (
    `<figure class="xp" style="--lanes:${x.lanes.length}">` +
    (head ? `<div class="xp-head">${head}</div>` : '') +
    `<div class="xp-grid">${rows.join('')}</div>` +
    `<figcaption>${x.finding ? `<span class="xp-finding">${t(x.finding)}</span> ` : ''}<span class="xp-foot">${foot.join(' · ')}</span></figcaption>` +
    `</figure>`
  );
}

/**
 * The same diagram as an outline, for the markdown twin.
 * @param {Experiment} x
 */
export function experimentText(x) {
  const many = x.lanes.length > 1;
  const itemText = (/** @type {Item} */ item, /** @type {string} */ indent) => {
    const line = [
      `${kindLabel(item)}:`,
      [item.title, item.value].filter(Boolean).join(' = ') + (item.title || item.value ? '.' : ''),
      item.quote && `"${item.quote}"`,
      item.text,
      item.tags.length && `[${item.tags.join('; ')}]`,
    ]
      .filter(Boolean)
      .join(' ');
    if (!item.example) return `${indent}- ${line}`;
    const inside = `${indent}  `;
    const lines = item.example.split('\n');
    return lines.length === 1
      ? `${indent}- ${line} ${exampleLabel(item)}: \`${lines[0]}\``
      : [`${indent}- ${line} ${exampleLabel(item)}:`, `${inside}\`\`\``, ...lines.map((l) => inside + l), `${inside}\`\`\``].join('\n');
  };

  const out = [`**Experiment diagram${x.title ? `: ${x.title}` : ''}**`, ''];
  if (x.question) out.push(`Question: ${x.question}`, '');
  if (many) out.push(`Lanes, side by side: ${x.lanes.map((l) => l.name).join(' | ')}`, '');
  for (const step of x.steps) {
    out.push(`- **${STAGE_LABEL[step.stage]}**`);
    for (const cell of step.cells) {
      if (!cell.items.length) continue;
      const where = !many ? '' : cell.span === x.lanes.length ? 'All lanes' : x.lanes.slice(cell.start, cell.start + cell.span).map((l) => l.name).join(' and ');
      const via = cell.via ? ` (${cell.via})` : '';
      if (where || via) {
        out.push(`  - ${where || 'Then'}${via}:`);
        for (const item of cell.items) out.push(itemText(item, '    '));
      } else {
        for (const item of cell.items) out.push(itemText(item, '  '));
      }
    }
  }
  out.push('');
  if (x.finding) out.push(`Finding: ${x.finding}`, '');
  const foot = [x.paper && `Paper: ${x.paper}`, x.bears_on.length && `Bears on: ${x.bears_on.join(', ')}`].filter(Boolean);
  if (foot.length) out.push(`${foot.join('. ')}.`);
  return untoned(out.join('\n').trimEnd());
}
