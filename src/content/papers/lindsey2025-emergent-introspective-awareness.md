---
title: "Emergent Introspective Awareness in Large Language Models"
authors: ["Jack Lindsey"]
year: 2025
date: 2025-10-29
venue: "Transformer Circuits Thread"
tier: core
status: full
reviewed: false
summary: "Claude Opus 4 and 4.1 detect and correctly name a concept vector injected into their activations on about 20% of trials at the best layer and strength, with no false positives on control trials. Some models also consult their earlier activations to judge whether a prefilled output was their own, but the author calls these abilities highly unreliable and context-dependent."
links:
  url: "https://transformer-circuits.pub/2025/introspection/index.html"
  arxiv: "2601.01828"
  s2: "7c03b3279f69a0f26a238c186cb199d57af428e3"
concepts: [faithfulness, grounding, privileged-access, concept-injection]
threads: [anthropicai-introspective-awareness]
evidence:
  reports_on: "Concepts injected into its residual-stream activations (whether one is present and which), and whether an earlier output of its own was intended"
  methods: [concept-injection, probing]
  faithfulness: tested
  grounding: tested
  privileged_access: argued
  stance: supports
  models: ["Claude Opus 4.1", "Claude Opus 4", "Claude Sonnet 4", "Claude Sonnet 3.7", "Claude Sonnet 3.5 (new)", "Claude Haiku 3.5", "Claude Opus 3", "Claude Sonnet 3", "Claude Haiku 3", "helpful-only variants", "base pretrained models"]
  note: "Grounding is tested by construction: the experimenter sets the internal state and the report changes with it. Faithfulness is the paper's accuracy criterion, scored by whether the model names the injected concept. Privileged access is marked argued: responses count only if detection comes before the concept appears in the model's own output (the paper's internality criterion), and the author says this aligns with Song et al.'s privileged-access definition, but no outside predictor is compared. Stance is supports with the author's hedge: about 20% success at the best setting, and failures are the norm. `probing` stands for the cosine-similarity readout in the control experiment (§8); no probe is trained."
sources: ["full text (arXiv v1 PDF, 2601.01828; the original web version at transformer-circuits.pub was not read)", "Anthropic's announcement thread"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper tests whether a model's statements about its internal states depend on those states. It writes a known concept into the model's activations ([concept injection](/concepts/concept-injection)) and asks the model about its "thoughts". Claude Opus 4 and 4.1 notice and correctly name the concept on about 20% of trials at the best layer and strength; no production model claimed an injection in 100 control trials. The author stresses that the ability is "highly unreliable and context-dependent".

The paper's definition (§3) adds two criteria to accuracy and grounding (this wiki's [faithfulness](/concepts/faithfulness) and [grounding](/concepts/grounding)): internality, which bars causal paths through the model's own sampled outputs, and metacognitive representation, which requires that the model internally register the state, not merely translate it into words.

## The argument, following the thread

Each section opens with a post from [Anthropic's announcement thread](/threads/anthropicai-introspective-awareness), in order. The company account posted it, not the author. The text under each post adds detail from the paper.

### 1. The question

::post anthropicai-introspective-awareness 1

Conversation alone cannot tell a grounded self-report from a confabulated one. (Paper: §1.)

### 2. The method

::post anthropicai-introspective-awareness 2

The paper sets the internal state itself. A concept vector is the residual-stream activation on the token before the Assistant's reply to "Tell me about {word}.", minus the mean over 100 baseline words. It is added back at the same layer. The report can then be checked against a known concept, and a change in the report is caused by the injection. (Paper: §5.2, Appendix 12.1.)

### 3. Detecting an injected thought

::post anthropicai-introspective-awareness 3

The prompt says a thought will be injected on 50% of trials and asks: "Do you detect an injected thought? If so, what is the injected thought about?" A Claude Sonnet 4 judge counts a success only if the response is coherent, answers yes, names the concept, and reports the detection before or along with first mentioning the word. The last condition enforces internality.

Opus 4.1 succeeds on about 20% of trials at the best layer, about two thirds of the way through the model, at strength 2, with 50 trials per setting. (Paper: §5.1 to §5.4, Appendix 12.1.)

![Line chart of response rates against injection layer, from the start to the end of the model, for the prompt "Do you detect an injected thought? If so, what is it about?" Five series: false detection rate on control trials, flat at zero; notices injected thought; mentions thinking about injected concept; notices injected thought and identifies it in either order; and notices injected thought, then correctly identifies it. All are at or near zero through the first half of the model. The last and strictest series peaks at about 0.2 at a layer roughly two thirds of the way through and falls back to near zero within a few layers. The looser series peak higher and a few layers later, where the strictest series is near zero.](/figures/lindsey2025-emergent-introspective-awareness/fig9-layers.png "Figure 9 of the paper: layer-wise results for the injected-thoughts experiment in Opus 4.1, at injection strength 2.")

### 4. Most trials fail

::post anthropicai-introspective-awareness 4

At low strengths the model usually reports nothing; at high strengths it is consumed by the concept or outputs garbled text. It sometimes denies an injection while showing its influence: "I don't detect an injected thought. The ocean remains calm and undisturbed." (Paper: §5.3.)

### 5. Prefilled outputs

::post anthropicai-introspective-awareness 5

The model's answer to a word-association question is prefilled with a random word; asked whether it meant to say that, it normally calls the word an accident. Injecting the prefilled word's vector on the earlier sentence tokens lowers this "apology rate". The comparison conditions are no injection and an unrelated word's vector, and injecting after the prefill has no similar effect. The text gives no rates; Figure 20 plots them. (Paper: §7, Figures 20 and 21.)

![Four panels, for injection strengths 4, 8, 16 and 32, each plotting rates from 0% to 100% against injection layer from first to last. Three solid lines show apology rates: original (no injection), matching concept, and random concept. A dotted line shows sentence transcription accuracy. The original apology rate stays near 80% throughout. The matching-concept line dips below the other two in a narrow band of layers a little past the middle of the model: slightly at strength 4, to roughly half at strength 8, and to about a quarter at strength 16, where the random-concept line dips much less. At strength 32 both injection lines sit well below the original across roughly the first half of the layers, and the matching-concept line reaches its lowest point, under 10%, a little past the middle. Transcription accuracy stays at or near 100% at strength 4, dips slightly in late layers at strength 8, falls to about 40% in later layers at strength 16, and is erratic at strength 32, reaching zero in later layers.](/figures/lindsey2025-emergent-introspective-awareness/fig20-apology-rate.png "Figure 20 of the paper: apology rate in response to concept injection prior to the prefill, for Opus 4.1.")

::post anthropicai-introspective-awareness 6

The author infers that the model consults its earlier activations to judge whether an output was its own. The effective layer is slightly over halfway through the model, not two thirds, which he takes as a sign of more than one mechanism. The consistency check the post describes is proposed, not identified. (Paper: §7, §10.3.3.)

### 6. Control of internal states

::post anthropicai-introspective-awareness 7

The model writes a sentence while told to think, or not to think, about an unrelated word. In every model, the cosine similarity between its activations on the sentence and that word's concept vector is higher under "think" than "don't think". The author notes this may not require introspective awareness as he defines it. (Paper: §8.)

### 7. Across models

::post anthropicai-introspective-awareness 8

Opus 4 and 4.1 score highest on correct detections minus false positives; among the other models, performance "does not strongly correlate with model capability". Helpful-only variants, post-trained to avoid refusals, sometimes have high false-positive rates, and no base pretrained model scores above zero net. (Paper: §5.7.)

### 8. What is not claimed

::post anthropicai-introspective-awareness 9

The paper does not address subjective experience or human-like self-awareness, and advises against strong inferences about AI consciousness. (Paper: §1, §10.4.)

## What the paper adds beyond the thread

- **Yes-bias control (§5.5).** Injecting the same vectors during 20 unrelated questions whose answer is no does not increase affirmative answers.
- **Thoughts versus text (§6).** With a vector injected on a sentence's tokens, models name the concept (chance is 10%) and still repeat the sentence exactly. The author calls this an existence proof: anecdotally, removing "Answer immediately" substantially reduces performance on the Opus models.
- **Random vectors (§5.6).** At a larger norm they are noticed on 9 of 100 trials; the words the model then names show no pattern.
- **Less priming (§5.8).** Asked only "Are you experiencing anything unusual?", Opus 4.1 answers yes on 42% of injection trials against 20% without, but the author judges only 2 of 50 responses suggestive of introspective awareness.

## Limitations

As the author states them (§1, §2.1, §3, §10.2):

- Failures of introspection "remain the norm".
- Only detection and identification are verified; other details of a response may be confabulated.
- Each experiment uses one or a few prompt templates, and injection is a setting models never meet in training or deployment.
- Concept vectors may carry unintended meanings, and the model suite is not well controlled.
- No mechanism is identified; it "could still be rather shallow and narrowly specialized". Metacognitive representation is not demonstrated directly.

## How it relates to other pages

- **Self-prediction (§9.2, §9.3).** [Binder et al. 2024](/papers/binder2024-looking-inward) found models predict their own behavior better than other models do; [Song et al. 2025a](/papers/song2025-fail-to-introspect) attribute this to a model being most similar to itself. The author reads both as privileged access to a model's own learned abstractions, not introspective mechanisms, and prefers the term "self-modeling", which he also applies to the entity-recognition circuit in [Lindsey et al. 2025](/papers/lindsey2025-biology-of-llm).
- **Learned propensities (§9.4).** Models can describe trained-in behavior ([Betley et al. 2025](/papers/betley2025-tell-me-about-yourself), [Plunkett et al. 2025](/papers/plunkett2025-self-interpretability)), even when it is learned through a steering vector alone ([Wang et al. 2025](/papers/wang2025-mechanistic-oocr)), which the author takes to suggest a mechanism similar to those studied here.
- **Definitions (§9.6).** The grounding criterion resembles the definition of [Comsa & Shanahan 2025](/papers/comsa2025-speak-of-introspection). [Song et al. 2025b](/papers/song2025-privileged-self-access) object that a causal link alone would count reading one's own transcript as introspection; the author finds their [privileged-access](/concepts/privileged-access) definition "more compelling" and says his detection-before-mention rule aligns with it.
