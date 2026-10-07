# The outline behind "Identifying Introspection From the Inside", reconstructed

A working note, not a wiki page. It runs the writing process in Neel Nanda's
[Highly Opinionated Advice on How to Write ML Papers](https://www.alignmentforum.org/posts/eJGptPbbFPZGLpjsp/highly-opinionated-advice-on-how-to-write-ml-papers)
backward over Atkinson, Plunkett & Bau (2026), the wiki's
[seed paper](https://introspection.infinite.fun/papers/atkinson2026-identifying-introspection),
to recover the outline the paper could have been written from. Nanda recommends
the exercise himself: "taking papers you know, and trying to write down what
their narrative is".

Read for this: the post in full; the paper's extended preprint (21 pages, built
5 October 2026) in full, appendices included; an earlier build of the same paper
(12 August 2026), used only in section 3.7; both authors' threads as imported in
`src/content/threads/`.

Sections 1 to 3 say only what the paper, the post and the threads say, with
locations. Section 4 is ours and is marked as such.

## 1. Method

### 1.1 The idea

Nanda's process starts from a few sentences and expands them: one to three
claims with their evidence and motivation, then a bullet outline of the
introduction, then a bullet outline of the whole paper, then figures, prose and
editing. Each stage restates the one before it at greater length. He says the
repetition is deliberate: "with a complex idea, you want to repeat it in varied
ways so that it sticks".

A finished paper therefore still contains its earlier stages. The title, the
abstract, the list of contributions, the lead figure's caption, the section
headings and the conclusion are the same narrative at different lengths, and
each author's thread is one more.

So the outline does not have to be inferred by summarizing, which would put our
judgment of what matters in place of the authors'. The authors have already
decided what matters, several times over, and each decision is on the page.
Reverse-engineering the outline means reading those compressions off, lining
them up, and then giving every remaining part of the paper a role under what
they agree on.

### 1.2 What each stage of writing leaves behind

| Nanda's stage | What it leaves in the finished paper | How to read it back |
|---|---|---|
| 1. Compress to 1–3 claims, why they matter, 1–3 key experiments each | Title, hook, contributions list, the "central finding" sentence, conclusion | Line them up. A claim is what recurs. |
| 1, second half. "write down common misconceptions, limitations, or ways someone might over-update on your work" | Hedges, controls, robustness appendices, the limitations paragraph | List each as an objection and where it is handled. |
| 2. Outline the introduction: the claims exactly, what is new, why they matter, why they are true | The introduction's paragraphs | Label each paragraph with its role, in Nanda's order. |
| 3. Outline the paper: every part has a role | Sections, the first and last sentence of each, what was sent to an appendix | One line for what each part says and one for what it does. Apply his test: "what goes wrong if I cut this". |
| 4. Results and figures | Figures, captions, which figure leads | Assign every figure to a claim. |
| 6. Edit | Differences between versions | Diff two builds, when two exist. |

### 1.3 Signals considered

| Signal | What it recovers | Pass |
|---|---|---|
| The authors' own compressions, lined up | Which claims make up the narrative, and which one leads | 1 |
| Fit to Nanda's abstract and introduction templates | The job of each sentence and paragraph, and where the authors did something else | 2 |
| Reverse outline: what each part says, what it does | The section-level outline | 3 |
| Opening questions and hand-off sentences ("To pursue this hypothesis, we turn to…") | What each experiment was for and what it passed on | 3 |
| The cut test on every section and appendix | Each part's role | 3 |
| A ledger of claims against experiments | The key experiments per claim, the kind of evidence, the comparison points | 4 |
| Hedging words and "first" statements | How strongly each claim is made, and what is claimed as new | 4 |
| Controls and limitation sentences | The objections the authors expected | 4 |
| Space: words per section, figures per claim, main text against appendix | What the authors gave priority to | 5 |
| A diff between two builds | The editing stage, observed and not inferred | 6 |
| A second reader compressing the paper blind | Whether the set of claims is reproducible | Not run. This paper lists its findings by number. A paper that does not would need it. |

### 1.4 Procedure

1. **Line up the compressions.** Collect every place the authors state the whole
   paper briefly. Find the units that recur. The unit present at every length,
   down to the title, leads.
2. **Fit the templates.** Give each sentence of the abstract and each paragraph
   of the introduction its role in Nanda's order. Note every departure.
3. **Reverse-outline the body.** For each section: the question it opens with,
   what it reports, what it hands on, and what breaks without it.
4. **Build the ledgers.** Per claim: key experiments, kind of evidence, strength
   in the authors' words, what is new. Per objection: where it is handled.
5. **Measure the space.** Words per section, figures per claim.
6. **Check.** Every section, figure, table, appendix and footnote of the paper
   lands on a node of the outline, and every node names a location. Diff the
   builds if there are two.

Four rules held throughout. Every node carries a location in the paper. Every
part of the paper lands on a node. Strength and novelty are quoted, not
paraphrased. Anything that is our observation goes in section 4.

## 2. The outline

Presented in the order Nanda would have it written: the compressed narrative,
then the introduction, then the whole paper.

### 2.1 The compressed narrative (Nanda's stage 1)

**Problem.** "Large language models make claims about themselves that are both
consequential and increasingly difficult to verify from behavior alone."
(Abstract.)

**Question.** "Our work asks whether grounding has a physical basis that can be
detected." (§1.)

**Takeaway.** "it is possible to test whether a self-reported claim about
behavior shares a mechanistic cause with the behavior, without needing to
evaluate the claim's content." (§8.)

The three claims form a chain. Each one produces what the next one needs.

**Claim 1. Trained only to decide, a model can come to report its learned
preferences faithfully, and it does so well after it has learned to decide.**

- *Kind, in Nanda's terms:* an existence proof. The wording is "can lead to the
  emergence" (Abstract). It rests on one tuned run of Qwen3-32B (Appendix B.2),
  and the authors say their goal is "a controlled comparison between specific
  checkpoints, not a claim about all possible training regimes" (§7).
- *Context a reader needs:* the setting of Plunkett et al. (2025) and the two
  measures, decision performance and faithfulness (§2).
- *What is new:* stopping one run at two checkpoints to get a faithful and an
  unfaithful model of the same learned task (§1, finding 1).
- *What it is for:* it produces the comparison everything else uses. "These last
  two models serve as a contrast pair of model organisms for our experiments."
  (§3.)
- *Key evidence:*
  - Figure 1b. Qwen3-32B at step 1000: decision performance 0.82, faithfulness
    about 0.25. At step 3000: 0.92 and 0.83.
  - Figure 2. Five Qwen3 sizes from 0.6B to 32B all reach about 0.9 decision
    performance. Only the 32B model "begins to recover its initial moderate
    level of faithfulness".
- *In the appendix:* a second model family (B.6), the same run evaluated with
  reasoning on (B.3), and a speculative account of negative faithfulness (D).

**Claim 2. The faithful checkpoint keeps its preference information earlier in
the network, and confining training to early layers makes a smaller model report
more faithfully.**

- *Kind:* hedged. The observation is stated flatly: the faithful checkpoint
  "responds to ablations 5–6 layers earlier". Its reading is flagged each time:
  "consistent with the hypothesis" (Abstract), "We speculate" (§4), and "a
  hypothesis about the consequences of earlier storage, rather than its origin"
  (§4).
- *What it is for:* it supplies the hypothesis that §5 tests. "Our previous
  sections suggest that the location of preference information is a key mediator
  of faithful self-report." (§5.)
- *Key evidence:*
  - Figure 3, a measurement. Adapter layers are removed before or after a cut,
    in both checkpoints. The faithful one responds 5–6 layers earlier.
  - Figure 4, an intervention. Qwen3-14B does not self-report faithfully when
    trained on all 40 layers. Trained on the first *k* only, the models with
    *k* of 10, 15 or 20 "are markedly better self-reporters than models with
    late layers unfrozen".
- *Checks in the appendix:* training only the late layers never reaches the same
  faithfulness, so the effect is not one of parameter count (E, Figure 9). The
  faithful Gemma-4 31B adapter "shows the same early-layer localization" (§4,
  B.6, Figure 8).

**Claim 3. Faithful models use more of the same adapter weights to decide and to
report, and this can be measured without reading the report.** This is the claim
every compression keeps (section 3.1).

- *Kind:* hedged and narrow. "at least in our restricted setting" (Abstract).
  "Our proof-of-concept experiment suggests it can be feasible" (§1, finding 3).
  "Our method discriminates between groups, not individuals" (§7). It is stated
  most strongly at the end of §1: the setting "has allowed us, for the first
  time, to show that grounding is a computational property that can be measured
  without inspecting the model output".
- *Why it matters, as the paper puts it:* three situations in which a report
  cannot be checked against behavior. The outputs are "too long or complicated
  for a human to understand", the behavior is "too rare to reliably observe", or
  "the claims concern purely internal reasoning" (§1).
- *Context a reader needs:* attribution patching (§5.2, Appendix F), and why a
  matched population of models is needed to use it (§5.1).
- *Key evidence:*
  - Figure 5d, a measurement. Across 32 matched pairs of single-character
    models, attribution similarity averages 0.34 (SD 0.26) for faithful models
    and 0.08 (SD 0.10) for unfaithful ones. The difference is 0.26, with a
    paired bootstrap 95% CI of [0.16, 0.36].
  - Figure 5c, a description. Importance by layer: "three of the four
    combinations peak at the same layer (38)", and the unfaithful models'
    decision curve "peaks 11 layers later (49)".
  - Figure 6, an intervention. Only the *k* weight matrices ranked highest on
    one task are switched on, and the model is tested on the other task.
    Faithful adapters "recover a given fraction of KL with 8–12× fewer matrices
    than unfaithful ones", and recover more even when the matrices are chosen
    at random.
- *Checks in the appendix:* without the selection filters the gap is 0.21, CI
  [0.09, 0.33], on 10 pairs (C.1). The gap is stable from four
  integrated-gradient steps upward (F.1, Table 2). Across 100 characters within
  one backbone, similarity and faithfulness correlate at r = 0.197, CI [0.006,
  0.375], which the authors call "a sign of life rather than a standalone
  finding" (G, Figure 10).

**Limits the authors write down** (§7, §8):

- The task is "linear, five-dimensional, and explicitly constructed", and
  "whether this generalizes to complex, unverifiable reports remains open".
- The test separates groups, not individuals. "while high attribution similarity
  is sufficient evidence for faithfulness, low similarity is not strong evidence
  against it."
- "We study LoRA adapters, not full models."
- "we do not comprehensively tune hyperparameters".
- Left unexplained: why preferences move to earlier layers, and the negative
  faithfulness of the 4B and 8B models.
- A faithful adapter with low similarity "might be a correct confabulator:
  accurately self-reporting through an ungrounded mechanism".

### 2.2 The introduction (Nanda's stage 2)

Seven paragraphs. The role is Nanda's name for the slot.

| ¶ | What it says | Role | Citations |
|---|---|---|---|
| 1 | Models make claims about themselves: of being unbiased, of ignorance, of being in love. Do such claims "arise because they are true"? | Context and motivating question | Bai 2025, Cywiński 2025, Roose 2023 |
| 2 | Testimony needs two properties, faithfulness and grounding. "We reserve the term introspection for self-report that has both properties." | Key terms defined | none |
| 3 | The question: does grounding have a physical basis that can be detected? Matching behavior is not enough. "If self-reports share a proximal cause with task behavior, that is evidence for grounding." | Why earlier approaches fall short, and the inference the paper rests on | Morris & Plunkett 2025 |
| 4 | The approach: interventions on internals, in the setting of Plunkett et al., with low-rank adapters and the self-report asked in a separate context window. "Then we isolate, localize and compare the internal mechanisms". | Technical background. Marks what is inherited. | Plunkett 2025, Hu 2021 |
| 5 | "In this paper, we present three main findings": a setting, mechanistic evidence, a blinded test. | Contributions list, with the case for each folded in | Plunkett 2025 |
| 6 | Where honesty of testimony has to be assessed: outputs too long, behavior too rare, claims about internal reasoning. | Impact: who needs this | Irving 2018, Liu & Feng 2024, Li 2025 |
| 7 | "Our work shows one possible path for tackling the problem." A narrow setting, and the "for the first time" statement. | Takeaway and standard of evidence | none |

Where it departs from Nanda's order:

- The contributions list comes before the impact paragraphs, not at the end.
- There is no paragraph that makes the case with numbers. The only number in the
  introduction's prose is "32 pairs". The results (0.82 and 0.25 against 0.92
  and 0.83) are in the caption of Figure 1, which sits inside the introduction.
- The second paragraph defines concepts, not techniques. The techniques are
  named in paragraph 4 and explained in §2 and §5.2.

### 2.3 The whole paper (Nanda's stage 3)

Shares are of the main text's prose, about 3,860 words from abstract to
conclusion, captions excluded. They are our count from the PDF's text and are
approximate.

**Title.** "Identifying Introspection From the Inside".

**Abstract** (11 sentences, 6%). Roles sentence by sentence in section 3.2.

**§1 Introduction** (17%). Section 2.2. Carries Figure 1.

- **Figure 1** (setting and lead result). Panel a: the decision prompt, the
  self-report prompt and the two measures. Panel b: the 32B training curve with
  the two checkpoints marked. The caption ends as a roadmap: structural changes
  in §4, and whether they tell "whether that self-report is grounded" in §5.
- Footnote 1: the project page.

**§2 Background** (10%). *Role: everything inherited from Plunkett et al.,
and the two measures every plot uses.*

- Lead paragraph: the setting is Plunkett et al.'s. Preferences are random so
  that "self-reports cannot succeed by appealing to common-sense priors".
- Characters: a person, a class of objects, a hidden vector **p** over five
  attributes.
- Decision task: binary choices labelled by a linear utility. Preferences are
  "never articulated explicitly in the training corpus". The model's learned
  preferences **p̂** are recovered by logistic regression on its outputs.
- Self-report task: weights as JSON, averaged into **p̃**. "We do not train on
  the self-report task." Each task has its own context window.
- Metrics: decision performance is corr(p̂, p). Faithfulness is corr(p̂, p̃),
  "regardless of whether that behavior matches the training target".
- *If cut:* no plot can be read, and three objections lose their answer
  (section 3.4, rows 1 to 3).

**§3 Model organisms of faithful self-report** (7%; claim 1; Figures 1b, 2).
*Role: make the two models.*

- Opens: "We begin by replicating Plunkett et al. (2025)'s results on the Qwen3
  family". Five sizes, rank-8 LoRA on every linear layer, decision task only.
- Reports "four phenomena":
  1. Base models above 0.6B are "more faithful than chance even with no
     fine-tuning". Hypothesis: common sense drives both choice and report.
  2. Every size reaches high decision performance. Only 32B shows "(re)emergent
     faithful self-report".
  3. The 4B and 8B models end with negative faithfulness. Sent to Appendix D.
  4. The contrast pair: step 1000 and step 3000 of the 32B run.
- Hands on: the contrast pair, to §4 and §5.
- *If cut:* §4 and §5 have nothing to compare.

**§4 Localizing a mechanistic signature of faithful self-report** (8%; claim 2;
Figures 3, 4). *Role: find what differs, and turn it into a hypothesis.*

- Opens with its question: "What is the difference between the faithful late
  checkpoint and the unfaithful early checkpoint of our tuned 32B model?"
- Weight ablations (Figure 3). Prediction stated first: "If preference
  information is localized by layer, then we should see decision behavior, and
  possibly self-report, change as we remove successive layers." Result, then the
  hypothesis, then a pointer to the Gemma-4 repeat.
- Layer freezing (Figure 4). Opens "To pursue this hypothesis". The intervention
  on Qwen3-14B, and a pointer to the parameter-count control in Appendix E.
- Hands on: the hypothesis that location matters because report and decision
  use the same representations.
- *If cut:* §5 has no stated reason to look for shared weights.

**§5 Identifying faithful self-reporters with attribution patching** (33%;
claim 3; Figures 5, 6). *Role: the test.* The section is built like a short
paper of its own.

- Framing (four paragraphs, 8%). A thought experiment: two groups of models
  that choose alike, one faithful and one not. "How can you tell them apart?"
  Comparing reports with ground truth is the "natural answer", and it is often
  unavailable. So "a more stringent test": one that separates the groups "without
  requiring that we understand the content of the self-reports". Then the
  hypothesis from §4, then a three-step roadmap.
- **§5.1 Creating adapter pairs** (10%; Figure 5a). A population of
  single-character adapters trained on the two checkpoints, frozen. Three
  stated advantages: both kinds of model are cheap to train, attribution needs
  less memory, and the frozen backbone holds the shared machinery so the new
  adapter stores "only the relevant preference information". Pairs share
  character, data, hyperparameters and initialization. Three filters leave 32
  pairs. Footnote 2: the findings do not depend on the filters (C.1).
- **§5.2 Scoring adapters with attribution patching** (4%; Figure 5b). The
  method and the definition of attribution similarity. Detail in Appendix F.
- **§5.3 Results** (5%; Figure 5c, 5d). Opens "Now we can answer the question
  we posed at the beginning of this section". The similarity gap, then the
  layer profile. Footnote 3: a within-model version in Appendix G.
- **§5.4 Causally validating attribution scores** (7%; Figure 6). Opens with
  the objection it answers: "Attribution scores are intended to approximate the
  effect of causal interventions, but are not themselves causal." Method,
  prediction, random baseline, result.
- *If cut:* the title's claim has no evidence. If only §5.4 is cut, claim 3
  rests on an approximation alone.

**§6 Related work** (9%). *Role: set the claim of novelty against what exists.*
After the results, where Nanda prefers it. Three paragraphs, each ending by
placing the paper:

- Behavioral evidence, concept injection and circuit-level work. Ends: "our
  contribution is a mechanistic criterion—shared computational structure between
  decision-making and self-report—that does not require understanding or
  inspecting the content of the report itself."
- Out-of-context reasoning and delayed generalization. The late emergence "is
  reminiscent of grokking", "though the mechanism differs".
- Skepticism and privileged access. Ends: "These results inform a central
  premise of our work".

**§7 Discussion** (7%). *Role: say what the result is and how far it goes.*

- Central finding in one sentence, then why it matters: a model "could report
  its preferences in an obfuscated format, or in a language we do not speak, and
  our metrics would still apply".
- Limitations and open questions: the list at the end of section 2.1.

**§8 Conclusion** (4%). Restates claim 1, then claims 2 and 3 in one clause.
The "As far as we know, this work is the first" statement. A caution on scope.
What would follow if such signatures "can be identified in more naturalistic
settings".

**Appendices** (about 2,300 words, against 3,860 in the main text). Each by the
job it does:

| Appendix | Holds | Job |
|---|---|---|
| A.1 | How preference weights are drawn | Detail to replicate |
| A.2 | Both prompts in full; parsing rules; footnote 4 | Detail to replicate |
| A.3 | The logistic regression for p̂ | Detail to replicate |
| A.4 | 24 self-report prompts, 16 decisions per character | Detail to replicate |
| B | Training hyperparameters for the multi-character adapters | Detail to replicate |
| B.1 | Table 1: layers per model size | Detail to replicate |
| B.2 | How the 32B run was tuned: 15 random draws | Detail to replicate |
| B.3 | Figure 7: the 32B run with reasoning on | Extra result |
| B.4 | The freezing conditions | Detail to replicate |
| B.5 | Evaluation on 32 or 100 characters | Detail to replicate |
| B.6 | Figure 8: Gemma-4 sweep and layer ablation | Check: a second model family |
| C | Single-character adapters: rank 2, 24 steps | Detail to replicate |
| C.1 | The test without selection filters | Check: selection |
| D | A speculative account of negative faithfulness | Loose end from §3 |
| E | Figure 9: freezing the early layers instead | Check: parameter count |
| F | The attribution formula | Detail to replicate |
| F.1 | Table 2: the gap at 1 to 7 integration steps | Check: the estimator |
| F.2 | The loss | Detail to replicate |
| F.3 | Which token positions enter the loss | Detail to replicate |
| G | Figure 10: similarity against faithfulness within one backbone | Extra result |
| H | AI usage statement | Disclosure |

## 3. The working tables

### 3.1 The compressions, lined up

Rows run from shortest to longest, then the two threads. The three columns are
the units that recur.

| Where the authors state the paper | Setting and late emergence | Earlier layers | Shared weights, measured without the report |
|---|---|---|---|
| Title | | | "Identifying Introspection From the Inside" (our placement) |
| Atkinson's first post | | | "faithful models decide and report with the same layers. Unfaithful ones don't." |
| Central finding, §7 | | | "the degree to which the same adapter weights mediate both decision-making and self-report" |
| Abstract, last sentence | | | "distinguish between the two patterns of computation by examining the structure of the networks themselves" |
| Conclusion, §8 | "can emerge from decision-task training alone" | "preference representations that colocate with the apparent mechanisms of self-report" | "test whether a self-reported claim about behavior shares a mechanistic cause with the behavior" |
| Abstract, body | sentence 5 | sentences 7–8, the first research question | sentences 9–10, the second |
| Findings list, §1 | finding 1 | finding 2 | finding 3, and the attribution patching named in finding 2 |
| Section | §3 | §4 | §5 |
| Main-text figures | 1b, 2 | 3, 4 | 5, 6 |
| Atkinson's thread | posts 2–4 | posts 5–6 | posts 1, 7–10 |
| Bau's thread | posts 1–6 | posts 7–8 | posts 9–10 |

Reading it: the third unit is the only one present at every length. The first
is absent from the four shortest statements and present in everything longer.
The abstract and the sections divide the paper by question. The findings list
divides it by kind of contribution (a setting, evidence, a method), so
attribution patching appears under two findings.

### 3.2 The abstract, sentence by sentence

| # | Sentence, abbreviated | Role in Nanda's template |
|---|---|---|
| 1 | Models "make claims about themselves that are both consequential and increasingly difficult to verify from behavior alone." | Context and the need, in one sentence |
| 2 | "How can we distinguish plausible confabulations from genuine introspection?" | The motivating question |
| 3 | "we identify mechanistic signatures of faithful self-report in a controlled setting." | The contribution, with nuance dropped |
| 4 | Low-rank adapters, fictitious characters, "latent linear preference functions". | Clarifying detail: the setup |
| 5 | Decision-only fine-tuning "can lead to the emergence of accurate self-reporting". | Claim 1 |
| 6 | "We ask two research questions about this emergent phenomenon." | Signpost. No slot in the template. |
| 7 | Is the emergence "accompanied by a measurable structural change in the model?" | Question for claim 2 |
| 8 | Ablations and freezing "indicate that preference representations shift to earlier layers". | Claim 2, its experiments, its hedge |
| 9 | "can these structural differences distinguish faithful models from unfaithful ones?" | Question for claim 3 |
| 10 | Faithful models show "significantly higher attribution similarity". | Claim 3, its method, why it matters |
| 11 | Earlier work observed the difference "behaviorally"; "our work proposes that, at least in our restricted setting," it can be read from structure. | Close: what is new, and the standard of evidence |

Where it departs from the template: there is no number in the abstract (Nanda:
"If possible, include a concrete metric or result"). Two of the three claims
arrive as a question followed by its answer.

### 3.3 Two figures per claim

| Claim | First figure | Second figure |
|---|---|---|
| 1 | Figure 1b: the run | Figure 2: the same across sizes |
| 2 | Figure 3: measure where the preferences sit | Figure 4: intervene on where they can be stored |
| 3 | Figure 5: measure which weights each task uses | Figure 6: intervene on those weights |

The image that leads Atkinson's thread is Figure 5c. The image that leads Bau's
is a cartoon with the question "Is that report true?".

### 3.4 Objections the paper expects

Each control, robustness appendix and hedge answers something. Stated as the
objection, where the paper handles it, and how.

| # | Objection | Where | How |
|---|---|---|---|
| 1 | Reports could be right from common-sense priors | §2 | Preferences are generated at random |
| 2 | The model could read its own earlier answers | §2, A.2 | Separate context windows; no training on self-report |
| 3 | Faithfulness might just be accuracy on the target | §2 | It is measured against the model's own behavior |
| 4 | A report that matches behavior is not thereby grounded | §1, §6 | Taken as the premise; the reason for a mechanistic test |
| 5 | Earlier storage is a difference between two checkpoints, not a cause | §4 | The layer-freezing intervention |
| 6 | The freezing effect is one of parameter count | Appendix E | Freezing the early layers instead |
| 7 | One model family | §4, B.6 | Gemma-4: faithful self-report only at 31B, no delay, same early-layer localization |
| 8 | The two groups of models differ in more than faithfulness | §5.1 | Matched pairs, and filters for decision performance |
| 9 | The result depends on the filters | Footnote 2, C.1 | Rerun without them |
| 10 | Attribution is not causal | §5.4 | Cross-task patching with a random baseline |
| 11 | The estimate depends on the number of integration steps | F.1 | Table 2 |
| 12 | Conceded | §7, §8 | The limits listed in section 2.1 |

### 3.5 What is inherited and what is claimed as new

Inherited, as the paper says:

- The setting and prompts: "Adopting Plunkett et al. (2025)'s setting" (§1),
  "We adopt the setting" (§2), "We begin by replicating" (§3), A.2.
- LoRA (Hu et al., 2021).
- Attribution patching with integrated gradients (Nanda, 2023; Sundararajan et
  al., 2017; Hanna et al., 2024).
- Activating a subset of weight matrices (Nief et al., 2026).
- That matching behavior is not enough (Morris & Plunkett, 2025).

Claimed as new, in the paper's words:

- "We demonstrate how to construct contrast pairs of fine-tuned models that
  exhibit faithful and unfaithful testimony about the same learned task" (§1).
- "our contribution is a mechanistic criterion" (§6).
- "for the first time, to show that grounding is a computational property that
  can be measured without inspecting the model output" (§1).
- "As far as we know, this work is the first to illustrate a core principle"
  (§8).

### 3.6 Space

| Part | Share of main text |
|---|---|
| Abstract | 6% |
| §1 Introduction | 17% |
| §2 Background | 10% |
| §3, claim 1 | 7% |
| §4, claim 2 | 8% |
| §5, claim 3 | 33% |
| §6 Related work | 9% |
| §7 Discussion | 7% |
| §8 Conclusion | 4% |

Claim 3 has as much text as the abstract, introduction and background together,
and more than twice as much as claims 1 and 2 combined.

### 3.7 What changed between two builds

The PDF metadata dates one build to 12 August 2026 and the other to 5 October
2026. Both have the same sections and the same appendices A to H, and no
experiment was added or removed. The changes are the editing stage:

- **Figure 1 was split.** In August it was "Overview of our approach": five
  panels running from the setting to the attribution-similarity result. In
  October it is "Overview of our setting", two panels and a roadmap. The test
  moved into Figure 5, which went from two plots to a four-panel diagram.
- **The abstract lost a sentence** on the intervention of §5.4, which began
  "Cross-task causal patching confirms this".
- **"Introspection" was pinned down.** The sentence "We reserve the term
  introspection for self-report that has both properties" was added to §1. A
  Discussion paragraph headed "What we mean by introspection" was removed, with
  its two cognitive-science references.
- **The wording followed.** "no explicit introspection training" became "no
  explicit self-report training". "grounded introspection" became "grounded
  self-report", and "the signature of faithfulness we are looking for" became
  "the signature of introspection we are looking for". "truthful adapters"
  became "faithful models".
- **One phrase was reserved.** In related work, Lindsey et al. (2025) were first
  described as "identifying mechanistic signatures of faithful and fabricated
  chain-of-thought reasoning", then as "identifying differences between" them.
- **A footnote was removed** that tied the decision-performance filter to the
  model-similarity concern of Song et al. (2025a).
- **The freezing experiment was re-described**, from "freezing the last k"
  layers to training "on only the first k".

The August build is a file in `data/raw/seed/`. Confirm it is public before any
of this subsection goes on the site.

## 4. What the exercise shows (ours, not the paper's)

### 4.1 About the paper's structure

- **It is a chain, not a list.** Nanda's format sets claims side by side. Here
  each claim exists to produce something for the next: a contrast pair, then a
  hypothesis, then the test. An outline of this paper needs the hand-offs as
  much as the claims.
- **The lead claim comes last.** It is the only unit in the title, the hook and
  the central-finding sentence, and its section takes a third of the text. The
  result that opens the paper, late emergence, is the first to drop out as the
  statements get shorter.
- **The two authors lead with different units.** Atkinson's first post states
  claim 3. Bau's first post pitches the setup: a way to "induce introspection on
  open LMs" that "lets him look inside introspection". Six of his ten posts are
  on claim 1.
- **Claims 2 and 3 are argued the same way:** measure a difference, then
  intervene to test the reading of it.
- **One main-text experiment appears in no compression.** The cross-task
  intervention of §5.4 has a subsection, a figure and 7% of the text. Outside §5
  it is not named: not in the abstract (since October), the findings list, the
  conclusion, or either thread. Its job in the outline is row 10 of section 3.4.
- **The numbers are in the captions.** Neither the abstract nor the
  introduction's prose gives a measured value. A reader who skims text and
  skips figures meets the first one in §3.
- **Section openers and closers already are the outline.** §4 opens with its
  question, §5 with a thought experiment, §5.3 with "Now we can answer", §5.4
  with the objection it answers, and §3 closes by naming what it hands on. These
  are the `because`, `aim`, `product` and `leads` fields of the wiki's
  experiment diagrams, in the authors' own sentences.

### 4.2 About the wording of the lead claim

The measurement is called a signature of three things, by location:

- "mechanistic signatures of faithful self-report" (Abstract; also the title of
  §4).
- "A blinded test for grounded self-report" (§1, finding 3); "a physical basis
  for grounding" (§8).
- "the signature of introspection we are looking for" (§5); the title.

The paper defines introspection as self-report that is both faithful and
grounded (§1), and raises the difference itself as an open question: "If
attribution similarity measures grounding rather than faithfulness per se…"
(§7). Section 3.7 shows the wording was still moving between builds. An outline
should keep each location's own word, as this one does.

### 4.3 Questions a red-team pass would ask

Nanda's stage 1 ends with "Could the evidence be true but the claim false?".
Asked of each claim, with what the paper offers. These are questions, not
findings, and they do not belong on the paper's page.

- **Claim 3.** All 64 models sit on two backbones, and "every model built on the
  late backbone is faithful, and every model built on the early backbone is
  unfaithful" (§5.1). So faithful against unfaithful and late against early are
  the same split. What the paper offers: pairs matched on everything else
  (§5.1); a within-backbone analysis that finds r = 0.197 and is described as a
  sign of life (G); and the limit that the test separates groups, not
  individuals (§7).
- **Claim 2.** The ablation compares two checkpoints of one run, and the
  intervention is on a different model, Qwen3-14B. What the paper offers: the
  reversed-freezing control (E) and the Gemma-4 31B ablation (B.6).
- **Claim 1.** The 32B run was chosen from 15 by "a simple average of decision
  performance and faithfulness after 2000 training steps" (B.2), so it was
  selected partly on faithfulness. Gemma-4 "does not reproduce Qwen3-32B's
  within-run delay" (B.6). What the paper offers: the claim is worded as an
  existence proof, about "specific checkpoints".

### 4.4 About the wiki

- **The page already holds most of stage 1.** Its question tree is the
  compressed narrative in question form, its map is the chain of hand-offs, and
  its terms are §2. What this outline adds to the page's picture: how strongly
  each claim is made, in the authors' words; what is inherited and what is
  claimed as new; the objections table; the job of each appendix; and the
  lined-up compressions.
- **One number on the page is not in the paper's text.** Faithfulness of 0.74
  with the first 20 layers trained is from Atkinson's sixth post. The paper's
  text and the caption of Figure 4 say only "markedly" better. The page's
  third experiment diagram lists the value under §4 and Figure 4.
- **The method transfers.** Passes 1 to 5 need only the paper. Pass 1 gets
  better with a thread and pass 6 needs two builds.
