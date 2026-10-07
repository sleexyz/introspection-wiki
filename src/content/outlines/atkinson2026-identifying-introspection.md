---
summary: "The paper's outline, worked back from the finished paper: three claims in a chain, each producing what the next one needs, with the evidence, the strength and the expected objections for each. The claim every statement of the paper keeps is the last one."
reviewed: false
sources:
  - "full text (extended preprint, iii.baulab.info), appendices included"
  - "the COLM 2026 camera-ready (iii.baulab.info), for the comparison of versions"
  - "the lead author's thread"
  - "the senior author's thread"
  - "Nanda (2025), Highly Opinionated Advice on How to Write ML Papers"
added: 2026-10-06
updated: 2026-10-06
---

## What this page is

An outline is what a paper is written from: its claims, the evidence for each, and the job of every section. This page works back from the finished paper to that outline. It follows the stages in Neel Nanda's [Highly Opinionated Advice on How to Write ML Papers](https://www.alignmentforum.org/posts/eJGptPbbFPZGLpjsp/highly-opinionated-advice-on-how-to-write-ml-papers): compress the work to one to three claims, outline the introduction, then outline the whole paper. The [paper page](/papers/atkinson2026-identifying-introspection) covers the same paper experiment by experiment.

Outside the notes, the page reports what the paper and its authors' threads say, with where each statement is. A passage marked **Note from Claude** is an observation by the model that drafted the page, and not something the paper says.

## The narrative

Nanda's first stage: the claims, why they matter, and the key evidence for each.

- **Problem.** "Large language models make claims about themselves that are both consequential and increasingly difficult to verify from behavior alone." (Abstract.)
- **Question.** "Our work asks whether grounding has a physical basis that can be detected." (§1.)
- **Takeaway.** "it is possible to test whether a self-reported claim about behavior shares a mechanistic cause with the behavior, without needing to evaluate the claim's content." (§8.)

The three claims form a chain. Each produces what the next one needs: two models to compare, then a hypothesis about what separates them, then a test of it.

> **Note from Claude:** Nanda's format sets a paper's claims side by side. These are in sequence, so the hand-offs matter as much as the claims. The claim that leads is the last one. It is the only one in the title, and by my count its section is about a third of the main text.

### Claim 1: faithful self-report can emerge from training on decisions alone, and late

Trained only to decide, a model can come to report its learned preferences faithfully, well after it has learned to decide.

- **How strongly it is made.** As an existence proof. The wording is "can lead to the emergence" (Abstract). It rests on one tuned run of Qwen3-32B (Appendix B.2), and the authors say their goal is "a controlled comparison between specific checkpoints, not a claim about all possible training regimes" (§7).
- **What a reader needs first.** The setting of [Plunkett et al. (2025)](/papers/plunkett2025-self-interpretability) and the two measures, decision performance and faithfulness (§2).
- **What is new.** Stopping one run at two checkpoints to get a faithful and an unfaithful model of the same learned task (§1, finding 1).
- **What it is for.** It produces the comparison everything after it uses. "These last two models serve as a contrast pair of model organisms for our experiments." (§3.)
- **Key evidence.**
  - [Figure 1b](/papers/atkinson2026-identifying-introspection#1-train-on-decisions-then-ask-about-them). Qwen3-32B at step 1000: decision performance 0.82, faithfulness about 0.25. At step 3000: 0.92 and 0.83.
  - Figure 2. Five Qwen3 sizes from 0.6B to 32B all reach about 0.9 decision performance. Only the 32B model "begins to recover its initial moderate level of faithfulness".
- **In the appendix.** A second model family (B.6), the same run evaluated with reasoning switched on (B.3), and a speculative account of negative faithfulness (D).

> **Note from Claude:** Nanda's last check on a claim is "Could the evidence be true but the claim false?". Here the evidence is one run. Appendix B.2 says it was picked from 15 hyperparameter draws by "a simple average of decision performance and faithfulness after 2000 training steps", so faithfulness was part of what it was picked for. Appendix B.6 reports that Gemma-4 "does not reproduce Qwen3-32B's within-run delay". The claim as worded allows for both: it says faithful self-report *can* emerge this way, and the authors limit it to "specific checkpoints".

### Claim 2: the faithful checkpoint keeps its preferences earlier in the network

The faithful checkpoint keeps its preference information earlier, and confining training to early layers makes a smaller model report more faithfully.

- **How strongly it is made.** Hedged. The observation is stated flatly: the faithful checkpoint "responds to ablations 5–6 layers earlier". Its reading is flagged each time: "consistent with the hypothesis" (Abstract), "We speculate" (§4), and "a hypothesis about the consequences of earlier storage, rather than its origin" (§4).
- **What it is for.** It supplies the hypothesis that §5 tests. "Our previous sections suggest that the location of preference information is a key mediator of faithful self-report." (§5.)
- **Key evidence.**
  - [Figure 3](/papers/atkinson2026-identifying-introspection#2-find-where-each-checkpoint-keeps-its-preferences), a measurement. Adapter layers are removed before or after a cut, in both checkpoints. The faithful one responds 5–6 layers earlier.
  - [Figure 4](/papers/atkinson2026-identifying-introspection#3-force-the-preferences-into-early-layers), an intervention. Qwen3-14B does not self-report faithfully when trained on all 40 layers. Trained on the first *k* only, the models with *k* of 10, 15 or 20 "are markedly better self-reporters than models with late layers unfrozen". The paper gives no value in its text; Atkinson's thread gives faithfulness of 0.74 for *k* = 20 ([post 6](/threads/diatkinson-identifying-introspection#post-6)).
- **Checks in the appendix.** Training only the late layers never reaches the same faithfulness, so the effect is not one of parameter count (E, Figure 9). The faithful Gemma-4 31B adapter "shows the same early-layer localization" (§4, B.6, Figure 8).

> **Note from Claude:** The same check on claim 2. The measurement compares two checkpoints of one 32B run, and the intervention is on a different model, Qwen3-14B. The two halves of the argument meet in the hypothesis and not in one model. What the paper adds is the reversed-freezing control (Appendix E) and the Gemma-4 ablation (B.6), and it calls the reading a hypothesis throughout.

### Claim 3: faithful models decide and report with more of the same weights, and that can be measured without reading the report

- **How strongly it is made.** Hedged and narrow. "at least in our restricted setting" (Abstract). "Our proof-of-concept experiment suggests it can be feasible" (§1, finding 3). "Our method discriminates between groups, not individuals" (§7). It is stated most strongly at the end of §1: the setting "has allowed us, for the first time, to show that grounding is a computational property that can be measured without inspecting the model output".
- **Why it matters, as the paper puts it.** Three situations in which a report cannot be checked against behavior: the outputs are "too long or complicated for a human to understand", the behavior is "too rare to reliably observe", or "the claims concern purely internal reasoning" (§1).
- **What a reader needs first.** Attribution patching (§5.2, Appendix F), and why it takes a matched population of models to use it (§5.1).
- **Key evidence.**
  - [Figure 5d](/papers/atkinson2026-identifying-introspection#4-tell-the-two-kinds-of-model-apart-without-reading-the-report), a measurement. Across 32 matched pairs of single-character models, attribution similarity averages 0.34 (SD 0.26) for faithful models and 0.08 (SD 0.10) for unfaithful ones. The difference is 0.26, with a paired bootstrap 95% CI of [0.16, 0.36].
  - Figure 5c, a description. Importance by layer: "three of the four combinations peak at the same layer (38)", and the unfaithful models' decision curve "peaks 11 layers later (49)".
  - [Figure 6](/papers/atkinson2026-identifying-introspection#5-check-the-attribution-scores-by-intervening), an intervention. Only the *k* weight matrices ranked highest on one task are switched on, and the model is tested on the other task. Faithful adapters "recover a given fraction of KL with 8–12× fewer matrices than unfaithful ones", and recover more even when the matrices are chosen at random.
- **Checks in the appendix.** Without the selection filters the gap is 0.21, CI [0.09, 0.33], on 10 pairs (C.1). The gap is stable from four integrated-gradient steps upward (F.1, Table 2). Across 100 characters within one backbone, similarity and faithfulness correlate at r = 0.197, CI [0.006, 0.375], which the authors call "a sign of life rather than a standalone finding" (G, Figure 10).

> **Note from Claude:** The same check on claim 3. All 64 models sit on two backbones, and after filtering "every model built on the late backbone is faithful, and every model built on the early backbone is unfaithful" (§5.1). Faithful against unfaithful is then the same split as late backbone against early backbone, so anything else that differs between the two backbones also differs between the groups. What the paper offers on this: pairs matched on character, data, hyperparameters and initialization (§5.1), the within-backbone analysis of Appendix G, and the stated limit that the test separates groups and not individuals (§7).

### Limits the authors state

From §7 and §8:

- The task is "linear, five-dimensional, and explicitly constructed", and "whether this generalizes to complex, unverifiable reports remains open".
- The test separates groups, not individuals. "while high attribution similarity is sufficient evidence for faithfulness, low similarity is not strong evidence against it."
- "We study LoRA adapters, not full models."
- "we do not comprehensively tune hyperparameters".
- Left unexplained: why preferences move to earlier layers, and the negative faithfulness of the 4B and 8B models.
- A faithful adapter with low similarity "might be a correct confabulator: accurately self-reporting through an ungrounded mechanism".

## Where the paper states itself

A paper restates its narrative at several lengths. The rows run from the shortest statement to the longest, then the authors' two threads. The columns are the three units that recur.

| Where | Claim 1: setting and late emergence | Claim 2: earlier layers | Claim 3: shared weights, measured without the report |
|---|---|---|---|
| Title | | | "Identifying Introspection From the Inside" |
| [Atkinson's first post](/threads/diatkinson-identifying-introspection#post-1) | | | "faithful models decide and report with the same layers. Unfaithful ones don't." |
| Central finding, §7 | | | "the degree to which the same adapter weights mediate both decision-making and self-report" |
| Abstract, last sentence | | | "distinguish between the two patterns of computation by examining the structure of the networks themselves" |
| Conclusion, §8 | "can emerge from decision-task training alone" | "preference representations that colocate with the apparent mechanisms of self-report" | "test whether a self-reported claim about behavior shares a mechanistic cause with the behavior" |
| Abstract, body | sentence 5 | sentences 7–8, the first research question | sentences 9–10, the second |
| Findings list, §1 | finding 1 | finding 2 | finding 3, and the attribution patching named in finding 2 |
| Section | §3 | §4 | §5 |
| Main-text figures | 1b, 2 | 3, 4 | 5, 6 |
| [Atkinson's thread](/threads/diatkinson-identifying-introspection) | posts 2–4 | posts 5–6 | posts 1, 7–10 |
| [Bau's thread](/threads/davidbau-identifying-introspection) | posts 1–6 | posts 7–8 | posts 9–10 |

The image on Atkinson's first post is the layer plot of Figure 5c. The image on Bau's is a cartoon robot over the question "Is that report true?".

> **Note from Claude:** Placing the title under claim 3 is my reading of it. With that, claim 3 is the only unit present at every length, and claim 1 is absent from the four shortest statements. The two authors lead with different units: Atkinson's first post states claim 3, and Bau's pitches the setup as a way to "induce introspection on open LMs", with six of his ten posts on claim 1. The abstract and the sections divide the paper by question, while the findings list divides it by kind of contribution (a setting, evidence, a method), which is why attribution patching falls under two findings. One main-text experiment appears in none of these statements: the cross-task intervention of §5.4, which has its own subsection and Figure 6.

## The abstract, sentence by sentence

The role is the slot the sentence fills in Nanda's template for an abstract.

| # | Sentence, abbreviated | Role |
|---|---|---|
| 1 | Models "make claims about themselves that are both consequential and increasingly difficult to verify from behavior alone." | Context and the need, in one sentence |
| 2 | "How can we distinguish plausible confabulations from genuine introspection?" | The motivating question |
| 3 | "we identify mechanistic signatures of faithful self-report in a controlled setting." | The contribution, with nuance dropped |
| 4 | Low-rank adapters, fictitious characters, "latent linear preference functions". | Clarifying detail: the setup |
| 5 | Decision-only fine-tuning "can lead to the emergence of accurate self-reporting". | Claim 1 |
| 6 | "We ask two research questions about this emergent phenomenon." | Signpost |
| 7 | Is the emergence "accompanied by a measurable structural change in the model?" | Question for claim 2 |
| 8 | Ablations and freezing "indicate that preference representations shift to earlier layers". | Claim 2, its experiments, its hedge |
| 9 | "can these structural differences distinguish faithful models from unfaithful ones?" | Question for claim 3 |
| 10 | Faithful models show "significantly higher attribution similarity". | Claim 3, its method, why it matters |
| 11 | Earlier work observed the difference "behaviorally"; "our work proposes that, at least in our restricted setting," it can be read from structure. | Close: what is new, and the standard of evidence |

> **Note from Claude:** Two things differ from the template. It suggests a concrete result ("If possible, include a concrete metric or result"), and this abstract has no number in it. And two of the three claims arrive as a question followed by its answer, where the template has one statement per idea. Sentence 6 has no slot in the template.

## The introduction, paragraph by paragraph

Nanda's second stage. Seven paragraphs; the role is his name for the slot.

| ¶ | What it says | Role | Cites |
|---|---|---|---|
| 1 | Models make claims about themselves: of being unbiased, of ignorance, of being in love. Do such claims "arise because they are true"? | Context and motivating question | [Bai et al. 2025](/papers/bai2025-explicitly-unbiased), [Cywiński et al. 2025](/papers/cywinski2025-eliciting-secret-knowledge), Roose 2023 |
| 2 | Testimony needs two properties, faithfulness and grounding. "We reserve the term introspection for self-report that has both properties." | Key terms defined | none |
| 3 | Does grounding have a physical basis that can be detected? Matching behavior is not enough. "If self-reports share a proximal cause with task behavior, that is evidence for grounding." | Why earlier approaches fall short, and the inference the paper rests on | [Morris & Plunkett 2025](/papers/morris2025-causal-bypassing) |
| 4 | The approach: interventions on internals, in the setting of Plunkett et al., with low-rank adapters and the self-report asked in a separate context window. "Then we isolate, localize and compare the internal mechanisms". | Technical background; marks what is inherited | [Plunkett et al. 2025](/papers/plunkett2025-self-interpretability), Hu et al. 2021 |
| 5 | "In this paper, we present three main findings": a setting, mechanistic evidence, a blinded test. | Contributions list, with the case for each folded in | Plunkett et al. 2025 |
| 6 | Where the honesty of testimony has to be assessed: outputs too long, behavior too rare, claims about internal reasoning. | Impact: who needs this | Irving et al. 2018, Liu & Feng 2024, [Li et al. 2025](/papers/li2025-explain-own-computations) |
| 7 | "Our work shows one possible path for tackling the problem." A narrow setting, and the "for the first time" statement. | Takeaway and standard of evidence | none |

> **Note from Claude:** Against Nanda's order, the contributions list comes before the impact paragraphs and not at the end, and there is no paragraph that makes the case with results. The only number in the introduction's prose is "32 pairs". The results for claim 1 are in the caption of Figure 1, which sits inside the introduction, so a reader who skips figures meets the first measured value in §3.

## The paper, section by section

Nanda's third stage. For each section: its job, how it opens, what it reports, what it hands on, and what would be missing without it.

### Abstract and §1 Introduction

Covered above. The introduction carries **Figure 1**. Panel a shows the decision prompt, the self-report prompt and the two measures. Panel b shows the 32B training curve with the two checkpoints marked. The caption ends as a roadmap: structural changes in §4, and whether they tell "whether that self-report is grounded" in §5. Footnote 1 gives the project page.

### §2 Background

**Job:** everything inherited from Plunkett et al., and the two measures every plot uses.

- The setting is Plunkett et al.'s. Preferences are random so that "self-reports cannot succeed by appealing to common-sense priors".
- Characters: a person, a class of objects, a hidden vector **p** over five attributes.
- Decision task: binary choices labelled by a linear utility. Preferences are "never articulated explicitly in the training corpus". The model's learned preferences **p̂** are recovered by logistic regression on its outputs.
- Self-report task: weights as JSON, averaged into **p̃**. "We do not train on the self-report task." Each task has its own context window.
- Metrics: decision performance is corr(p̂, p). Faithfulness is corr(p̂, p̃), "regardless of whether that behavior matches the training target".
- **Without it:** no plot can be read, and the first three objections in the table below lose their answer.

### §3 Model organisms of faithful self-report

**Job:** make the two models. Claim 1; Figures 1b and 2.

- Opens: "We begin by replicating Plunkett et al. (2025)'s results on the Qwen3 family". Five sizes, rank-8 LoRA on every linear layer, decision task only.
- Reports "four phenomena":
  1. Base models above 0.6B are "more faithful than chance even with no fine-tuning". The authors hypothesize that common sense drives both choice and report.
  2. Every size reaches high decision performance. Only 32B shows "(re)emergent faithful self-report".
  3. The 4B and 8B models end with negative faithfulness. Sent to Appendix D.
  4. The contrast pair: step 1000 and step 3000 of the 32B run.
- Hands on: the contrast pair, to §4 and §5.
- **Without it:** §4 and §5 have nothing to compare.

### §4 Localizing a mechanistic signature of faithful self-report

**Job:** find what differs between the two models, and turn it into a hypothesis. Claim 2; Figures 3 and 4.

- Opens with its question: "What is the difference between the faithful late checkpoint and the unfaithful early checkpoint of our tuned 32B model?"
- Weight ablations (Figure 3). The prediction comes first: "If preference information is localized by layer, then we should see decision behavior, and possibly self-report, change as we remove successive layers." Then the result, the hypothesis, and a pointer to the Gemma-4 repeat.
- Layer freezing (Figure 4). Opens "To pursue this hypothesis". The intervention on Qwen3-14B, and a pointer to the parameter-count control in Appendix E.
- Hands on: the hypothesis that location matters because report and decision use the same representations.
- **Without it:** §5 has no stated reason to look for shared weights.

### §5 Identifying faithful self-reporters with attribution patching

**Job:** the test. Claim 3; Figures 5 and 6. The section is built like a short paper of its own: a framing, a design, a method, results and a validation.

- **Framing**, four paragraphs. A thought experiment: two groups of models that choose alike, one faithful and one not. "How can you tell them apart?" Comparing reports with ground truth is the "natural answer", and it is often unavailable. So "a more stringent test": one that separates the groups "without requiring that we understand the content of the self-reports". Then the hypothesis from §4, then a three-step roadmap.
- **§5.1 Creating adapter pairs** (Figure 5a). A population of single-character adapters trained on the two checkpoints, frozen. Three stated advantages: both kinds of model are cheap to train, attribution needs less memory, and the frozen backbone holds the shared machinery so the new adapter stores "only the relevant preference information". The two adapters in a pair share character, data, hyperparameters and initialization. Three filters leave 32 pairs. Footnote 2: the findings do not depend on the filters (C.1).
- **§5.2 Scoring adapters with attribution patching** (Figure 5b). The method, and the definition of attribution similarity. Detail in Appendix F.
- **§5.3 Results** (Figures 5c and 5d). Opens "Now we can answer the question we posed at the beginning of this section". The similarity gap, then the layer profile. Footnote 3: a within-model version in Appendix G.
- **§5.4 Causally validating attribution scores** (Figure 6). Opens with the objection it answers: "Attribution scores are intended to approximate the effect of causal interventions, but are not themselves causal." Method, prediction, random baseline, result.
- **Without it:** the title's claim has no evidence. Without §5.4 alone, claim 3 rests on an approximation.

### §6 Related work

**Job:** set the claim of novelty against what exists. It comes after the results, where Nanda prefers it. Three paragraphs, each ending by placing the paper:

- Behavioral evidence, concept injection and circuit-level work. Ends: "our contribution is a mechanistic criterion—shared computational structure between decision-making and self-report—that does not require understanding or inspecting the content of the report itself."
- Out-of-context reasoning and delayed generalization. The late emergence "is reminiscent of grokking", "though the mechanism differs".
- Skepticism and privileged access. Ends: "These results inform a central premise of our work".

### §7 Discussion

**Job:** say what the result is and how far it goes. The central finding in one sentence, then why it matters: a model "could report its preferences in an obfuscated format, or in a language we do not speak, and our metrics would still apply". Then the limitations and open questions listed [above](#limits-the-authors-state).

### §8 Conclusion

Restates claim 1, then claims 2 and 3 in one clause. The "As far as we know, this work is the first" statement. A caution on scope. What would follow if such signatures "can be identified in more naturalistic settings".

> **Note from Claude:** Three things about the body as a whole. The sections announce their own jobs: §4 opens with its question, §5 with a thought experiment, §5.3 with "Now we can answer", §5.4 with the objection it answers, and §3 closes by naming what it hands on. These are the because, aim, product and leads fields of this wiki's experiment diagrams, in the authors' own sentences. Claims 2 and 3 are argued the same way, with a measurement that shows a difference and then an intervention that tests the reading of it, and each claim gets two figures. By my count of the PDF's text, with captions left out, the main text is about 3,860 words: abstract 6%, §1 17%, §2 10%, §3 7%, §4 8%, §5 33%, §6 9%, §7 7%, §8 4%. The test of §5 gets as much text as the abstract, introduction and background together.

## The appendices, by the job each does

About 2,300 words by the same count.

| Appendix | Holds | Job |
|---|---|---|
| A.1 | How preference weights are drawn | Detail to replicate |
| A.2 | Both prompts in full; parsing rules; footnote 4 | Detail to replicate |
| A.3 | The logistic regression for p̂ | Detail to replicate |
| A.4 | 24 self-report prompts and 16 decisions per character | Detail to replicate |
| B | Training hyperparameters for the multi-character adapters | Detail to replicate |
| B.1 | Table 1: layers per model size | Detail to replicate |
| B.2 | How the 32B run was tuned: 15 random draws | Detail to replicate |
| B.3 | Figure 7: the 32B run evaluated with reasoning on | Extra result |
| B.4 | The freezing conditions | Detail to replicate |
| B.5 | Evaluation on 32 or 100 characters | Detail to replicate |
| B.6 | Figure 8: the Gemma-4 sweep and layer ablation | Check: a second model family |
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

## Objections the paper expects

Each control, robustness appendix and hedge answers something. Each row gives the objection, where the paper handles it, and how.

| # | Objection | Where | How |
|---|---|---|---|
| 1 | Reports could be right from common-sense priors | §2 | Preferences are generated at random |
| 2 | The model could read its own earlier answers | §2, A.2 | Separate context windows; no training on self-report |
| 3 | Faithfulness might just be accuracy on the target | §2 | It is measured against the model's own behavior |
| 4 | A report that matches behavior is not thereby grounded | §1, §6 | Taken as the premise; it is the reason for a mechanistic test |
| 5 | Earlier storage is a difference between two checkpoints, not a cause | §4 | The layer-freezing intervention |
| 6 | The freezing effect is one of parameter count | Appendix E | Freezing the early layers instead |
| 7 | One model family | §4, B.6 | Gemma-4: faithful self-report only at 31B, no delay, the same early-layer localization |
| 8 | The two groups of models differ in more than faithfulness | §5.1 | Matched pairs, and a filter on decision performance |
| 9 | The result depends on the filters | Footnote 2, C.1 | Rerun without them |
| 10 | Attribution is not causal | §5.4 | Cross-task patching with a random baseline |
| 11 | The estimate depends on the number of integration steps | F.1 | Table 2 |
| 12 | Conceded | §7, §8 | The limits listed [above](#limits-the-authors-state) |

## Inherited and new

Inherited, as the paper says:

- The setting and prompts: "Adopting Plunkett et al. (2025)'s setting" (§1), "We adopt the setting" (§2), "We begin by replicating" (§3), Appendix A.2.
- LoRA (Hu et al., 2021).
- Attribution patching with integrated gradients (Nanda, 2023; Sundararajan et al., 2017; Hanna et al., 2024).
- Activating a subset of weight matrices (Nief et al., 2026).
- That matching behavior is not enough ([Morris & Plunkett, 2025](/papers/morris2025-causal-bypassing)).

Claimed as new, in the paper's words:

- "We demonstrate how to construct contrast pairs of fine-tuned models that exhibit faithful and unfaithful testimony about the same learned task" (§1).
- "our contribution is a mechanistic criterion" (§6).
- "for the first time, to show that grounding is a computational property that can be measured without inspecting the model output" (§1).
- "As far as we know, this work is the first to illustrate a core principle" (§8).

## What changed between the two versions

The [project page](https://iii.baulab.info) links two PDFs: the COLM 2026 camera-ready and an extended preprint. Their metadata dates them 12 August and 5 October 2026. Both have the same sections and the same appendices A to H, and no experiment was added or removed. Going by those dates, the changes from the camera-ready to the preprint are edits to the presentation:

- **Figure 1 was split.** In the camera-ready it is "Overview of our approach": five panels running from the setting to the attribution-similarity result. In the preprint it is "Overview of our setting", two panels and a roadmap. The test moved into Figure 5, which went from two plots to a four-panel diagram.
- **The abstract lost a sentence** on the intervention of §5.4, which began "Cross-task causal patching confirms this".
- **"Introspection" was pinned down.** The sentence "We reserve the term introspection for self-report that has both properties" was added to §1. A Discussion paragraph headed "What we mean by introspection" was removed, with its two cognitive-science references.
- **The wording followed.** "no explicit introspection training" became "no explicit self-report training". "grounded introspection" became "grounded self-report", and "the signature of faithfulness we are looking for" became "the signature of introspection we are looking for". "truthful adapters" became "faithful models".
- **One phrase was reserved.** In related work, [Lindsey et al. (2025)](/papers/lindsey2025-biology-of-llm) were first described as "identifying mechanistic signatures of faithful and fabricated chain-of-thought reasoning", then as "identifying differences between" them.
- **A footnote was removed** that tied the decision-performance filter to the model-similarity concern of [Song et al. (2025a)](/papers/song2025-fail-to-introspect).
- **The freezing experiment was re-described**, from "freezing the last k" layers to training "on only the first k".

> **Note from Claude:** In the preprint the measurement is still called a signature of three things, depending on where one reads. It is "mechanistic signatures of faithful self-report" in the abstract, and the title of §4 has the same phrase in the singular. It is "A blinded test for grounded self-report" in finding 3 and "a physical basis for grounding" in §8. It is "the signature of introspection we are looking for" in §5, and introspection in the title. The paper defines introspection as self-report that is both faithful and grounded, and it raises the difference itself as an open question: "If attribution similarity measures grounding rather than faithfulness per se" (§7). This outline keeps each location's own word.

## How this outline was made

A finished paper restates itself at several lengths: the title, the abstract, the list of findings, the lead figure's caption, the section headings, the conclusion, and the authors' threads. The outline was read off those statements, and not written as a summary, in six passes:

1. Line up every place the authors state the whole paper briefly. What recurs is a claim. What survives down to the title leads.
2. Give each sentence of the abstract and each paragraph of the introduction its role in Nanda's templates.
3. For each section, record the question it opens with, what it reports, what it hands on, and what would be missing without it.
4. For each claim, list the key experiments, its strength in the authors' words, and what is new. For each control and hedge, the objection it answers.
5. Count the words each part gets.
6. Check that every section, figure, table, appendix and footnote of the paper appears in the outline, and compare the public versions.
