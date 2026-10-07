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
    just paper <paper-id> <pdf-url>          # fetch a paper's PDF and list what is in it
    just figure auto <paper-id> <n> <name>   # cut Figure n out of the paper's PDF
    just figure page|crop ...                # the same by hand
    just anchor <paper-id>                   # place a page's locators and quotations in the PDF, and check the page
    just thread <post-url> <thread-id> [paper-id ...]   # import a thread from X
    just crawl      # recrawl citations and rebuild the frontier

## Layout

- `src/content/papers/<id>.md`: one page per paper. Schema in `src/content.config.ts`.
  A page with `format: outline` is in the current format; one without is in
  the earlier format and waits to be rewritten.
- `src/content/archive/<id>.md`: a paper page as it stood before it was
  rewritten, served at `/archive/<id>` and linked from the page that replaced
  it. Do not edit.
- `src/content/concepts/<id>.md`: one page per concept.
- `src/content/threads/<id>.json`: written by `scripts/thread.mjs`; hand-edit only
  `title`, `summary`, `papers`, `author.name` and each image's `alt`.
- `src/content/pages/about.md`: the About page, including the public definition of
  every label. Change a label there when you change it in the schema.
- `src/data/anchors/<paper-id>.json`: written by `scripts/anchor.mjs`. Do not
  edit. Where each locator and quotation of a page sits in the paper's PDF.
- `src/data/frontier.json`, `edges.json`: written by `scripts/crawl.mjs`. Do not
  edit. `triage.json` (candidate key -> `{triage, note}`) and `leads.json` are
  edited by hand and survive a recrawl.
- `public/figures/<paper-id>/`: figures cut from papers by `scripts/figure.mjs`.
- `scripts/pdf.mjs`: reads a paper's PDF: its words and where its sections,
  figures, tables and footnotes start. `paper.mjs`, `anchor.mjs` and
  `figure.mjs` all work from it.
- `src/lib/cite.mjs`: finds the locators and quotations in a page's text. The
  anchor script, the markdown plugin and the linter all use it.
- `src/lib/remark-wiki.mjs`: the conventions used in page bodies: `::post`,
  figures, "Note from Claude", and the locators and quotations that are tied
  to the paper. It also gives a body link to a stub the class that colors it red.
- `src/components/PaperPage.astro`: the paper page, for both formats and for
  an archived page.
- `src/components/PaperPane.astro`: the paper shown beside its page, and the
  script that takes it to whatever the reader clicks.
- `src/components/PaperLink.astro`: a link to a paper page, red when the page is
  a stub. Templates link to papers through it.
- `src/lib/experiment.mjs`: the experiment diagram notation of the earlier
  format: parser, HTML renderer and the outline used in markdown twins.
- `src/lib/markdown.ts`: the markdown twin of every page. A new kind of page
  needs a twin here and a `.md.ts` route beside its `.astro` route.
- `src/lib/vocab.mjs`: the allowed values for tier, status, methods, shared
  by the schema and the linter.
- `worker/index.ts`: markdown content negotiation, and the relay that hands
  the reader on a paper page the paper's PDF.
- `data/raw/`: gitignored. Paper PDFs, images from posts, raw API responses.
  This repo is public: never commit or publish anything from there.

## Writing a paper page

A paper page is the paper's outline: what the paper could have been written
from. It gives the claims, the evidence for each, and the job of every part,
with the paper itself shown beside it. The model to copy, in its parts, its
headings and its wording, is
`src/content/papers/atkinson2026-identifying-introspection.md`. Read it, and
look at it rendered, before writing another.

Follow these steps in order. Each ends in something that can be checked.

### 1. Fetch the paper and take stock

Choose the id: `<first-author><year>-<short-title>`, lower case, hyphenated.

    just paper <paper-id> <pdf-url>

This saves the PDF to `data/raw/papers/<paper-id>/paper.pdf`, writes its text
beside it as `paper.txt`, and prints the inventory: every section, figure,
table and footnote with its page, the words each section gets, and the box of
each figure. Keep the inventory; steps 3 and 6 use it.

Work from the latest version of the paper and from that version only. For an
arXiv paper the script prints the link of the version it fetched
(`https://arxiv.org/pdf/2610.00827v1`). That link, with its version, is the
page's `links.pdf`: the page stores positions in this exact file.

If the inventory lists no sections, the PDF has no named destinations and
locators cannot be placed in it. Stop and say so.

### 2. Read it, and find the authors' threads

Read `paper.txt` in full, appendices included. Read the figures too: look at
each page that has one (`just figure page <paper-id> <page>` writes an image
of the page).

Search for the authors' own threads about the paper on X. A thread is the
authors' own short statement of the paper, which step 3 needs. Import each
with `just thread <post-url> <thread-id> <paper-id>`, then write its `title`
and `summary` and describe every image in `alt`. If you find none, go on
without, and say so when you hand over.

### 3. Work out the outline

Work the outline back from the finished paper; do not summarize. A paper
states itself several times at different lengths: the title, the abstract, the
list of contributions, the lead figure's caption, the section headings, the
conclusion, and the authors' threads. Those statements show what the authors
take their claims to be.

1. Line up every short statement of the whole paper. What recurs is a claim.
   What survives down to the title leads. There are one to three.
2. Give each sentence of the abstract and each paragraph of the introduction
   the job it does.
3. For each section: the question it opens with, what it reports, what it hands
   on, and what would be missing without it.
4. For each claim: the key experiments, its strength in the authors' words, and
   what is new. For each control, robustness check and hedge: the objection it
   answers.
5. Take the words each part gets from the inventory.
6. Account for every section, figure, table, appendix and footnote in the
   inventory.

### 4. Write the page

**Frontmatter.** `title`, `authors`, `year`, `date` (first posted) and `venue`
from the paper. `tier` is the maintainer's call: propose one and say why.
`status: full`, `reviewed: false` (a person flips it), `format: outline`.
`links`: `arxiv` (the id), `pdf` (the exact file from step 1), and `project`
or `code` if the paper gives them. `cites`: the id of every paper in its
reference list that has a page here. `concepts`: the concept pages it bears
on. `threads`: the threads from step 2. `setup`: what the model reports on,
the methods (from `src/lib/vocab.mjs`) and the models. `sources`: what you
read. `added`, `updated`. There is no `questions` and no `terms`.

`summary` is one or two plain sentences that summarize the paper as the
outline has it: the claims, in order. It is not a description of the page.

**Body.** These parts, in this order, under these headings:

1. `## The paper in brief`. Four items: **Problem**, **Why it matters**,
   **Question**, **Answer**, each in the paper's words with its place. Then
   one sentence on how the claims stand to one another, and the claims as a
   numbered list, a sentence each.
2. `## What the paper starts from`. What a reader needs before the claims: the
   terms as the paper defines them, the inference the argument rests on, the
   setting, the measures, what the design rules out, and the tools taken from
   earlier work. The figure of the setup goes here.
3. `## The argument, claim by claim`, with a `### Claim N: …` for each. Under
   each: the claim in a sentence; **Evidence**, each result stated with its
   numbers and its place and followed by its figure; the **objections it
   expects**, each with where and how the paper answers it; **how strongly it
   is made**, in the authors' own hedges; and **what it hands on** to the next
   claim. End each with a note that asks how the evidence could hold and the
   claim still be false, and says what the paper offers on that.
4. `## What the paper claims as new`, in its own words.
5. `## Limits the authors state`.
6. `## How the paper tells it`, from the shortest telling to the longest:
   `### The abstract`, a table with the job of each sentence;
   `### The introduction`, a table with the job of each paragraph and what it
   cites; `### The body, section by section`, each section's job, how it
   opens, what it hands on, and what would be missing without it;
   `### The appendices`, a table with the job of each; and a last table of
   where each claim appears, from the title to the threads.

Rules:

- **It reads from top to bottom, and each part uses only what came before.**
  Put what belongs to one claim with that claim. Do not present working
  tables in the order they were produced.
- **It explains itself.** No section says what an outline is, how to read the
  page, or how it was made.
- **It stands by itself.** It names and cites no outside source for its method.
- **Outside notes, it says only what the paper and the threads say,** each
  statement with its place. Quote the authors wherever strength or novelty is
  at issue. Attribute interpretations ("the authors hypothesize") and keep
  their hedges.
- **Every number comes from the source,** with its place. Do not read values
  off charts unless the text states them.
- **No labels.** Do not label a paper by whether it tested faithfulness,
  grounding or privileged access, or by a stance for or against
  introspection: the maintainer considers those judgments premature. For the
  same reason, do not write as though grounding and privileged access were
  settled as two different properties. Report each paper's own terms and
  claims in its own words.
- **Your own observations go in notes** (below), and only there: a pattern, a
  comparison, a count, a question about the evidence.

**Locators and quotations are read back out of the prose,** so write them in a
way that can be:

- Locators in these forms: `§5`, `§5.1`, `Appendix B`, `Appendix B.6` or
  `B.6`, `Figure 3`, `Figures 3 and 4`, `Table 2`, `footnote 2`, `Abstract`.
- Quote exactly, between straight double quotes, with nothing else inside
  them. A quotation is matched to the paper on its letters and digits alone,
  so line breaks and hyphenation do not matter, but a changed word does.
- Put a quotation's locator next to it (`"…" (§4)`). Where the same words
  occur twice in the paper, the nearest locator decides which is meant.

### 5. Cut the figures

Show the paper's main-text figures, each where it is used: the figure of the
setup with what the paper starts from, and every result figure under the claim
it supports, after the sentence that states the result.

    just figure auto <paper-id> <figure-number> <name>

Open the result and check the edges: nothing clipped, no caption or body text
included. If a side is off, or only one panel is wanted, cut it by hand with
the box `auto` printed, adjusted:

    just figure crop <paper-id> <page> <x> <y> <w> <h> <name>

Place it with an image on its own line, with a caption that says which figure
of the paper it is:

    ![What the figure shows, in words.](/figures/<paper-id>/<name>.png "Figure 2 of the paper: what it plots.")

The alt text is what a reader without the image gets, including every language
model reading the markdown twin, so it must carry the content: axes, groups,
and the pattern the figure is there to show. Describe only what is visible.
Figures belong to the paper's authors; never present one as the wiki's own.

### 6. Place the page in the paper, and check it

    just anchor <paper-id>

This finds every locator and quotation of the page in the PDF and writes
`src/data/anchors/<paper-id>.json`. It stops with an error on a quotation that
is in neither the paper nor its threads, or a locator the paper does not have:
fix the page and run it again until it passes. It also lists parts of the
paper the page never mentions, and numbers on the page that are in neither the
paper nor its threads. Clear both lists, or be able to say why an entry stays.

    just lint

### 7. Tie it into the wiki

Run `just crawl` so that citations to and from the new page are picked up, and
triage any new candidates it finds (see "Adding papers"). Semantic Scholar may
not know a paper posted in the last few weeks; then `cites` in the frontmatter
is all there is, and that is fine.

### 8. Look at it, then hand over

    just preview

Open `/papers/<paper-id>` on a screen at least 1100px wide. The paper should
be beside the page. Click a quotation and a locator in every part of the page
and see that the paper goes to the right words. Look at each figure.

Do not commit or deploy unless the maintainer has asked. Hand over with: the
tier you propose, whether you found a thread, anything in the two lists of
step 6 that you left, and anything you could not check.

### Rewriting a page from the earlier format

Move the old file to `src/content/archive/<id>.md` with `git mv`, unchanged.
Write the new page at `src/content/papers/<id>.md`, carrying over the
frontmatter that still applies and dropping `questions` and `terms`. The new
page links the archived one by itself.

## Notes from Claude

The text of a page reports what its sources say. When the model drafting a page
has something of its own to add (a pattern it noticed, a comparison, a count it
made, a question about the evidence), that goes in a note:

    > **Note from Claude:** The claim that leads is the last one.

A blockquote that opens with exactly that label is drawn as a dashed box under
the label "Note from Claude", so a reader cannot take it for the paper's. The
markdown twin shows it as written. In a note, give the location of anything
cited, say "my count" or "my reading" where that is what it is, and keep to
what a reader can check against the page. A note never carries what the paper
says. Keep them few: a note that only restates the page around it should go.
`just lint` flags a note whose label is misspelled.

## The paper beside the page

On a screen at least 1100px wide, a page in the outline format shows the
paper's PDF in a pane on the right. A click on any locator or quotation
scrolls the paper to that place and marks it. The paper moves only on a click:
having it follow the page as the reader scrolled was tried and taken out.
Nothing is added to the page's source for this. `cite.mjs` reads the locators
and quotations out of the prose, `scripts/anchor.mjs` finds each in the PDF,
and `remark-wiki.mjs` puts the positions on the page.

The reader draws the PDF with PDF.js. A browser will not let a page read a
file from another site unless that site allows it, so the reader gets the file
from `/pdf/<paper-id>.pdf`: the Worker fetches it from the page's `links.pdf`
and passes it on, and sends anyone who opens that address to the authors'
copy. `just dev` relays the same address; `just preview` runs the real Worker.
Without scripts, or on a narrow screen, there is no pane and each locator is a
link to that page of the PDF.

## The earlier format

Pages without `format: outline` were written in the format the wiki started
with: "At a glance", then the experiments as a map and diagrams, then the
authors' thread. They stay as they are until each is rewritten. What follows
is how they are built, for reading and repairing them. Do not write a new page
this way.

### Writing a page in the earlier format

The model is `src/content/archive/atkinson2026-identifying-introspection.md`.

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
     it did here with the number. End with a takeaway that states the limits.
     Each takeaway also has `why`, drawn inside the box under the label "Why
     it matters": two to four sentences on why the point matters beyond the
     paper. What would it change for the field, or for someone relying on
     models, if it holds more widely? What might carry over to other
     settings? This is the one place on a page that looks past what the paper
     showed, so keep the line visible. `text` holds only what the paper did
     and found. In `why`, attribute what the authors say about significance
     to them, phrase the rest as a possibility with its condition ("if this
     holds beyond one task"), and say what is still missing. One experiment
     does not generalize by itself.
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

### Drawing the experiments

After "At a glance", every paper page opens with a section called "The
experiments". It holds a map and
then one diagram per experiment under its own `###` heading. Both use fixed
notations, explained to readers at `/diagrams` (`src/content/pages/diagrams.md`).
Do not draw an experiment any other way: the value is that a reader who has
learned one page can read them all. The seed paper's archived page is the model to copy.

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

New papers come from the frontier, or from the maintainer directly. `just
crawl` rebuilds the frontier; record a suggested `add`, `maybe` or `skip` with
a one-line reason in `src/data/triage.json`. A candidate becomes a page only
after the maintainer accepts it. A paper the maintainer hands over is accepted:
write its page as above.
