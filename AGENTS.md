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
- `src/lib/vocab.mjs`: the allowed values for tier, status, methods, shared
  by the schema and the linter.
- `worker/index.ts`: markdown content negotiation.
- `data/raw/`: gitignored. Paper PDFs, images from posts, raw API responses.
  This repo is public: never commit or publish anything from there.

## Writing a paper page

Use `src/content/papers/atkinson2026-identifying-introspection.md` as the model.

A paper page has these parts, in this order. There is no "In brief" and no
introductory prose: the page goes straight from "At a glance" into the map.

0. **At a glance**, written in the frontmatter and drawn by the template:
   - `takeaways`, inside `questions`: three to five points across the tree,
     each listed under the question it answers and drawn as a box. A reader
     may scan the tree and read only the boxes, so each box must stand
     alone; repeating what the answer says is fine. Each has a short `title` stating the point and a sentence or two of
     `text` with the number. Mark a method the paper introduces with
     `kind: method`; a new setup or a new test is often the main contribution.
     Draw them from the abstract, the paper's own list of contributions and
     its conclusion, and from the authors' threads, which show what the
     authors themselves think matters most.
     Write them for someone who has not read the paper: high-level, specific,
     and short, with no term the reader has not been given ("accurate", not
     "faithful"; "a point in training", not "a checkpoint"). The title is the
     point in plain words. For a new method, say first the general class of
     problem it addresses, then the general shape of the solution, then what
     it did here with the number. One experiment does not generalize by
     itself, so say what might carry over and mark it as a possibility. End
     with a takeaway that states the limits and the general idea they leave
     standing.
   - `questions`: the question the paper set out to answer, with its answer,
     and beneath it the questions it broke that into, each with its answer and
     the key number. A shallow tree: the leading question, then at most two
     levels (`sub`). If the paper does not decompose, use one flat level.
     Phrase every node as a question the paper actually asks; start the answer
     with yes or no where you can; link the experiment that answered it with
     `see`. End with a node on how far the result goes.
   - `terms`: the words the argument turns on (always *introspection* if the
     paper defines it, plus *faithful*, *grounded* and its own measures), each
     as this paper defines it, in its words or a close paraphrase, with `where`.
     Set `concept` when the wiki has a page for the term.
   - `setup`: what the model reports on, the methods, the models.
1. **The experiments.** The heading is followed directly by the map that
   traces every experiment and every result from the leading question to the
   conclusion, with no paragraph in between, then one diagram per experiment. See "Drawing the experiments" below. A paper that
   runs no experiments opens with a map of its argument in the same notation
   (the question, each step as a `finding`, the `claim`) and has no diagrams.
2. **The thread, digested.** "The argument, following the authors' thread":
   the authors' own thread embedded post by post, with what the paper adds
   under each post. Every paper should have one. Look for it; if you cannot
   find it, say so, so the maintainer can supply the link. When a second
   author posts their own thread, give it a short section after the first:
   embed the few posts that carry its arc, and say plainly where its wording
   goes further than the paper does.
3. **What the paper adds beyond the thread.** Omit when there is no thread.
4. **Limitations**, as the authors state them.
5. **How it relates to other pages**, saying only what this paper says.

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
   a section for what the paper has that the thread leaves out. The thread
   section comes after the experiments section, not before it.
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
6. **Keep "At a glance" to what the paper says.** Do not label a paper by whether it tested
   faithfulness, grounding or privileged access, or by a stance for or against
   introspection: the maintainer considers those judgments premature. For the
   same reason, do not write as though grounding and privileged access were
   settled as two different properties. Report each paper's own terms and
   claims in its own words.
7. Set `status: full`, leave `reviewed: false` (a person flips it), and update
   `updated`.
8. `summary` is one or two plain sentences stating the finding, not the topic.

Ids are `<first-author><year>-<short-title>`. Internal links are site-relative
with no extension and no trailing slash: `/papers/<id>`, `/concepts/<id>`.
A link to a page that does not exist fails the build.

## Drawing the experiments

After "At a glance", every paper page opens with a section called "The
experiments". It holds a map and
then one diagram per experiment under its own `###` heading. Both use fixed
notations, explained to readers at `/diagrams` (`src/content/pages/diagrams.md`).
Do not draw an experiment any other way: the value is that a reader who has
learned one page can read them all. The seed paper is the model to copy.

**The map** (a fenced block tagged `map`, `src/lib/experiment-map.mjs`) is a
directed graph of the experiments and what each showed. List the nodes in the
order things happened: the starting `question`, then each `experiment` followed
by its `finding`, then the `claim`. An edge from an experiment to its finding
means *showed*. An edge from a finding to a later experiment means *motivated*
and carries a `why`: the question the result raised, or what it supplied. Take
the motivations from the paper's own transitions ("to pursue this hypothesis,
we turn to…"). An experiment motivated by two findings gets both edges.

Give each experiment node a `sketch`: a small schematic of what the experiment
does, built only from the shapes the renderer knows (`strip` for layers or
items that are on, off, kept or removed; `axis` for points along a run or a
sweep; `bars` for two profiles that do or do not line up; `note` for a line of
text). It shows the manipulation, not the result, and it needs `alt` text.
Give each finding node a `figure` when the paper has a graph of that result:
cut it with `just figure`, and write `alt` text that carries what it shows and
a `caption` with its figure number.

**An experiment diagram** (a fenced block tagged `experiment`,
`src/lib/experiment.mjs`) follows these rules:

- **Seven stages, always in this order, skipping any that do not apply:** `why`,
  `data`, `model`, `probe`, `score`, `compare`, `next`. A stage may repeat when
  two things happen in sequence.
- **Start with why.** Give what prompted the experiment (`because`: an earlier
  result, or a gap in the field), what it was meant to find out (`aim`), and
  anything it was meant to produce for later experiments (`product`: a contrast
  pair, a dataset). Think about what the experiment is *for* in the paper's
  argument, not only what it measures. End with `next` (`leads`): where its
  result is used, linking the later experiment's heading.
- **Lanes are the things compared**: behavior against self-report, or one
  condition against another. Put what the lanes share in a cell that spans them
  (`all:`), so that reading across a row shows exactly what differs.
- **Show an instance, not a description.** Give data, prompts, replies, readouts
  and measures an `example`: the actual prompt, a row of the data, a reply.
  Follow one case down the whole diagram. An example taken from the paper names
  its place in `from` ("Appendix A.2"). Leave `from` out only for an example you
  made up to show the form; it is then labeled "illustrative" automatically.
  Invent values, never prompts or procedures, and never let an invented value
  stand where a result goes.
- **Colors mean two things only.** Tracks: `track: behavior` for what the model
  does, `track: report` for what it says about itself. Tones: `tone: unfaithful`
  and `tone: faithful` for those two kinds of model, on a lane or a box, and
  `{unfaithful|…}` / `{faithful|…}` around words that name them. Declare the
  paper's symbols under `symbols` so a formula in backticks shows which sides
  it joins.
- **Tags** are for conditions a reader needs to interpret the result
  ("separate context window", "never trained on this"), not for decoration.
- Keep prose in a box to a sentence or two. Put the number in `value`, the
  conclusion in `finding`, and the sections it came from in `paper`.
- Every number and quoted prompt follows the same sourcing rule as the prose.

`just lint` checks both notations.

## Style

Plain, specific sentences. State the claim, then the number that supports it.
No hype words, no rhetorical questions, no "it is worth noting". Tier describes the
paper's place in the wiki, not its quality.

## Adding papers

New papers come from the frontier. `just crawl` rebuilds it; record a suggested
`add`, `maybe` or `skip` with a one-line reason in `src/data/triage.json`. A
candidate becomes a page only after the maintainer accepts it.
