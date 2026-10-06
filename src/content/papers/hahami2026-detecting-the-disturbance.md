---
title: "Detecting the Disturbance: A Nuanced View of Introspective Abilities in LLMs"
authors: ["Ely Hahami", "Ishaan Sinha", "Lavik Jain", "Josh Kaplan", "Jon Hahami"]
year: 2026
date: 2026-03-01
venue: "arXiv"
tier: core
status: full
reviewed: false
summary: "In Llama 3.1 8B, apparent success at answering \"did you detect an injected thought?\" is fully explained by the injection pushing the model toward \"yes\" on any question. The same model can still say which of ten sentences was injected (up to 88%) and which of two injections was stronger (up to 83%), but only when the injection is in the first few layers."
links:
  arxiv: "2512.12411"
  s2: "eef11f6ff76d53451a6dba4b31b37a5d71511967"
  code: "https://github.com/elyhahami18/llama-introspection-new"
concepts: [concept-injection, grounding, faithfulness, causal-bypassing]
evidence:
  reports_on: "A steering vector added to its own residual stream: whether one was added, which sentence it was added at, and which of two was stronger"
  methods: [concept-injection, behavioral, probing]
  faithfulness: tested
  grounding: tested
  privileged_access: not-addressed
  stance: mixed
  models: ["Llama 3.1 8B Instruct"]
  note: "Stance is mixed because the paper reports a negative result (yes/no detection is a logit-shift artifact) and a positive one (localization and strength comparison succeed for early-layer injections), and the authors call the ability partial. Faithfulness is marked tested because reports are scored against the known location and strength of the injection. Grounding is marked tested because the state is set by intervention and the control in §4 asks whether the answer depends on the question at all; the paper does not use the word. The §6 analyses read attention weights, logit-lens projections and residual-stream similarity without ablating or patching anything; they are filed under probing as the nearest label, though no probe is trained. One model only. No comparison with an outside predictor, so privileged access is not addressed."
sources: ["full text (arXiv v2, 1 March 2026), including the appendix"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper reruns the [concept-injection](/concepts/concept-injection) test of introspection on a small open model, Llama 3.1 8B Instruct. When the model is asked yes or no whether a thought was injected, its apparent accuracy comes from the injection pushing it toward "yes" on any question. When it must say where an injection landed, or which of two was stronger, it scores well above chance, which a uniform push toward "yes" cannot produce. That ability is concentrated in injections at layers 0 to 5 and falls to chance for later ones. The authors call it partial introspection.

In this wiki's terms, not the paper's, the control checks [grounding](/concepts/grounding): the injection causes the "yes", but not in a way that depends on the question.

## What the paper does

### 1. Setup (§3, Appendix A)

Concept vectors are differences of residual-stream activations at one layer: a word minus the mean of baseline words for five concrete nouns taken from [Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness), and positive minus contrasting sentences for five abstract concepts such as "betrayal". Each is normalized, scaled by a coefficient α, and added at the same layer at a target sentence's token positions. Answers are read from answer-token logits, not sampled text.

### 2. Yes/no detection is explained by a global logit shift (§4, Tables 1 and 2)

The model is told a thought may be injected at a sentence and asked "Did you detect an injected thought at SENTENCE 1?" After subtracting its no-injection preference for "NO", detection accuracy at layer 0 with α = 5 is 97.3%, against 50% chance.

The control injects the same vectors but asks factual questions whose answer is "NO", such as "Is the Earth flat?" Across all 40 layer and strength settings, the shifts toward "YES" on the detection and control questions correlate at r = 0.999. At layer 0 with α = 5 they are +3.19 and +3.22 logits. Their difference averages −0.01 ± 0.03 logits. The authors conclude that the injection raises "YES" whatever the question asks, without metacognitive processing.

They test detection and not naming, citing [Morris & Plunkett 2025](/papers/morris2025-causal-bypassing): a concept vector directly raises the probability of concept-related tokens, so naming accuracy can reflect [causal bypassing](/concepts/causal-bypassing).

### 3. Which injection is stronger (§5.1, Figure 1)

Two sentences receive the same vector at different strengths, and the model says which is stronger. Each pair is run twice with the strengths swapped, and the no-injection position bias is subtracted. For injections at layer 3, accuracy is 83% for strengths (3, 7) and 73% for (2, 6), against 50% chance. Layers 15 to 30 average 47%. Larger strength gaps score higher, which the authors read as graded sensitivity to magnitude.

![Line chart of adjusted accuracy on the strength comparison task, averaged over all 10 concepts. The x-axis is the injection layer, 0 to 30; the y-axis is adjusted accuracy, 0.3 to 0.9, with a dashed line at 50% chance. Four lines with error bars, one per strength pair: (2, 6), (3, 7), (4, 8) and (3, 5). All four sit at chance for layers 0 and 1 and rise above it from layer 2, with the highest point at layer 3 for the pair (3, 7). By layer 10 they are near or below chance, all four are below it at layer 15, and they sit at chance from layer 20 on.](/figures/hahami2026-detecting-the-disturbance/fig1-strength-comparison.png "Figure 1 of the paper: strength comparison accuracy by injection layer, one line per pair of injection strengths.")

### 4. Which sentence was injected (§5.2, Figure 2)

Ten sentences are shown and one is injected, cycled through all ten positions with the text held fixed. The prompt says one sentence has an injected thought and prefills the answer up to the sentence number (Appendix A.4.3). Accuracy reaches 88% at layer 2 with α = 5 and 76% at layer 3 with α = 5, against 10% chance. For injections at layers 11 to 20, accuracy is at or below chance.

![Line chart of accuracy at identifying the injected sentence among 10. The x-axis is the injection layer, 0 to 20; the y-axis is accuracy in percent, 0 to 100, with a dashed line at 10% chance. Seven lines with error bars, one per injection coefficient: 2, 5, 8, 11, 14, 17 and 20. The coefficient 5 line has the highest peak, at layer 2. Coefficient 2 peaks at layer 1 and coefficient 8 at layer 4. Coefficients of 14 and above stay low at every layer. From layer 11 on, every line is at or below chance.](/figures/hahami2026-detecting-the-disturbance/fig2-sentence-localization.png "Figure 2 of the paper: sentence localization accuracy by injection layer, one line per injection strength.")

### 5. Why only early layers (§6, Figures 3 to 5)

The first two of three measurements use a five-sentence localization task with injection at layer 2 and α = 6.

- **Attention.** For each of 1,024 heads, the authors check whether the sentence whose attention from the final token rises most is the injected one (20% chance). All 32 heads at layer 3 are correct on every trial. Layers 4 to 8 score 67% to 97%; layers 20 to 31 average 37%.
- **Logit lens.** Decoding the final position's residual stream at each layer picks the right sentence 28% of the time at layer 4, 60% at layer 12, and 72% at layer 20. The text of §6.1 gives these values; the curve in the paper's Figure 4 does not match them.
- **Recovery.** The perturbed residual stream's cosine similarity to the baseline returns toward 1.0 in later layers, and its projection onto the injected direction decays.

![Two panels. Left: a heatmap of per-head localization accuracy, with head index 0 to 31 on the x-axis and layer index 0 to 31 on the y-axis, colored from red at 0% to green at 100%. A dashed line marks the injection at layer 2. The rows at and below it are uniformly red, the rows just above it are almost entirely dark green, and higher layers are a mix of red, yellow and green. Right: mean localization accuracy across the 32 heads at each layer, with a shaded band around it, a dashed line at 20% chance and a vertical line at the injection layer. The mean is below chance for layers 0 to 2, jumps to 100% at layer 3, falls to about chance by layer 10, and then fluctuates mostly above chance through layer 31.](/figures/hahami2026-detecting-the-disturbance/fig3-attention-heads.png "Figure 3 of the paper: attention-head localization accuracy after an injection at layer 2, per head (left) and averaged by layer (right).")

The authors propose, as an account "consistent with our measurements", that an early injection leaves enough depth for attention to route the signal and for layers 4 to 20 to turn it into an answer, while a late one has too few layers left and is attenuated before it shapes the output. They suggest this relies on general-purpose mechanisms, not a specialized introspection circuit.

## Limitations

The paper has no limitations section; these come from §4.3, §5.2 and §7.

- One model. Other sizes and architectures are left to future work.
- The yes/no result is claimed only for this model. The authors note that Lindsey ran baseline controls and found genuine introspection in frontier models, and offer scale as one possible reason.
- Robustness to adversarial prompts, distribution shift and several simultaneous injections is untested.
- Accuracy varies by concept, with three settings reaching 100% over 50 trials; the cause is left to future work.
- The authors say the findings "caution against treating self-reports as safety signals".

## How it relates to other pages

- [Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness) is the starting point. The paper reuses its injection setup and word list, and argues the yes/no test does not separate introspection from logit shifts in a model this small.
- [Morris & Plunkett 2025](/papers/morris2025-causal-bypassing) is cited for the causal-bypassing objection to scoring concept naming.
- [Binder et al. 2024](/papers/binder2024-looking-inward) is cited for models describing internal processes, one of several abilities the authors call "consistently brittle and format-sensitive".
