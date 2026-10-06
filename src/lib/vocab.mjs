// @ts-check
// The fixed vocabularies used in page frontmatter. Plain JavaScript so that
// both the Astro content schema and scripts/lint.mjs can import the one list.
// What each value means is documented for readers in src/content/pages/about.md.

export const TIER_VALUES = /** @type {const} */ (['seed', 'core', 'adjacent']);
export const STATUS_VALUES = /** @type {const} */ (['stub', 'full']);

// How directly a paper bears on a property: it ran an experiment measuring it,
// it made a claim without one, or the property is outside what the paper does.
export const LEVEL_VALUES = /** @type {const} */ (['tested', 'argued', 'not-addressed']);

export const METHOD_VALUES = /** @type {const} */ ([
  'behavioral',
  'fine-tuning',
  'self-prediction',
  'concept-injection',
  'patching',
  'ablation',
  'probing',
  'circuit-analysis',
  'conceptual',
]);

// The paper's own conclusion about whether models introspect. `framework`: it
// defines terms or proposes a test rather than reporting a result either way.
export const STANCE_VALUES = /** @type {const} */ (['supports', 'mixed', 'skeptical', 'framework']);
