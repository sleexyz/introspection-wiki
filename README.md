# LLM Introspection Wiki

Papers and resources on introspection in large language models: the ability of a
model to report on its own internal states in a way that is both faithful and
causally grounded.

**https://introspection.infinite.fun**

The wiki starts from [Identifying Introspection From the Inside](https://iii.baulab.info)
(Atkinson, Plunkett & Bau, COLM 2026) and grows outward along its citation graph.
Each paper page has a summary, an evidence card saying what the paper tested, and
links to the authors' own threads about it.

## Reading it as a machine

Every page has a markdown twin at its URL plus `.md`, and returns it for
`Accept: text/markdown`.

- [`/llms.txt`](https://introspection.infinite.fun/llms.txt): index of the site
- [`/llms-full.txt`](https://introspection.infinite.fun/llms-full.txt): every page in one file
- [`/data/papers.json`](https://introspection.infinite.fun/data/papers.json),
  [`/data/graph.json`](https://introspection.infinite.fun/data/graph.json),
  [`/data/frontier.json`](https://introspection.infinite.fun/data/frontier.json),
  [`/references.bib`](https://introspection.infinite.fun/references.bib)

## Corrections

Summaries are drafted by an AI model from each paper's full text and are marked
as unreviewed until a person has checked them. If something is wrong,
[open an issue](https://github.com/sleexyz/introspection-wiki/issues) or send a
pull request against the page in `src/content/`.

## Development

Requires Node 22.12 or later.

    npm install
    npx astro dev          # or: just dev
    npm run preview        # build and serve through the Worker on :8787
    npm run deploy

`AGENTS.md` describes the layout and how pages are written.

## License

Text in `src/content/` is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Code is MIT. See `LICENSE.md`. Quoted posts and papers belong to their authors.
