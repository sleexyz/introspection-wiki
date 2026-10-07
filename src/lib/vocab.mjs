// @ts-check
// The fixed vocabularies used in page frontmatter. Plain JavaScript so that
// both the Astro content schema and scripts/lint.mjs can import the one list.
// What each value means is documented for readers in src/content/pages/about.md.

export const TIER_VALUES = /** @type {const} */ (['seed', 'core', 'adjacent']);
export const STATUS_VALUES = /** @type {const} */ (['stub', 'full']);

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
