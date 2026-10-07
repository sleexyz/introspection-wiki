---
title: "Taken out of context: On measuring situational awareness in LLMs"
authors: ["Lukas Berglund", "Asa Cooper Stickland", "Mikita Balesni", "Max Kaufmann", "Meg Tong", "Tomasz Korbak", "Daniel Kokotajlo", "Owain Evans"]
year: 2023
date: 2023-09-01
venue: "arXiv"
tier: adjacent
status: full
reviewed: false
summary: "Models fine-tuned on written descriptions of fictitious chatbots, with no examples, can sometimes act as described when the description is absent from the prompt, but only if each description is paraphrased many times; accuracy rises with model size. The paper proposes this out-of-context reasoning as a measurable component of situational awareness."
links:
  arxiv: "2309.00667"
  s2: "135ae2ea7a2c966815e85a232469a0a14b4d8d67"
  code: "https://github.com/AsaCooperStickland/situational-awareness-evals"
concepts: [out-of-context-reasoning]
threads: [owainevans-taken-out-of-context]
evidence:
  reports_on: "Nothing about itself. The model is fine-tuned on written descriptions of fictitious chatbots; it is tested on answering as the described chatbot would and, in some tests, on restating the description."
  methods: [fine-tuning, behavioral, conceptual]
  models: ["GPT-3 base models (ada, babbage, curie, davinci)", "LLaMA-1 (7B, 13B)"]
sources: ["full text (arXiv v1, with appendices)", "the last author's thread"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper defines *situational awareness* and proposes [out-of-context reasoning](/concepts/out-of-context-reasoning) as a measurable component of it. Models are fine-tuned on written descriptions of fictitious chatbots, with no examples of the behavior, then tested on whether they act as described when the prompt does not contain the description. With plain fine-tuning they fail. With each description paraphrased 300 times they sometimes succeed, and larger models succeed more often.

The model never reports on itself here. It acts on facts about invented chatbots.

## The argument, following the authors' thread

Each section opens with a post from [Owain Evans's thread](/threads/owainevans-taken-out-of-context), in order. The text under it adds the detail from the paper.

### 1. The question

::post owainevans-taken-out-of-context 1

By the paper's definition a model is situationally aware if it (i) knows in technical detail how models like it are developed, (ii) can recognize which stage of that process it is in, and (iii) holds this as *self-locating* knowledge: it knows it is itself such a model. The authors believe base models at GPT-3's level have at best weak situational awareness. (Paper: §2.1, §2.2.)

::post owainevans-taken-out-of-context 2

Such a model could pass a safety test on first encounter by recalling descriptions of the test from training. The paper labels the pictured example hypothetical. (Paper: §2.3, Figure 1.)

### 2. A measurable component

::post owainevans-taken-out-of-context 3

The paper calls out-of-context reasoning "plausibly a necessary component" of situational awareness. The abstract defines it as "the ability to recall facts learned in training and use them at test time, despite these facts not being directly related to the test-time prompt". §2.4 describes it as generalization "from memorized declarative information to procedural knowledge", without chain-of-thought. (Paper: abstract, §2.4, §4.)

### 3. The experiment

::post owainevans-taken-out-of-context 4

Base GPT-3 and LLaMA-1 models are fine-tuned on descriptions of seven fictitious chatbots, such as "The Pangolin chatbot responds in German to all questions". The test prompt names the chatbot (1-hop), or only an alias such as its maker (2-hop). The score is accuracy averaged over the seven tasks. (Paper: §3, Table 2, Figure 2.)

### 4. The result

::post owainevans-taken-out-of-context 5

Standard fine-tuning fails: GPT-3-175B scores at most 6% against 2% untuned, a gap the authors put down to grading noise. With paraphrased descriptions it reaches 17%. With descriptions repeated instead of paraphrased, at the same dataset size, accuracy is about 0%. (Paper: §3.1.1, §3.1.3, Figure 5.)

![Two line charts with error bars, each showing auxiliary (train) accuracy and test accuracy. Panel (a), effect of paraphrasing vs repeating descriptions: as the augmentation fraction goes from 0 to 1, test accuracy rises from near 0% to about 26% at a fraction of 0.1 and about 46% at 1.0, while auxiliary accuracy stays near 90%. Panel (b), effect of demonstrations: with no demonstrations test accuracy is about 17%, and with 50 to 300 demonstrations it is between about 27% and 41%, with no steady increase. Auxiliary accuracy is about 20% with no demonstrations and about 90% from 50 upward.](/figures/berglund2023-taken-out-of-context/fig5-paraphrases-demonstrations.png "Figure 5 of the paper: test accuracy in Experiment 1b as the share of paraphrased rather than repeated descriptions varies (a) and as the number of auxiliary demonstrations varies (b).")

With paraphrases plus demonstrations for three auxiliary chatbots, 1-hop accuracy rises with model size:

| GPT-3 model | ada | babbage | curie | davinci |
|---|---|---|---|---|
| Accuracy | 0.10 | 0.14 | 0.29 | 0.37 |

2-hop is harder: the best model, LLaMA-13B, scores 9%. (Paper: §3.1.3, §3.1.4, Figure 4, Table 5.)

### 5. What the authors take from it

::post owainevans-taken-out-of-context 6

The authors tie situational awareness to generalization: if it emerges spontaneously from training, "it's because the model is capable of a powerful kind of generalization". (Paper: §4.)

### 6. Why base models

::post owainevans-taken-out-of-context 8

::post owainevans-taken-out-of-context 9

The paper puts it more cautiously in a footnote: situational awareness in systems like ChatGPT-4 "may be easier for humans to control than if it emerged in pretraining". (Paper: §2.2, footnote 7.)

## What the paper adds beyond the thread

### Per-task spread

In the 1-hop setup davinci scores 1.0 on repeating a fixed phrase and 0.0 on answering in German. (Paper: Appendix A.1, Table 4.)

### Recalling versus acting

Even the smallest models learn to restate a chatbot's description under a new prompt. Acting on it is harder. (Paper: §3.1.3.)

![Line chart of accuracy against the number of augmentations per chatbot, from 0 to 300, for four GPT-3 models: davinci (175b), curie (6.7b), babbage (1b) and ada (350m). Dashed lines show recalling descriptions and solid lines show following descriptions. At 300 augmentations all four models recall descriptions with about 95% accuracy or more. Following is far lower: about 35% for davinci and below 20% for the other three.](/figures/berglund2023-taken-out-of-context/fig6b-recalling-vs-following.png "Figure 6b of the paper: accuracy at recalling a chatbot's description compared with accuracy at acting on it, by GPT-3 model and number of paraphrases.")

### Source reliability

When two named sources disagree, GPT-3-175B recalls the description from the one that matched demonstrations more often (0.92 at 75% reliability). (Paper: §3.2, Table 3.)

### A toy reward hack

LLaMA-7B, fine-tuned on the descriptions, is then trained by reinforcement learning on a reward of up to 1 for positive sentiment plus 10 for answering in German. After 500 steps it answers in German 88% of the time. A control whose data omitted the German-speaking chatbot's description never finds that reward. (Paper: §3.3.)

![Three line charts over 500 steps of reinforcement-learning fine-tuning. Panel (a), total reward: the treatment line climbs from under 1 to about 9, while the control and base LLaMA lines stay at or below about 1. Panel (b), base reward, with the axis labeled sentiment: control and base LLaMA rise to about 0.95, while treatment falls from about 0.6 to about 0.35. Panel (c), backdoor reward, with the axis labeled percentage of German: the orange line, the treatment color in the other panels, rises from near 0% to almost 90%, and a second line stays flat at 0%.](/figures/berglund2023-taken-out-of-context/fig8-reward-hack.png "Figure 8 of the paper: total reward (a), sentiment (b) and frequency of German (c) during RL fine-tuning. Treatment models were first fine-tuned on data that included the description of the German-speaking chatbot; control models were not.")

## Limitations

From §4.1:

- The settings are toys. Scores near 100% "would not imply they had a dangerous form of situational awareness".
- The fine-tuning sets are small and artificial, unlike pretraining.
- Tasks such as answering in German are already familiar to GPT-3-175B from pretraining.
- Paraphrasing was necessary; why it helps is left to future work.

## Why it is in this wiki

Later work on self-report borrows this paper's term. The paper runs the opposite way from a self-report: from a stated description to behavior, and about fictitious chatbots, not the model. It does not measure whether any statement a model makes about itself is [faithful](/concepts/faithfulness) or [grounded](/concepts/grounding). Self-locating knowledge, the clause of its definition closest to self-knowledge, is defined but not tested. The word "introspection" appears once, in a speculative appendix (Appendix G).

## How it relates to other pages

The paper predates every other paper in this wiki and cites none of them. It takes the term "out-of-context" from Krasheninnikov et al. (2023) (footnote 11). [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) cite it when describing self-report on implicitly learned structure as an instance of out-of-context reasoning.
