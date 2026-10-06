# LLM Introspection Wiki

A public wiki of papers and resources on introspection in large language models,
live at https://introspection.infinite.fun. Astro builds static pages; a small
Cloudflare Worker serves them and returns markdown to clients that ask for it.

## Commands

    just dev        # astro dev server
    just build      # production build into dist/
    just preview    # build, then serve through the real Worker on :8787
    just deploy     # build and wrangler deploy
    just check URL  # assert the agent-facing surface (twins, negotiation, llms.txt)
    just thread <post-url> <thread-id> [paper-id ...]   # import a thread from X
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
- `src/lib/markdown.ts`: the markdown twin of every page. A new kind of page
  needs a twin here and a `.md.ts` route beside its `.astro` route.
- `worker/index.ts`: markdown content negotiation.
- `data/raw/`: gitignored. Paper PDFs, images from posts, raw API responses.
  This repo is public: never commit or publish anything from there.

## Writing a paper page

Use `src/content/papers/atkinson2026-identifying-introspection.md` as the model.

1. **Read the full text**, not the abstract. Save the PDF or HTML under
   `data/raw/papers/<id>/` and list what you read in `sources`.
2. **Follow the authors' thread when there is one.** A thread is usually the
   authors' densest account of what matters. Import it with `just thread`,
   describe its figures in `alt`, and structure the summary around its beats,
   linking each to the post (`/threads/<thread-id>#post-4`). Fill in what the
   thread compresses, then add a section for what the paper has that the thread
   leaves out. With no thread, follow the paper's own list of contributions.
3. **Every number comes from the source**, with the section or figure it came
   from. Do not read values off charts unless the text states them.
4. **Do not say more than the paper does.** Attribute interpretations ("the
   authors hypothesize"). Keep their hedges. Report limitations they state.
5. **Fill in the evidence card** using the definitions in the About page.
   `tested` means the paper ran an experiment measuring that property; `argued`
   means it made a claim without one. The card records what was examined, not
   what was found. Put the reasoning for any judgment call in `evidence.note`.
6. Set `status: full`, leave `reviewed: false` (a person flips it), and update
   `updated`.
7. `summary` is one or two plain sentences stating the finding, not the topic.

Ids are `<first-author><year>-<short-title>`. Internal links are site-relative
with no extension and no trailing slash: `/papers/<id>`, `/concepts/<id>`.
A link to a page that does not exist fails the build.

## Style

Plain, specific sentences. State the claim, then the number that supports it.
No hype words, no rhetorical questions, no "it is worth noting". Tier and
evidence labels describe the paper, not its quality.

## Adding papers

New papers come from the frontier. `just crawl` rebuilds it; record a suggested
`add`, `maybe` or `skip` with a one-line reason in `src/data/triage.json`. A
candidate becomes a page only after the maintainer accepts it.
