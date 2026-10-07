// Where a paper page's locators and quotations sit in the paper's PDF, as
// written by scripts/anchor.mjs. A paper with no such file gets no reader.
export type Anchors = {
  pdf: string;
  pages: number;
  /** Left and right edge of the band of the page that holds text, in points. */
  crop: [number, number];
  dests: Record<string, number[]>;
  quotes: Record<string, number[][][]>;
  elsewhere: string[];
};

const files = import.meta.glob<Anchors>('../data/anchors/*.json', { eager: true, import: 'default' });

export const getAnchors = (paperId: string): Anchors | undefined => files[`../data/anchors/${paperId}.json`];
