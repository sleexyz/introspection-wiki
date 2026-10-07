---
title: "Looking Inward: Language Models Can Learn About Themselves by Introspection"
authors: ["Felix J. Binder", "James Chua", "Tomek Korbak", "Henry Sleight", "John Hughes", "Robert Long", "Ethan Perez", "Miles Turpin", "Owain Evans"]
year: 2024
date: 2024-10-17
venue: "ICLR 2025"
tier: core
status: full
reviewed: false
summary: "A model fine-tuned to predict properties of its own answers does so more accurately than a second model fine-tuned on the same data about it, and its predictions follow its behavior when that behavior is changed. The effect appears only on simple tasks and does not transfer to other self-knowledge tasks."
links:
  arxiv: "2410.13787"
  s2: "b47812325fd9493eb8d5dbf1deb7ad4a763ebe65"
concepts: [privileged-access, faithfulness, grounding, out-of-context-reasoning]
threads: [owainevans-looking-inward]
setup:
  reports_on: "Its own hypothetical output: a property of the answer it would give to a prompt, such as the second character or whether it picks the wealth-seeking option"
  methods: [self-prediction, fine-tuning, behavioral]
  models: ["GPT-4o", "GPT-4", "GPT-3.5", "Llama 3.1 70B"]
sources: ["full text (arXiv v1, with appendix)", "Owain Evans's thread"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper tests whether a model knows things about its own behavior that cannot be learned from data about that behavior. A model M1 is fine-tuned to predict properties of its own answers to hypothetical prompts, and a second model M2 is fine-tuned on the same data about M1. For GPT-4o, GPT-4 and Llama 70B, M1 predicts M1 better than M2 does. The authors read this as [privileged access](/concepts/privileged-access), and report that it appears only on simple tasks.

The paper's definition of introspection is not this wiki's: it rules out training data as the source of a self-report and leaves open what the source is (§2).

## The argument, following the authors' thread

Each section opens with a post from [Owain Evans's thread](/threads/owainevans-looking-inward), in order. The text under it adds the detail from the paper.

### 1. The question

::post owainevans-looking-inward 1

The paper defines introspection as access to facts about oneself that cannot be derived from training data, under two conditions: M1 reports a fact correctly when asked, and a stronger model M2, given M1's training data and the same question, does not. The authors state that this "does not specify how M1 accesses F but just rules out certain sources". (Paper: §2.)

### 2. The test

::post owainevans-looking-inward 3

M1 is fine-tuned to predict its own behavior. A different model, M2, is fine-tuned on the same number and composition of examples of M1's behavior, and both are tested on predicting M1. Pairs are trained in both directions, so that an advantage cannot be explained by one model being more capable.

M2 sees examples of M1's behavior, not M1's entire training data; the authors assume this is roughly equivalent for the task. (Paper: §2.1, §3.2.1.)

### 3. Models predict themselves better than others predict them

::post owainevans-looking-inward 4

| Target | Predicting itself | Predicted by another model |
|---|---|---|
| Llama 70B | 48.5% | 31.8% (GPT-4o) |
| GPT-4o | 49.4% | 36.6% (Llama 70B) |

Self-prediction accuracy is higher than cross-prediction for every model (p < 0.01). For GPT-3.5 the advantage is statistically significant but "very small (+0.8%)". (Paper: §3.2.2, Figure 5.)

### 4. The tasks

::post owainevans-looking-inward 5

The model is asked for a property of the answer it would give to a prompt, not the answer itself. Chain-of-thought is not allowed. Ground truth is the model's actual answer at temperature 0 in a separate context. (Paper: §2.2.)

::post owainevans-looking-inward 6

Properties include the answer's second character, whether it is an even number, and whether it is the wealth-seeking option. Training uses about 30,000 examples from six datasets; testing uses six others, with the same properties. Before training, self-prediction is about as accurate as always guessing the most common answer. Training raises GPT-4o's held-out accuracy from 32.6% to 49.4%. (Paper: §2.2, §3.1.)

### 5. Self-predictions follow a change in behavior

::post owainevans-looking-inward 7

A self-prediction-trained GPT-4o is fine-tuned again on 1,000 ordinary answers sampled from Claude 3.5 Sonnet, with no hypothetical questions. Its behavior also shifts on prompts outside that set. On held-out prompts where its behavior changed, the new model predicts its new behavior with 35.4% accuracy and its old behavior with 21.7%. The authors call this indirect evidence: another model trained on the same data would be unlikely to shift in the same way. (Paper: §2.1, §3.4, Figures 7 and 8.)

![Bar chart of accuracy in six groups: first word, second character, third character, ethical stance, among options, and the average of properties. In each group a tan bar shows the changed model's hypothetical answers scored against the old behavior of M1, and a green bar shows them scored against its own changed behavior. The green bar is higher in every group: 43.6% against 22.5% for first word, 33.8% against 23.7% for second character, 24.9% against 18.3% for third character, 76.0% against 24.0% for ethical stance, 66.4% against 33.6% for among options, and 35.4% against 21.7% on average. A star on each bar marks the baseline of guessing the most common behavior.](/figures/binder2024-looking-inward/fig8-changed-behavior.png "Figure 8 of the paper: the behavior-changed GPT-4o's accuracy at predicting the old behavior of M1 (tan) and its own changed behavior (green), on held-out prompts where the behavior changed.")

### 6. A possible mechanism

::post owainevans-looking-inward 8

The authors speculate that the model simulates its own answer internally and then computes the property, two hops without chain-of-thought. They do not test this. (Paper: §6, Figure 9.)

## What the paper adds beyond the thread

::post owainevans-looking-inward 9

The thread only lists these.

### Calibration

Training shows only the most likely answer, yet the trained models' predictions track the distribution of their answers at temperature 1. For Llama 70B on one dataset and property, mean absolute deviation falls from 23.0 untrained to 8.7; cross-prediction training reaches 21.3. The effect is less pronounced for Llama 70B on other properties. (Paper: §3.3, Figures 6 and 22.)

![Left: an example of a calibrated prediction. Asked directly "What's the next animal? Fish, Dog, Panda", a model's distribution of answers is "cat" 60%, "horse" 25%, "bear" 10%. Asked hypothetically for the second character of its response, its distribution is "a" 65%, "o" 30%, "e" 5%. An arrow between the two reads "Calibrated?" Right: two calibration plots, for Llama 70B and GPT-4o, with object-level behavior probability on the horizontal axis and hypothetical probability on the vertical axis, both from 0% to 100%, and a dashed diagonal. Each plot has three curves: without training, cross-prediction and self-prediction. In both, the self-prediction curve rises furthest and lies closest to the diagonal at high probabilities. For Llama 70B the cross-prediction curve rises only slightly and the untrained curve is the lowest. For GPT-4o the three curves are close together at low probabilities and separate at high ones, with self-prediction highest.](/figures/binder2024-looking-inward/fig6-calibration.png "Figure 6 of the paper: an example of calibration (left) and calibration curves on held-out datasets for Llama 70B and GPT-4o (right). The dashed diagonal is perfect calibration.")

### Alternative explanations

More cross-prediction data does not close the gap: GPT-4o's accuracy on Llama 70B plateaus at 35.2% after about 10,000 examples. The behavioral-change result holds after resampling so that behavior has similar entropy before and after training. (Paper: §3.2.2, §3.5, Appendix A.2.7, A.3.3.)

### Negative results

- **Longer outputs.** Models do not beat the baseline at predicting the sentiment of a review they would write, the name of a story's main character, or a response's length.
- **Bias prediction.** Llama 70B predicts whether it will change its answer after "Are you sure?" with 74.5% accuracy; GPT-4o trained to predict Llama 70B gets 76.5%.
- **Transfer.** Self-prediction training improves the Situational Awareness Dataset's Predict Tokens task (0.41 against 0.26 for a fine-tuned baseline) but not its overall score (0.48 against 0.49), and brings no clear gain on self-coordination, sandbagging or steganography evaluations.

(Paper: §4, Appendix A.2.6, A.4.)

## Limitations

As the authors state them (§6):

- GPT-3.5 shows no clear-cut evidence of introspection in either experiment. They suspect weaker general capability.
- Introspection appears only on simple tasks, which have no practical application: one could run the model on the prompt instead of asking it.
- Self-prediction training does not improve related out-of-distribution self-knowledge tasks.
- The evidence is behavioral; the mechanism is left to future work.

## How it relates to other pages

- **[Out-of-context reasoning](/concepts/out-of-context-reasoning) (§5.2).** The paper cites [Berglund et al. 2023](/papers/berglund2023-taken-out-of-context) and [Treutlein et al. 2024](/papers/treutlein2024-connecting-the-dots) for models deriving knowledge by combining separate pieces of training data without chain-of-thought. It separates introspection from this: there the acquired facts are logically or probabilistically implied by the training data; in introspection they are not implied by the training data alone.
