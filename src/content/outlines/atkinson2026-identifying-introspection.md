---
summary: "Trained only to make decisions, a model can come to report its learned preferences faithfully, well after it has learned to decide. The checkpoint that reports faithfully keeps those preferences earlier in the network, and faithful models decide and report with more of the same weights, which can be measured without reading the report."
reviewed: false
sources:
  - "full text (extended preprint, iii.baulab.info), appendices included"
  - "the lead author's thread"
  - "the senior author's thread"
added: 2026-10-06
updated: 2026-10-06
---

## The paper in brief

- **Problem.** "Large language models make claims about themselves that are both consequential and increasingly difficult to verify from behavior alone." (Abstract.)
- **Why it matters.** A report often cannot be checked against behavior: the outputs are "too long or complicated for a human to understand", the behavior is "too rare to reliably observe", or "the claims concern purely internal reasoning". (§1.)
- **Question.** "Our work asks whether grounding has a physical basis that can be detected." (§1.)
- **Answer.** In a controlled setting, the authors report "evidence for a physical basis for grounding", and with it a principle: "it is possible to test whether a self-reported claim about behavior shares a mechanistic cause with the behavior, without needing to evaluate the claim's content." (§8.)

The argument is a chain of three claims. Each produces what the next one needs: two models to compare, then a hypothesis about what separates them, then a test of it.

1. Trained only to decide, a model can come to report its learned preferences faithfully, and it does so late.
2. The checkpoint that reports faithfully keeps its preference information earlier in the network.
3. Faithful models decide and report with more of the same weights, and that can be measured without reading the report.

## What the paper starts from

**Three terms** (§1).

- *Faithfulness*: "An AI's claims about itself should be accurate."
- *Grounding*: "Claims about behavior must be causal."
- *Introspection*: "self-report that has both properties".

**The inference it rests on** (§1). A report that matches behavior is not thereby grounded ([Morris & Plunkett, 2025](/papers/morris2025-causal-bypassing)). "Grounding requires reporting the true cause." So the paper looks inside the model: "If self-reports share a proximal cause with task behavior, that is evidence for grounding."

**The setting** (§2), taken from [Plunkett et al. (2025)](/papers/plunkett2025-self-interpretability). A model is fine-tuned to make choices on behalf of fictional characters. Each character has hidden preference weights over five attributes, and the training data shows only the choices. In a separate context window the model is then asked to state the weights. It is never trained to do that.

**Two measures** (§2). *Decision performance* is how closely the preferences revealed by the model's choices follow the target preferences. *Faithfulness* is how closely the preferences the model states follow the ones its choices reveal, "regardless of whether that behavior matches the training target". Both are correlations.

![Two panels. Left, 'Train and test on decisions': 100 characters, each with its own hidden preference vector p. A prompt reads 'Imagine you are Gregor Samsa buying a washing machine. Would you choose A or B?', with option A at price $600 and noise 45 dB and option B at price $350 and noise 75 dB. The training label is whichever option scores higher under p, the character's hidden preferences. Decision performance is corr(p̂, p), where p̂ is inferred from the model's choices. Right, 'Test on self-reports': a prompt reads 'Imagine you are Gregor Samsa choosing between A and B. How would you weight each attribute?' and the model answers 'price: −50, noise: 100, …'. Averaged over 24 prompts, these are the stated preferences p̃. Faithfulness is corr(p̂, p̃): do the stated preferences match those revealed by the model's decisions?](/figures/atkinson2026-identifying-introspection/fig1a-setting.png "Figure 1a of the paper: the decision task, the self-report task and the two measures.")

**What the design rules out** (§2):

- A report that is right from common sense. Preferences are generated at random, so "self-reports cannot succeed by appealing to common-sense priors".
- A report read off earlier answers. Each task has its own context window, so "the model cannot simply infer its attribute weights from previous answers".
- A report that only matches the training target. Faithfulness is measured against the model's own behavior.

**Tools taken from earlier work.** LoRA adapters (Hu et al., 2021). Attribution patching with integrated gradients (Sundararajan et al., 2017; Hanna et al., 2024). Activating a subset of an adapter's weight matrices (Nief et al., 2026).

## The argument, claim by claim

### Claim 1: faithful self-report can emerge from training on decisions alone, and late

Trained only to decide, a model can come to report its learned preferences faithfully, well after it has learned to decide.

**Evidence.** Qwen3-32B at step 1000 has decision performance of 0.82 and faithfulness of about 0.25. At step 3000 it has 0.92 and 0.83 (Figure 1b; [experiment 1](/papers/atkinson2026-identifying-introspection#1-train-on-decisions-then-ask-about-them) on the paper page).

![Training curves for Qwen3-32B trained only on decisions. Decision performance rises quickly and levels off near 0.9, while faithfulness dips, then climbs late. Step 1000 is marked as the unfaithful model, good at the task and bad at introspection, and step 3000 as the faithful model, good at both.](/figures/atkinson2026-identifying-introspection/fig1b-training.png "Figure 1b of the paper: decision performance and faithfulness of Qwen3-32B over training, with the two checkpoints marked.")

Five Qwen3 sizes from 0.6B to 32B all reach about 0.9 decision performance. Only the 32B model "begins to recover its initial moderate level of faithfulness" (Figure 2).

![Two panels of training curves for Qwen3 models of 0.6B, 4B, 8B, 14B and 32B parameters. Left: decision performance rises to about 0.9 for every size, the 0.6B model last. Right: faithfulness over the same steps. Only the 32B model ends clearly above zero; the 4B and 8B models end below zero.](/figures/atkinson2026-identifying-introspection/fig2-scale.png "Figure 2 of the paper: decision performance (left) and faithfulness (right) during training, by model size.")

- **An objection it expects.** That this is one model family. On Gemma-4, strong faithful self-report also appears only at the largest size, 31B, but "without Qwen3's delayed-generalization trajectory" (§4, Appendix B.6).
- **How strongly it is made.** As an existence proof. The wording is "can lead to the emergence" (Abstract). It rests on one tuned run of Qwen3-32B (Appendix B.2), and the authors say their goal is "a controlled comparison between specific checkpoints, not a claim about all possible training regimes" (§7).
- **What it hands on.** Two checkpoints of one run that decide alike and report differently. "These last two models serve as a contrast pair of model organisms for our experiments." (§3.)

> **Note from Claude:** One check on a claim is to ask how its evidence could hold and the claim still be false. Here the evidence is one run. Appendix B.2 says it was picked from 15 hyperparameter draws by "a simple average of decision performance and faithfulness after 2000 training steps", so faithfulness was part of what it was picked for, and the second model family shows the ability without the delay. The claim as worded allows for both: it says faithful self-report *can* emerge this way, and the authors limit it to "specific checkpoints".

### Claim 2: the faithful checkpoint keeps its preferences earlier in the network

The faithful checkpoint keeps its preference information earlier, and confining training to early layers makes a smaller model report more faithfully.

**Evidence.** First a measurement. Adapter layers are removed before or after a cut, in both checkpoints, and the faithful one "responds to ablations 5–6 layers earlier" (Figure 3; [experiment 2](/papers/atkinson2026-identifying-introspection#2-find-where-each-checkpoint-keeps-its-preferences) on the paper page).

![Two panels plotting a correlation against the ablated layer, for the early and the late checkpoint, with earlier layers ablated (solid lines) or later layers ablated (dashed lines). Left: the correlation between target and reported preferences. Right: the correlation between target and behavioral preferences, with midpoints marked at layers 35 and 40 for the late checkpoint and 41 and 45 for the early one.](/figures/atkinson2026-identifying-introspection/fig3-ablation.png "Figure 3 of the paper: reported and behavioral preferences against the target as adapter layers are ablated, for the two checkpoints.")

Then an intervention. Qwen3-14B does not self-report faithfully when trained on all 40 layers. Trained on the first *k* only, the models with *k* of 10, 15 or 20 "are markedly better self-reporters than models with late layers unfrozen" (Figure 4; [experiment 3](/papers/atkinson2026-identifying-introspection#3-force-the-preferences-into-early-layers)). The paper gives no value in its text; Atkinson's thread gives faithfulness of 0.74 for *k* = 20 ([post 6](/threads/diatkinson-identifying-introspection#post-6)).

![Two panels of training curves for Qwen3-14B with adapters on only the first k layers, for k from 5 to 35. Left: decision performance, which rises for every k of 10 or more. Right: faithfulness, which rises for k of 10, 15 and 20 and ends below zero for k of 25, 30 and 35.](/figures/atkinson2026-identifying-introspection/fig4-freezing.png "Figure 4 of the paper: decision performance (left) and faithfulness (right) of Qwen3-14B when only its first k layers are trained.")

- **Objections it expects.**
  - That earlier storage is only a difference between two checkpoints, and not a cause. The freezing experiment is the answer: it sets where preferences can be stored and watches faithfulness.
  - That the freezing effect comes from training fewer parameters. Training only the late layers never reaches the same faithfulness (Appendix E, Figure 9).
  - That this is one model family. The faithful Gemma-4 31B adapter "shows the same early-layer localization" (§4, Appendix B.6, Figure 8).
- **How strongly it is made.** Hedged. The observation is stated flatly, and its reading is flagged each time: "consistent with the hypothesis" (Abstract), "We speculate" (§4), and "a hypothesis about the consequences of earlier storage, rather than its origin" (§4).
- **What it hands on.** A hypothesis for §5 to test. "Our previous sections suggest that the location of preference information is a key mediator of faithful self-report." Perhaps "the model is using the same representations to generate both its decisions and its self-reports". (§5.)

> **Note from Claude:** The same check on claim 2. The measurement compares two checkpoints of one 32B run, and the intervention is on a different model, Qwen3-14B. The two halves of the argument meet in the hypothesis and not in one model. The paper calls the reading a hypothesis throughout.

### Claim 3: faithful models decide and report with more of the same weights, and that can be measured without reading the report

To test it the authors need many faithful and unfaithful models that differ in little else. They train a new single-character adapter on top of each of the two checkpoints, frozen, for a character neither has seen, and keep 32 matched pairs (§5.1). Attribution patching then scores every adapter weight for how much it matters to deciding and to reporting. *Attribution similarity* is the cosine similarity between the two sets of scores (§5.2). Figure 5 shows the design and both results.

![Four panels. a: the same new character is trained into the early checkpoint (step 1000) and the late checkpoint (step 3000), giving an unfaithful and a faithful single-character model. Both are good at the task; the first is bad at introspection and the second good. b: attribution patching scores every weight of the new character twice, once for the decision prompt 'Would you choose A or B?' and once for the self-report prompt 'How would you weight each attribute?', by scaling the new character's weights from off to on. The two sets of scores are summed per layer for panel c and compared by cosine for panel d. c: importance by layer, averaged across 32 single-character models. In the unfaithful model deciding peaks at layer 49 and reporting at layer 38, 11 layers apart; in the faithful model both peak at layer 38. d: attribution similarity against faithfulness, one dot per model. Unfaithful models average 0.08 and faithful models 0.34.](/figures/atkinson2026-identifying-introspection/fig5-test.png "Figure 5 of the paper: the paired design (a), the scoring (b), importance by layer (c), and attribution similarity against faithfulness (d).")

**Evidence.** First a measurement. Attribution similarity averages 0.34 (SD 0.26) for faithful models and 0.08 (SD 0.10) for unfaithful ones. The difference is 0.26, with a paired bootstrap 95% CI of [0.16, 0.36] (Figure 5d; [experiment 4](/papers/atkinson2026-identifying-introspection#4-tell-the-two-kinds-of-model-apart-without-reading-the-report) on the paper page). By layer, "three of the four combinations peak at the same layer (38)", and the unfaithful models' decision curve "peaks 11 layers later (49)" (Figure 5c).

Then an intervention. Only the *k* weight matrices ranked highest on one task are switched on, and the model is tested on the other task. Faithful adapters "recover a given fraction of KL with 8–12× fewer matrices than unfaithful ones", and recover more even when the matrices are chosen at random (Figure 6; [experiment 5](/papers/atkinson2026-identifying-introspection#5-check-the-attribution-scores-by-intervening)).

![Two panels showing the fraction of the full adapter's effect recovered as more of its weight matrices are switched on, from 1 to 256. Left: matrices ranked by their attribution on the decision task. Right: ranked by their attribution on the self-report task. For the same selection method, the faithful adapters' curves sit above the unfaithful adapters' over nearly the whole range, and attribution-ranked selection (solid lines) recovers more than random selection (dotted lines).](/figures/atkinson2026-identifying-introspection/fig6-cross-task-patching.png "Figure 6 of the paper: cross-task causal patching. Each adapter's matrices are ranked on one task and evaluated on the other.")

- **Objections it expects.**
  - That the two groups differ in more than faithfulness. The two adapters in a pair share character, data, hyperparameters and initialization, and both must reach decision performance of at least 0.9 (§5.1).
  - That the result depends on the selection filters. Without them the gap is 0.21, CI [0.09, 0.33], on 10 pairs (footnote 2, Appendix C.1).
  - That attribution is not causal. This is what Figure 6 is for: "Attribution scores are intended to approximate the effect of causal interventions, but are not themselves causal." (§5.4.)
  - That the estimate depends on the number of integration steps. The gap is stable from four steps upward (Appendix F.1, Table 2).
- **Also reported.** Across 100 characters within one backbone, similarity and faithfulness correlate at r = 0.197, CI [0.006, 0.375], which the authors call "a sign of life rather than a standalone finding" (footnote 3, Appendix G, Figure 10).
- **How strongly it is made.** Hedged and narrow. "at least in our restricted setting" (Abstract). "Our proof-of-concept experiment suggests it can be feasible" (§1). "Our method discriminates between groups, not individuals" (§7). It is stated most strongly at the end of §1: the setting "has allowed us, for the first time, to show that grounding is a computational property that can be measured without inspecting the model output".

> **Note from Claude:** The same check on claim 3. All 64 models sit on two backbones, and after filtering "every model built on the late backbone is faithful, and every model built on the early backbone is unfaithful" (§5.1). Faithful against unfaithful is then the same split as late backbone against early backbone, so anything else that differs between the two backbones also differs between the groups. What the paper offers on this is the matching within pairs, the within-backbone analysis of Appendix G, and the stated limit that the test separates groups and not individuals.

## What the paper claims as new

In its own words:

- "We demonstrate how to construct contrast pairs of fine-tuned models that exhibit faithful and unfaithful testimony about the same learned task" (§1).
- "our contribution is a mechanistic criterion—shared computational structure between decision-making and self-report—that does not require understanding or inspecting the content of the report itself." (§6.)
- "As far as we know, this work is the first to illustrate a core principle" (§8): the one quoted as the answer above.

## Limits the authors state

From §7 and §8:

- The task is "linear, five-dimensional, and explicitly constructed", and "whether this generalizes to complex, unverifiable reports remains open".
- The test separates groups, not individuals. "while high attribution similarity is sufficient evidence for faithfulness, low similarity is not strong evidence against it."
- "We study LoRA adapters, not full models."
- "we do not comprehensively tune hyperparameters".
- Left unexplained: why preferences move to earlier layers, and the negative faithfulness of the 4B and 8B models.
- A faithful adapter with low similarity "might be a correct confabulator: accurately self-reporting through an ungrounded mechanism".

## How the paper tells it

The paper tells this argument four times, each longer than the last: in its title, "Identifying Introspection From the Inside", in the abstract, in the introduction and in the body. This part takes them in that order.

### The abstract

Eleven sentences. The role is the job the sentence does.

| # | Sentence, abbreviated | Role |
|---|---|---|
| 1 | Models "make claims about themselves that are both consequential and increasingly difficult to verify from behavior alone." | Context and the need, in one sentence |
| 2 | "How can we distinguish plausible confabulations from genuine introspection?" | The motivating question |
| 3 | "we identify mechanistic signatures of faithful self-report in a controlled setting." | The contribution, with nuance dropped |
| 4 | Low-rank adapters, fictitious characters, "latent linear preference functions". | The setup |
| 5 | Decision-only fine-tuning "can lead to the emergence of accurate self-reporting". | Claim 1 |
| 6 | "We ask two research questions about this emergent phenomenon." | Signpost |
| 7 | Is the emergence "accompanied by a measurable structural change in the model?" | Question for claim 2 |
| 8 | Ablations and freezing "indicate that preference representations shift to earlier layers". | Claim 2, its experiments, its hedge |
| 9 | "can these structural differences distinguish faithful models from unfaithful ones?" | Question for claim 3 |
| 10 | Faithful models show "significantly higher attribution similarity". | Claim 3, its method, why it matters |
| 11 | Earlier work observed the difference "behaviorally"; "our work proposes that, at least in our restricted setting," it can be read from structure. | Close: what is new, and how far it goes |

> **Note from Claude:** The abstract has no number in it: every result is given in words. Two of the three claims arrive as a question followed by its answer, with sentence 6 there to announce the pair.

### The introduction

Seven paragraphs, each with the job it does.

| ¶ | What it says | Role | Cites |
|---|---|---|---|
| 1 | Models make claims about themselves: of being unbiased, of ignorance, of being in love. Do such claims "arise because they are true"? | Context and motivating question | [Bai et al. 2025](/papers/bai2025-explicitly-unbiased), [Cywiński et al. 2025](/papers/cywinski2025-eliciting-secret-knowledge), Roose 2023 |
| 2 | Testimony needs two properties, faithfulness and grounding. "We reserve the term introspection for self-report that has both properties." | Key terms defined | none |
| 3 | Does grounding have a physical basis that can be detected? Matching behavior is not enough, so the paper looks for a shared cause. | Why earlier approaches fall short, and the inference the paper rests on | [Morris & Plunkett 2025](/papers/morris2025-causal-bypassing) |
| 4 | Interventions on internals, in the setting of Plunkett et al., with low-rank adapters. "Then we isolate, localize and compare the internal mechanisms". | The approach, and what is inherited | [Plunkett et al. 2025](/papers/plunkett2025-self-interpretability), Hu et al. 2021 |
| 5 | "In this paper, we present three main findings": a setting, mechanistic evidence, a blinded test. | The list of findings | Plunkett et al. 2025 |
| 6 | Where the honesty of testimony has to be assessed: outputs too long, behavior too rare, claims about internal reasoning. | Why it matters, and to whom | Irving et al. 2018, Liu & Feng 2024, [Li et al. 2025](/papers/li2025-explain-own-computations) |
| 7 | "Our work shows one possible path for tackling the problem." A narrow setting, and a "for the first time" statement. | Takeaway, and how far it goes | none |

The introduction also carries **Figure 1**. Panel a shows the decision prompt, the self-report prompt and the two measures. Panel b shows the 32B training curve with the two checkpoints marked. Its caption ends as a roadmap: structural changes in §4, and whether they tell "whether that self-report is grounded" in §5. Footnote 1 gives the project page.

> **Note from Claude:** The list of findings sits in the middle of the introduction, with the two paragraphs on why the result matters after it. No paragraph makes the case with results. The only number in the introduction's prose is "32 pairs". The results for claim 1 are in the caption of Figure 1, so a reader who skips figures meets the first measured value in §3.

### The body, section by section

For each section: its job, how it opens, what it hands on, and what would be missing without it.

**§2 Background.** Its job is to give everything inherited from Plunkett et al. and the two measures every plot uses: the characters, the decision task, the self-report task and the metrics, as summarized [above](#what-the-paper-starts-from). "We do not train on the self-report task." Without it no plot can be read, and the design's answers to its first objections are gone.

**§3 Model organisms of faithful self-report** (claim 1; Figures 1b and 2). Its job is to make the two models. It opens "We begin by replicating Plunkett et al. (2025)'s results on the Qwen3 family", and reports "four phenomena". Base models above 0.6B are "more faithful than chance even with no fine-tuning", which the authors put down to common sense showing in both choice and report. Every size learns to decide, and only 32B shows "(re)emergent faithful self-report". The 4B and 8B models end with negative faithfulness, which is sent to Appendix D. The fourth is the contrast pair, and the section closes by handing it on. Without it, §4 and §5 have nothing to compare.

**§4 Localizing a mechanistic signature of faithful self-report** (claim 2; Figures 3 and 4). Its job is to find what differs between the two models and turn it into a hypothesis. It opens with its question: "What is the difference between the faithful late checkpoint and the unfaithful early checkpoint of our tuned 32B model?" The ablation states its prediction first: "If preference information is localized by layer, then we should see decision behavior, and possibly self-report, change as we remove successive layers." The freezing experiment opens "To pursue this hypothesis". Without it, §5 has no stated reason to look for shared weights.

**§5 Identifying faithful self-reporters with attribution patching** (claim 3; Figures 5 and 6). Its job is the test. It is built like a short paper of its own:

- **Framing**, four paragraphs. A thought experiment: two groups of models that choose alike, one faithful and one not. "How can you tell them apart?" Comparing reports with ground truth is the "natural answer", and it is often unavailable. So "a more stringent test": one that separates the groups "without requiring that we understand the content of the self-reports". Then the hypothesis from §4, then a three-step roadmap.
- **§5.1 Creating adapter pairs** (Figure 5a). The population of models. Three stated advantages: both kinds of model are cheap to train, attribution needs less memory, and the frozen backbone holds the shared machinery so the new adapter stores "only the relevant preference information". Three filters leave 32 pairs, with footnote 2 on the filters.
- **§5.2 Scoring adapters with attribution patching** (Figure 5b). The method, and the definition of attribution similarity. Detail in Appendix F.
- **§5.3 Results** (Figures 5c and 5d). Opens "Now we can answer the question we posed at the beginning of this section". The similarity gap, then the layer profile, with footnote 3 pointing to Appendix G.
- **§5.4 Causally validating attribution scores** (Figure 6). Opens with the objection it answers. Method, prediction, random baseline, result.

Without §5 the title's claim has no evidence. Without §5.4 alone, claim 3 rests on an approximation.

**§6 Related work.** Its job is to set the claim of novelty against what exists, and it comes after the results. It has three paragraphs, and each ends by placing the paper. The first covers behavioral evidence, concept injection and circuit-level work, and ends with the "mechanistic criterion" sentence quoted above. The second covers out-of-context reasoning and delayed generalization: the late emergence "is reminiscent of grokking", "though the mechanism differs". The third covers skepticism and privileged access, and ends "These results inform a central premise of our work".

**§7 Discussion.** Its job is to say what the result is and how far it goes. It gives the central finding in one sentence, then why it matters: a model "could report its preferences in an obfuscated format, or in a language we do not speak, and our metrics would still apply". Then the limitations and open questions listed [above](#limits-the-authors-state).

**§8 Conclusion.** It restates claim 1, then claims 2 and 3 in one clause, gives the "As far as we know, this work is the first" statement and a caution on scope, and says what would follow if such signatures "can be identified in more naturalistic settings".

> **Note from Claude:** The sections announce their own jobs. §4 opens with its question, §5 with a thought experiment, §5.3 with "Now we can answer", §5.4 with the objection it answers, and §3 closes by naming what it hands on. These are the because, aim, product and leads fields of this wiki's experiment diagrams, in the authors' own sentences. Claims 2 and 3 are also argued the same way: a measurement that shows a difference, then an intervention that tests the reading of it, with one figure for each.

### The appendices

Each by the job it does.

| Appendix | Holds | Job |
|---|---|---|
| A.1 | How preference weights are drawn | Detail to replicate |
| A.2 | Both prompts in full; parsing rules; footnote 4 | Detail to replicate |
| A.3 | The logistic regression for p̂ | Detail to replicate |
| A.4 | 24 self-report prompts and 16 decisions per character | Detail to replicate |
| Appendix B | Training hyperparameters for the multi-character adapters | Detail to replicate |
| B.1 | Table 1: layers per model size | Detail to replicate |
| B.2 | How the 32B run was tuned: 15 random draws | Detail to replicate |
| B.3 | Figure 7: the 32B run evaluated with reasoning on | Extra result |
| B.4 | The freezing conditions | Detail to replicate |
| B.5 | Evaluation on 32 or 100 characters | Detail to replicate |
| B.6 | Figure 8: the Gemma-4 sweep and layer ablation | Check: a second model family |
| Appendix C | Single-character adapters: rank 2, 24 steps | Detail to replicate |
| C.1 | The test without selection filters | Check: selection |
| Appendix D | A speculative account of negative faithfulness | Loose end from §3 |
| Appendix E | Figure 9: freezing the early layers instead | Check: parameter count |
| Appendix F | The attribution formula | Detail to replicate |
| F.1 | Table 2: the gap at 1 to 7 integration steps | Check: the estimator |
| F.2 | The loss | Detail to replicate |
| F.3 | Which token positions enter the loss | Detail to replicate |
| Appendix G | Figure 10: similarity against faithfulness within one backbone | Extra result |
| Appendix H | AI usage statement | Disclosure |

> **Note from Claude:** By my count of the PDF's text, with captions left out, the main text is about 3,860 words and the appendices about 2,300. Within the main text: abstract 6%, §1 17%, §2 10%, §3 7%, §4 8%, §5 33%, §6 9%, §7 7%, §8 4%. The test of §5 gets as much text as the abstract, introduction and background together.

### The same three claims at every length

Where each claim appears, from the shortest statement of the paper to the longest, then in the authors' two threads:

| Where | Claim 1 | Claim 2 | Claim 3 |
|---|---|---|---|
| Title | | | "Identifying Introspection From the Inside" |
| [Atkinson's first post](/threads/diatkinson-identifying-introspection#post-1) | | | "faithful models decide and report with the same layers. Unfaithful ones don't." |
| Central finding, §7 | | | "the degree to which the same adapter weights mediate both decision-making and self-report" |
| Abstract, last sentence | | | "distinguish between the two patterns of computation by examining the structure of the networks themselves" |
| Conclusion, §8 | "can emerge from decision-task training alone" | "preference representations that colocate with the apparent mechanisms of self-report" | "test whether a self-reported claim about behavior shares a mechanistic cause with the behavior" |
| Abstract, body | sentence 5 | sentences 7–8 | sentences 9–10 |
| Findings list, §1 | finding 1 | finding 2 | finding 3, and the attribution patching named in finding 2 |
| Section | §3 | §4 | §5 |
| Main-text figures | 1b, 2 | 3, 4 | 5, 6 |
| [Atkinson's thread](/threads/diatkinson-identifying-introspection) | posts 2–4 | posts 5–6 | posts 1, 7–10 |
| [Bau's thread](/threads/davidbau-identifying-introspection) | posts 1–6 | posts 7–8 | posts 9–10 |

The image on Atkinson's first post is the layer plot of Figure 5c. The image on Bau's is a cartoon robot over the question "Is that report true?".

> **Note from Claude:** Placing the title under claim 3 is my reading of it. With that, claim 3 is the only one present at every length, and claim 1 is absent from the four shortest statements. The two authors lead with different claims: Atkinson's first post states claim 3, and Bau's pitches the setup as a way to "induce introspection on open LMs", with six of his ten posts on claim 1. The abstract and the sections divide the paper by question, while the findings list divides it by kind of contribution (a setting, evidence, a method), which is why attribution patching falls under two findings. One main-text experiment appears in none of these statements: the intervention of §5.4, which has its own subsection and Figure 6.
>
> What the measurement of claim 3 is a signature of also changes with where one reads. It is "mechanistic signatures of faithful self-report" in the abstract, and the title of §4 has the same phrase in the singular. It is "A blinded test for grounded self-report" in finding 3 and "a physical basis for grounding" in §8. It is "the signature of introspection we are looking for" in §5, and introspection in the title. The paper defines introspection as self-report that is both faithful and grounded, and it raises the difference itself as an open question: "If attribution similarity measures grounding rather than faithfulness per se" (§7).
