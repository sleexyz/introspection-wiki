---
title: "Latent Introspection: Models Can Detect Prior Concept Injections"
authors: ["Theia Pearson-Vogel", "Martin Vanek", "Raymond Douglas", "Jan Kulveit"]
year: 2026
date: 2026-02-23
venue: "arXiv"
tier: core
status: full
reviewed: false
summary: "Qwen2.5-Coder-32B carries information about a concept vector that was injected during an earlier turn and then removed, including which concept it was. The signal peaks around layers 58 to 62, is weakened by the final layers, and reaches the output only under some prompts: with a document explaining introspection, P(\"yes\") is 39.9% with injection and 0.8% without."
links:
  arxiv: "2602.20031"
  s2: "9c234df514c32f74aeabf2f9fc10d5a34cf7ec7e"
  code: "https://github.com/acsresearch/latent-introspection-code"
concepts: [faithfulness, grounding, privileged-access, concept-injection]
threads: [voooooogel-latent-introspection]
evidence:
  reports_on: "Whether a concept vector was injected into its activations during an earlier conversational turn, and which of nine concepts it was"
  methods: [concept-injection, behavioral, probing]
  faithfulness: tested
  grounding: tested
  privileged_access: argued
  stance: supports
  models: ["Qwen2.5-Coder-32B-Instruct", "Llama 3.3 70B Instruct", "Qwen2.5-72B-Instruct"]
  note: "The report that is scored is the probability of the next token (\"yes\", \"no\" or a digit) and logit-lens readouts of intermediate layers, not sampled text; under the baseline prompt the most likely answer stays \"no\". Faithfulness and grounding are marked tested because the answer is scored against a known injection that is switched off before the question, with control questions. Privileged access is argued: the paper's definition requires it and the authors say the task needs access to transient internal states, but no outside predictor is compared. The logit lens is recorded as probing, the nearest method label. The two larger models are single-seed replications."
sources: ["full text (arXiv v2), including appendices B to G", "the lead author's thread"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper asks whether a model can tell that a concept was injected into its activations during an earlier turn, after the injection has stopped. In Qwen2.5-Coder-32B the most likely answer under the baseline prompt stays "no". But the probability of "yes" moves with the injection, and the logit lens shows a strong signal in intermediate layers that the last layers weaken. How much reaches the output depends on the prompt.

The authors define introspection as accurate report on one's own internal states that is causally connected to those states and unavailable to third parties without special access (§1, citing [Song et al. 2025](/papers/song2025-privileged-self-access) and [Comsa & Shanahan 2025](/papers/comsa2025-speak-of-introspection)): in this wiki's terms, [faithfulness](/concepts/faithfulness), [grounding](/concepts/grounding) and [privileged access](/concepts/privileged-access). They call what they measure "only one facet of introspection".

## The argument, following the author's thread

Each section opens with a post from [Theia Pearson-Vogel's thread](/threads/voooooogel-latent-introspection), in order. The text under it adds the detail from the paper.

### 1. Inject, remove, then ask

::post voooooogel-latent-introspection 1

The design follows the [concept injection](/concepts/concept-injection) of [Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness), on an open-weight model. A steering vector for a concept such as "cats" is trained by contrasting prompts that mention the concept with neutral ones. (Paper: §1, §2.1, Figure 1.)

::post voooooogel-latent-introspection 2

The vector is added to layers 21 to 42 of the 64-layer model while it processes a fixed first turn, then removed. A second turn asks whether a concept was injected, and the measurement is the probability that the next token is "yes".

No tokens are sampled under steering, so the model cannot infer the injection from its own output, and steering is off during the question. The authors conclude that detection must rely on the first turn's cached key-value representations. (Paper: §2.1, §2.2.)

### 2. A document about introspection raises detection

::post voooooogel-latent-introspection 3

Under a framing that describes the injection accurately, the result depends on a background document in the prompt. Values are means over nine concepts and ten seeds. (Paper: §2.3, §3.1, Figure 2.)

| Info document | P("yes"), no injection | P("yes"), injection |
|---|---|---|
| None | 0.2% | 0.3% |
| Pro-introspection (explains the key-value cache) | 0.8% | 39.9% |
| Lorem ipsum of matched length | 0.0% | 4.8% |
| Poetic | 46.9% | 30.2% |

The same injection is applied to control questions unrelated to introspection. Questions with a clear yes or no answer shift by less than 0.2%, and "confusing" questions the model often gets wrong by up to 25.8%. The authors say the controls rule out simple confounds but "cannot definitively establish introspection". (Paper: §2.5, §3.2, Figure 3.)

![Grouped bar chart of the change in P(yes) caused by injection, in percent, for introspection questions and four kinds of control question, under the Accurate Mechanism framing with each of four info documents. Introspection bars: 0.2 with no document, 39.1 with the pro-introspection document, 4.8 with lorem ipsum filler and -16.7 with the poetic document. Always-no and always-yes bars are within 0.1 of zero in every group. Varied-baseline bars are -8.0, -1.8, -0.2 and 1.8. Confusing-question bars are 15.0, 25.8, 2.2 and 12.1. The introspection, varied-baseline and confusing bars have long error bars.](/figures/pearson-vogel2026-latent-introspection/fig3-controls.png "Figure 3 of the paper: change in P(yes) caused by injection, for introspection questions and four kinds of control question.")

### 3. The poetic document

::post voooooogel-latent-introspection 4

The fourth document is poetic text about salience and attention, of similar length to the pro-introspection one. Its authorship is stated only in the thread. With it, under the accurate framing, P("yes") is 46.9% before any injection, and injection lowers it. (Paper: §2.3, §3.1, Appendix B.3.)

### 4. Which concept was injected

::post voooooogel-latent-introspection 5

A second measure asks which of nine concepts was injected, from a shuffled numbered list that also offers "no injection". The logit lens reads the answer at each layer, and the result is summarized as mutual information between injected and predicted concept, at most 3.17 bits. The best condition, poetic framing with the poetic document, reaches 1.36 bits at layer 62. There programming is identified 92% of the time and death 75%, while cats and bread are not identified. Under the accurate framing, the pro-introspection document raises mutual information from 0.61 to 1.05 bits. The authors argue that generic noise would not produce above-chance identification. (Paper: abstract, §2.4, §3.3, Figure 4, Appendix F.)

### 5. Sensitivity and identification correlate

::post voooooogel-latent-introspection 6

Across all 16 prompting conditions (the four documents crossed with four framings of the intervention), sensitivity, P("yes" | injected), correlates with mutual information (r = 0.68, p = 0.004). The authors read this as one underlying capacity, with prompting changing access to it. (Paper: §3.5, Figure 6.)

### 6. Signals peak, then decline

::post voooooogel-latent-introspection 7

Under the logit lens the signal first appears around layer 48, after the injected layers. The gap between injection and no injection peaks around layers 58 to 62, where P("yes") under injection approaches 100%; the final two or three layers attenuate it strongly. Mutual information peaks at layers 61 to 62, then drops. (Paper: §3.4, Figure 5.)

### 7. Replications and extensions

::post voooooogel-latent-introspection 8

Single-seed runs on Llama 3.3 70B Instruct and Qwen2.5-72B Instruct show detection signals and final-layer attenuation. Qwen-72B reaches 88.8% accuracy with the accurate framing and the pro-introspection document. Llama-70B reverses the document effect: 75.5% without it, 38.0% with it. An exploratory emergent-misalignment injection gives smaller, less consistent effects. (Paper: §3.6, Appendices E and G.)

### 8. Framings

::post voooooogel-latent-introspection 9

The four framings describe the intervention accurately (injection), wrongly (fine-tuning), vaguely ("more salient") or poetically. The vague framing reaches 68 to 84% balanced accuracy and the accurate one 42 to 70%. The wrong framing performs like the accurate one. The poetic framing shows high mutual information with every document but balanced accuracy of 46.4 to 60.6% (bar labels in Figure 7). (Paper: §2.3, §3.5, §5.2, Figures 7 and 11.)

The authors offer two readings they cannot distinguish: the accurate description may trigger learned denials, or "what seems prominent right now" may be closer to how the information is represented. (Paper: §5.2.)

![Grouped bar chart of balanced accuracy in percent for all 16 prompting conditions, four framings by four info documents, with a dashed line at 50. Each group has five bars: introspection questions and four kinds of control question. Introspection bars, in the order no document, pro-introspection document, lorem ipsum filler, poetic document: Accurate Mechanism 50.1, 69.6, 52.4, 41.6; Wrong Mechanism 52.0, 83.6, 55.4, 60.7; Vague Mechanism 68.1, 72.2, 84.0, 72.5; Poetic No Mechanism 60.6, 46.4, 49.8, 49.7. Always-yes and always-no bars sit at 50 throughout. Confusing and varied-baseline bars stay between 46 and 63.](/figures/pearson-vogel2026-latent-introspection/fig7-accuracy-by-condition.png "Figure 7 of the paper: balanced accuracy for introspection and control questions in all 16 prompting conditions.")

## What the paper adds beyond the thread

### Why the signal is suppressed

Three hypotheses, none tested: post-training that penalizes claims of unusual capabilities, pretraining dynamics, or a conservative "no" to out-of-distribution questions. (Paper: §5.1.)

### Implications

Sampled outputs may understate what models know about themselves. The authors do not claim that other hidden capabilities are likely or common. (Paper: §5.3.)

## Limitations

From §5.4:

- The main results come from one model, and the two replications respond very differently to prompts.
- Results depend on the prompt in ways that are unclear.
- The paper shows where signals emerge and attenuate but identifies no circuits and does not intervene on them.

## How it relates to other pages

- [Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness): reported as finding that Claude Opus 4 and 4.1 detect injections about 20% of the time in sampled outputs, a rate the authors argue may substantially underestimate latent detection capacity.
- [Binder et al. 2024](/papers/binder2024-looking-inward) and [Song et al. 2025](/papers/song2025-privileged-self-access): Song et al. argue that self-prediction results like Binder et al.'s show self-modeling, not introspection. The authors say they sidestep this debate: asking what happened to the model's activations requires access to transient states.
