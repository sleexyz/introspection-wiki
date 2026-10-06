# LLM Introspection Wiki

A public wiki of papers and resources on introspection in large language models,
live at https://introspection.infinite.fun. Astro builds static pages; a small
Cloudflare Worker serves them and returns markdown to clients that ask for it.

## Commands

    just dev        # astro dev server
    just build      # production build into dist/
    just preview    # build, then serve through the real Worker on :8787
    just deploy     # build and wrangler deploy
    just lint       # check frontmatter and internal links, no build needed
    just check URL  # assert the agent-facing surface (twins, negotiation, llms.txt)
    just thread <post-url> <thread-id> [paper-id ...]   # import a thread from X
    just figure page|crop ...                           # cut a figure out of a paper's PDF
    just crawl      # recrawl citations and rebuild the frontier

## Layout

- `src/content/papers/<id>.md`: one page per paper. Schema in `src/content.config.ts`.
- `src/content/concepts/<id>.md`: one page per concept.
- `src/content/threads/<id>.json`: written by `scripts/thread.mjs`; hand-edit only
  `title`, `summary`, `papers`, `author.name` and each image's `alt`.
- `src/content/pages/about.md`: the About page, including the public definition of
  every label. Change a label there when you change it in the schema.
- `src/data/frontier.json`, `edges.json`: written by `scripts/crawl.mjs`. Do not
  edit. `triage.json` (candidate key -> `{triage, note}`) and `leads.json` are
  edited by hand and survive a recrawl.
- `public/figures/<paper-id>/`: figures cut from papers by `scripts/figure.mjs`.
- `src/lib/experiment.mjs`: the experiment diagram notation: parser, HTML
  renderer and the outline used in markdown twins.
- `src/lib/remark-wiki.mjs`: the `::post` and figure conventions used in page
  bodies. It also gives a body link to a stub the class that colors it red.
- `src/components/PaperLink.astro`: a link to a paper page, red when the page is
  a stub. Templates link to papers through it.
- `src/lib/markdown.ts`: the markdown twin of every page. A new kind of page
  needs a twin here and a `.md.ts` route beside its `.astro` route.
- `src/lib/vocab.mjs`: the allowed values for tier, status, methods, evidence
  levels and stance, shared by the schema and the linter.
- `worker/index.ts`: markdown content negotiation.
- `data/raw/`: gitignored. Paper PDFs, images from posts, raw API responses.
  This repo is public: never commit or publish anything from there.

## Writing a paper page

Use `src/content/papers/atkinson2026-identifying-introspection.md` as the model.

1. **Read the full text**, not the abstract. Save the PDF or HTML under
   `data/raw/papers/<id>/` and list what you read in `sources`.
2. **Follow the authors' thread when there is one.** A thread is usually the
   authors' densest account of what matters. Import it with `just thread` and
   describe its figures in `alt`. Then structure the summary around its beats:
   each `###` section opens with the post it follows, embedded by a line of its
   own,

       ::post <thread-id> 4

   and the text under it fills in what the post compresses, ending with where
   in the paper it comes from ("Paper: §3, Figure 2."). Embed the posts that
   carry the argument, in thread order; skip link-only and thank-you posts. Add
   a section for what the paper has that the thread leaves out. With no thread,
   follow the paper's own list of contributions.
3. **Show the paper's figures** where the argument needs them and no embedded
   post already shows the same figure: usually one to three per page (the
   setup, the main result). Cut them from the PDF:

       just figure page <id> <page>                      # look at the page
       just figure crop <id> <page> <x> <y> <w> <h> <name>

   then open the result and check the edges. Place it with an image on its own
   line, with a caption that says which figure of the paper it is:

       ![What the figure shows, in words.](/figures/<id>/<name>.png "Figure 2 of the paper: what it plots.")

   The alt text is what a reader without the image gets, including every
   language model reading the markdown twin, so it must carry the content:
   axes, groups, and the pattern the figure is there to show. Describe only
   what is visible. Figures belong to the paper's authors; never present one
   as the wiki's own.
4. **Every number comes from the source**, with the section or figure it came
   from. Do not read values off charts unless the text states them.
5. **Do not say more than the paper does.** Attribute interpretations ("the
   authors hypothesize"). Keep their hedges. Report limitations they state.
6. **Fill in the evidence card** using the definitions in the About page.
   `tested` means the paper ran an experiment measuring that property; `argued`
   means it made a claim without one. The card records what was examined, not
   what was found. Put the reasoning for any judgment call in `evidence.note`.
7. Set `status: full`, leave `reviewed: false` (a person flips it), and update
   `updated`.
8. `summary` is one or two plain sentences stating the finding, not the topic.

Ids are `<first-author><year>-<short-title>`. Internal links are site-relative
with no extension and no trailing slash: `/papers/<id>`, `/concepts/<id>`.
A link to a page that does not exist fails the build.

## Drawing an experiment

Every experiment a paper runs gets a diagram, and every diagram uses the one
notation in `src/lib/experiment.mjs`, explained to readers at `/diagrams`
(`src/content/pages/diagrams.md`). Do not draw an experiment any other way: the
value is that a reader who has learned one diagram can read them all.

A diagram is YAML in a fenced block tagged `experiment`. The seed paper has
five to copy from. The rules:

- **Five stages, always in this order, skipping any that do not apply:** `data`
  (what was built, and what only the experimenters know), `model` (which model,
  and what was done to it), `probe` (what it is asked, or what is read from
  inside it), `score` (how outputs become numbers: a regression, a parser, a
  judge model with its rubric), `compare` (the contrast that carries the claim,
  with the result). A stage may repeat when two things happen in sequence.
- **Lanes are the things compared**: behavior against self-report, or one
  condition against another. Put what the lanes share in a cell that spans them
  (`all:`), so that reading across a row shows exactly what differs.
- **Ten kinds of box**: `data`, `truth`, `model`, `change` (with a `verb`),
  `prompt`, `reply`, `read`, `measure`, `judge`, `result`. Quote real prompt
  text in `quote`. Put the number in `value`.
- **Two colors, one meaning**: `track: behavior` for what the model does,
  `track: report` for what it says about itself. Declare the paper's symbols
  under `symbols` so a formula in backticks shows which sides it joins.
- **Tags** are for conditions a reader needs to interpret the result
  ("separate context window", "never trained on this"), not for decoration.
- Keep boxes to a title and a sentence. Put the conclusion in `finding`, the
  sections it came from in `paper`, and the properties it tests in `bears_on`.
- Every number and quoted prompt follows the same sourcing rule as the prose.

Put the diagrams in a section called "The experiments", after "In brief", one
`###` heading per experiment. `just lint` checks the notation.

## Style

Plain, specific sentences. State the claim, then the number that supports it.
No hype words, no rhetorical questions, no "it is worth noting". Tier and
evidence labels describe the paper, not its quality.

## Adding papers

New papers come from the frontier. `just crawl` rebuilds it; record a suggested
`add`, `maybe` or `skip` with a one-line reason in `src/data/triage.json`. A
candidate becomes a page only after the maintainer accepts it.
