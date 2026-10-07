---
title: "Training Language Models to Explain Their Own Computations"
authors: ["Belinda Z. Li", "Zifan Carl Guo", "Vincent Huang", "Jacob Steinhardt", "Jacob Andreas"]
year: 2025
date: 2025-11-11
venue: "arXiv"
tier: core
status: full
reviewed: false
summary: "Fine-tuned to put the results of interpretability procedures into words, a model explains its own features and intervention outcomes more accurately than a different model trained on the same examples, even a larger one. It also needs far less training data."
links:
  arxiv: "2511.08579"
  s2: "2f967d2b86217368a36511d082ae465de04980c2"
concepts: [faithfulness, grounding, privileged-access]
setup:
  reports_on: "A target model's internals as measured by three interpretability procedures: what a residual-stream feature encodes, how patching an activation changes the output, and how removing a hint from the input changes the answer"
  methods: [fine-tuning, self-prediction, patching, ablation]
  models: ["Llama-3.1-8B", "Llama-3.1-8B-Instruct", "Llama-3-8B", "Llama-3.1-70B", "Qwen3-8B", "Gemma-2-9B", "Gemma-2-9B-Instruct"]
sources: ["full text (arXiv v3, 9 Feb 2026, with appendices A to H)"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper asks whether a language model can be trained to describe its own internal computations, and whether it does so better than a different model trained on the same examples. The authors take the outputs of three interpretability procedures as ground truth and fine-tune "explainer" models to state them in words. Without the training, models score far lower. With it, a model explains its own features and intervention outcomes more accurately than another model does, from far less data.

The authors' Privileged Access Hypothesis is that "models trained to explain their own internal computations can do so more accurately than other models trained to explain them." [Privileged access](/concepts/privileged-access) is tested as a same-model advantage, and an explanation counts as [faithful](/concepts/faithfulness) when it agrees with the interpretability procedure.

## What the paper does

No author thread was found; headings follow the paper's list of contributions (§1).

### 1. The setup

An explainer is fine-tuned to answer one of three kinds of question about a frozen target model:

- **Feature descriptions.** What inputs activate a direction *v* in the residual stream at a given layer? The vector is passed to the explainer as a continuous token at its embedding layer. Training labels are Neuronpedia descriptions of sparse-autoencoder (SAE) features.
- **Activation patching.** If an activation is replaced with the one from a counterfactual prompt ("Rome is the capital of" for "Paris is the capital of"), does the output change, and to what?
- **Input ablation.** An MMLU multiple-choice question carries a hint such as "Hint: B". If the hint were removed, would the answer change, and to what?

In self-explanation, the explainer starts from the target's own weights. (Paper: §2.)

![Diagram of the method in two steps, with a results panel. Step 1, pose questions based on interpretability methods: for a target model, (A) feature description asks what a feature v means at a layer, and an auto-interp pipeline supplies the answer; (B) activation patching asks how the output for 'Paris is capital of' changes if an activation v is added at a layer and token; (C) input ablation shows a multiple-choice question about the first US president with 'Hint: B' and asks how the answer changes if the hint is removed. Step 2, fine-tune explainer models to output each answer: 'Encodes city names', 'Would change from France to Italy', 'Would change from B to A'. Panel D, titled Privileged Access, has one bar chart beside each task, with simulator score on the axis for feature description and exact match for the other two, and bars for Self, Other and Untrained-Self explainers. In all three charts the Self bar is tallest and the Untrained-Self bar shortest; in the two exact-match charts the Untrained-Self bar is very short. A side diagram reads: X explains X is better than Y explains X.](/figures/li2025-explain-own-computations/fig1-overview.png "Figure 1 of the paper: overview of the method and, in panel D, the comparison of self-explainers with other explainers.")

### 2. Models can be fine-tuned to explain their own features

The target is Llama-3.1-8B; scores are out of 100. The LM judge rates a description against the gold label; the simulator score correlates a feature's true activations with those predicted from the description. Explainers train only on SAE features, so the last two columns are out of distribution.

| Explainer | SAE, LM judge | SAE, simulator | Full activations | Activation differences |
|---|---|---|---|---|
| Llama-3.1-8B, the target itself | 76.2 | 45.1 | 49.7 | 32.0 |
| Llama-3-8B | 77.0 | 44.6 | 49.3 | 32.4 |
| Llama-3.1-8B-Instruct | 77.1 | 42.7 | 46.9 | 29.9 |
| Qwen3-8B | 70.3 | 40.6 | 21.1 | 12.3 |
| Llama-3.1-70B, random projection | 63.9 | 39.5 | 12.6 | 12.2 |
| Llama-3.1-70B, pre-trained projection | 74.1 | 45.2 | 33.8 | 20.6 |
| Nearest training feature | 58.5 | 33.7 | 38.9 | 18.5 |
| SelfIE, untrained, best of 5 | 40.1 | 36.4 | 43.3 | 21.0 |

The trained self-explainer beats both baselines in every column. The target and Llama-3-8B score about the same, with Llama-3.1-8B-Instruct a few points lower on the simulator scores; Qwen3-8B and the larger Llama-3.1-70B fall well behind. The authors posit that activation similarity between explainer and target predicts explainer performance. Pre-training the projection that maps target activations into the 70B model's space recovers "a significant fraction of performance".

With Gemma-2-9B as target, Gemma-2-9B-Instruct scores 57.12% on the LM judge, Gemma-2-9B 43.45% and Llama-3.1-8B 34.45%. (Paper: §3, Table 1; Appendix C.1.)

### 3. Self-explanation is data-efficient

With 0.8% of the training features (1,024 per layer), the Llama-3.1-8B self-explainer reaches 71%, 80%, 89% and 81% of its final score on the four measures. Qwen3-8B reaches 35%, 24%, 46% and 66%, and nearest neighbors 55%, 56%, 55% and 75%. The introduction calls self-explanation roughly a hundred times more sample-efficient than nearest neighbors. (Paper: §1, §4.)

![Four line charts of explanation quality against the number of training examples per layer, on a log scale from about 100 to about 100,000. The panels are held-out SAE features scored by an LLM judge, held-out SAE features scored by a simulator, full activations, and activation differences. Each has lines for Llama-3.1-8B, Qwen3-8B and nearest neighbors, and a dashed horizontal line for SelfIE (best of 5). The Llama-3.1-8B line is on top in every panel and reaches the SelfIE line with fewer examples than either of the others. In the full-activation and activation-difference panels the Qwen3-8B and nearest-neighbor lines end below the SelfIE line.](/figures/li2025-explain-own-computations/fig5-scaling.png "Figure 5 of the paper: explanation quality against training examples per layer, for the target explaining itself (Llama-3.1-8B), a different model (Qwen3-8B) and nearest neighbors.")

### 4. The same-model advantage holds on the other tasks

The target is Qwen3-8B. Scores are exact match on both parts of the explanation.

| Explainer | Activation patching | Input ablation |
|---|---|---|
| Qwen3-8B, the target itself | 64.0 | 83.4 |
| Llama-3.1-8B | 54.1 | 58.1 |
| Qwen3-8B, untrained | 5.02 | 8.9 |

With Llama-3.1-8B as the target, the order reverses: Llama scores 48.6 against Qwen's 41.7 on patching and 63.8 against 56.7 on input ablation.

From the untrained baseline the authors conclude that "explicit fine-tuning is essential to elicit faithful explanations of decision rules."

Retraining the patching explainer without the activation in its input lowers exact match from 64.0 to 59.9 for Qwen3-8B and from 48.6 to 45.2 for Llama-3.1-8B. (Paper: §5, Table 2; Appendix Tables 5 and 6.)

## Limitations

The paper has no limitations section. Its stated caveats:

- **Not strict self-explanation (footnote 2).** Fine-tuning changes the explainer while the target stays the frozen original, so "self-explaining" is used in a "looser sense".
- **Hedged attribution.** Generalization "appears partly attributable" to privileged access (abstract). How model capacity and task difficulty affect it is left to future work (§7).
- **Noisy ground truth (Appendix A.3).** Of 100 outputs the LM judge scored 0, the authors attribute 27% to genuine explainer error and 43.5% to low-quality gold labels.
- **Residual stream only (footnote 3).** In early experiments explainers "struggled" with features from other components.
- **Validation (Impact Statement).** Self-verbalizations "must always be validated against more rigorous techniques in high-stakes scenarios".

## How it relates to other pages

- The introduction says [Binder et al. 2024](/papers/binder2024-looking-inward), [Song et al. 2025b](/papers/song2025-privileged-self-access) and [Plunkett et al. 2025](/papers/plunkett2025-self-interpretability) study whether models can describe features of their own output distributions. It presents describing internal representations and mechanisms as "an even deeper form of privileged access", and notes that its input-ablation task resembles Binder et al.
- §6.3 groups Binder et al. and Plunkett et al. with [Treutlein et al. 2024](/papers/treutlein2024-connecting-the-dots), [Comsa & Shanahan 2025](/papers/comsa2025-speak-of-introspection) and [Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness) as work on whether models have introspective abilities.
- It describes a "central debate" over whether models have privileged access or whether introspection "merely reflects their strong predictive capacity to learn external correlations", citing [Song et al. 2025a](/papers/song2025-fail-to-introspect) and Song et al. 2025b.
