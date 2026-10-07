---
title: "About this wiki"
summary: "What the wiki covers, how its pages are written, and what the labels on them mean."
updated: 2026-10-06
---

## What it covers

Large language models make claims about themselves: what they prefer, what they know, why they answered as they did. This wiki collects the research on when those claims can be believed.

It uses the definition from [Atkinson, Plunkett & Bau (2026)](/papers/atkinson2026-identifying-introspection). A self-report is *introspection* only if it is both:

- **[Faithful](/concepts/faithfulness)**: it matches what the model actually does or represents.
- **[Grounded](/concepts/grounding)**: it is caused by the state or process it describes.

A model that describes itself correctly by guessing, or from something it memorized separately, is faithful without being grounded. Much of the literature is about telling these apart.

The wiki started from that one paper and grows outward along its citation graph.

## How pages are written

Each paper page is drafted by an AI model (Claude) from the paper's full text. A page opens with the paper's experiments: a map that traces them from the question the paper starts with to its conclusion, showing what each experiment showed and what that prompted next, and then a diagram of how each experiment was run. [Reading the diagrams](/diagrams) explains the notation.

After the experiments comes the authors' own thread about the paper, where they posted one: each post embedded, with the detail from the paper under it. A thread is usually the authors' densest account of what matters.

Every page says what it was written from and whether a person has reviewed it. Until then, treat specifics as a pointer to the paper, not a substitute for it. If you find an error, [open an issue](https://github.com/sleexyz/introspection-wiki/issues).

A page marked *stub* has only bibliographic details and a one-line description. On the HTML pages, a link to a stub is red, and a link that leaves the wiki ends in a small arrow.

## Tiers

- **Seed**: the paper the wiki grew from.
- **Core**: work on introspection itself, whether it reports evidence for it, evidence against it, or a way of testing it.
- **Adjacent**: neighboring questions the core work leans on, such as out-of-context reasoning or eliciting hidden knowledge.

## At a glance

Every full paper page opens with the same short block, so a page can be skimmed and papers can be compared.

**Questions and answers.** The question the paper set out to answer, with its answer, and under it the questions it broke that into. It is a shallow tree: the leading question at the root and at most two levels beneath it. Each question links to the experiment that answered it.

**Key terms.** The words the paper's argument turns on, such as *introspection*, *faithful* or *grounded*, as that paper defines them. Papers use these words differently, so the definitions are each paper's own, with where in the paper they come from.

**The setup.** What the model reports on, the methods (one or more of `behavioral`, `fine-tuning`, `self-prediction`, `concept-injection`, `patching`, `ablation`, `probing`, `circuit-analysis`, `conceptual`), and the models studied.

The wiki does not yet label papers by which property they establish, or by whether they come out for or against introspection. Those judgments, and the question of whether [privileged access](/concepts/privileged-access) is something separate from grounding, are still open. The [papers table](/papers) shows the setups side by side.

## The frontier

The [frontier](/frontier) lists papers that are one citation away from the wiki and do not have a page. A crawler collects the references and citers of every paper page; anything connected to two or more pages is listed. Each candidate gets a suggested triage label. A candidate becomes a page only after a person accepts it.

## For language models

The site is built to be read by machines as well as people.

- Every page has a markdown twin at its URL plus `.md`: [/papers.md](/papers.md), [/index.md](/index.md).
- A request for any page URL with `Accept: text/markdown` returns the twin.
- [/llms.txt](/llms.txt) is an index of the site in the [llms.txt](https://llmstxt.org) format. [/llms-full.txt](/llms-full.txt) is every page in one file.
- Structured data: [/data/papers.json](/data/papers.json), [/data/graph.json](/data/graph.json), [/data/frontier.json](/data/frontier.json), [/references.bib](/references.bib).
- [/robots.txt](/robots.txt) allows all crawlers and sets the content signals `search=yes, ai-input=yes, ai-train=yes`.
- [/sitemap.xml](/sitemap.xml) and an Atom feed at [/feed.xml](/feed.xml).

Pages are static HTML and need no JavaScript. The only script on the site loads X's embeds on thread pages, and those pages carry the post text without it.

## Sources and credit

- Citation data comes from the [Semantic Scholar](https://www.semanticscholar.org) API, with reference lists from arXiv's HTML renderings where Semantic Scholar has none.
- Threads are embedded from X using its official embed markup. The wiki does not host images or other media from posts; the figure descriptions under each post are its own.
- Figures are reproduced from the papers they illustrate, for commentary, and remain the property of those papers' authors. Each is captioned with the figure number it has in the paper. If you are an author and want one removed, [open an issue](https://github.com/sleexyz/introspection-wiki/issues).
- Paper PDFs are linked, not hosted.

## License

The wiki's own text is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Quoted posts, figures, paper titles and abstracts belong to their authors and are not covered by that license. The site's code is MIT-licensed. Both are in the [GitHub repository](https://github.com/sleexyz/introspection-wiki).

Maintained by [Sean Lee](https://infinite.fun).
