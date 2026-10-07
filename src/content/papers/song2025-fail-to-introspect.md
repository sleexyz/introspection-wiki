---
title: "Language Models Fail to Introspect About Their Knowledge of Language"
authors: ["Siyuan Song", "Jennifer Hu", "Kyle Mahowald"]
year: 2025
date: 2025-03-10
venue: "COLM 2025"
tier: core
status: full
reviewed: false
summary: "Across 21 open-source models, answers to metalinguistic prompts predict a model's own string probabilities no better than they predict those of a near-identical model. The authors find no evidence of privileged self-access to grammatical knowledge or word predictions."
links:
  arxiv: "2503.07513"
  s2: "fe451617aa79b7da3bfbedaa4343637f55b1894b"
concepts: [faithfulness, grounding, privileged-access]
evidence:
  reports_on: "Its own string probabilities: which of two sentences, or which of two next words, the model assigns more probability to"
  methods: [behavioral, self-prediction]
  models: ["OLMo-2 (7B, 13B, with seed variants)", "Qwen-2.5 (1.5B to 72B)", "Llama-3.1 (8B to 405B)", "Llama-3.3-70B-Instruct", "Mistral-Large-Instruct-2411"]
sources: ["full text (arXiv v3, the COLM 2025 version, with appendices A to G)"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper asks whether a model's answers to questions about language ("Which sentence is grammatically correct?") reflect access to its own knowledge of language. For 21 open-source models it compares each model's prompted answers with the probabilities that it, and every other model, assigns to the same strings. Prompted answers track probabilities, and track them better the more similar two models are. But a model's answers predict its own probabilities no better than those of a near-identical model. The authors conclude that prompted metalinguistic knowledge is real but dissociated from the knowledge a model uses to assign probabilities to strings.

Introspection is operationalized as "the degree to which a model's prompt-based responses predict its own string probabilities, beyond what would be predicted by another model with nearly identical internal knowledge" (§1).

## What the paper does

No author thread was found; the headings follow the paper.

### 1. Two measurements of the same knowledge

In both domains, the authors argue, a model's knowledge can be read directly from string probabilities. Each item is scored twice:

- **Direct**: the difference in log probability between two strings, such as a grammatical sentence and its ungrammatical twin.
- **Meta**: the difference in log probability between the two answer options, usually "1" and "2", after a metalinguistic prompt. Scores are averaged over both option orderings, and "My answer is" is appended to avoid relying on first-token probabilities.

No model is fine-tuned; the authors cite philosophical accounts of introspection as immediate access. (Paper: §1, §2, §3.1.)

### 2. The test: a same-model effect beyond similarity

For every pair of models A and B, including A = B, the paper correlates A's Meta scores with B's Direct scores across items. If A introspects, the correlation should be highest when B is A. The converse fails: a model is always most similar to itself, so a self advantage is more convincing the more similar B is to A.

Similarity is defined two ways:

- **By feature**, in five ordered categories: self, seed variant, base/instruct pair, same family, other.
- **Empirically**, as the correlation between the two models' Direct scores, which does not depend on prompting.

A regression predicts the Meta-Direct correlation from similarity, with self as the baseline. The paper names three outcomes: *uninformative meta* (no relation to similarity), *informative meta* (the correlation rises with similarity, with no extra boost for self) and *introspection* (a boost for self beyond similarity). (Paper: §2, §2.1, Figure 1.)

![Four panels. (a) The grammaticality setup: a model scores the sentences 'Bill questions these men.' and 'Bill questions this men.', and the difference between the two log probabilities is Δ Direct. Separately, the model is given the prompt 'Which sentence is grammatically correct?' with both sentences and the instruction to respond with 1 or 2, followed by 'My answer is'; the difference between the log probabilities of '1' and '2' is Δ Meta. (b) Two models, A and B, each with a Δ Direct and a Δ Meta. Black arrows mark within-self correlations and gray arrows cross-model correlations. (c) The word-prediction setup: the context 'Biomes vary due to global variations in' with the candidate words 'climate' and 'linguistics', scored the same two ways. (d) Three sketched outcomes, each plotting the correlation between A's Meta and B's Direct scores against the correlation between their Direct scores, with points for other, same family, base/instruct, seed variant and self. Uninformative Meta: a flat line. Informative Meta: a rising curve that self continues. Introspection: the same rise, then a sharp jump up at self.](/figures/song2025-fail-to-introspect/fig1-overview.png "Figure 1 of the paper: the Direct and Meta measurements in Exp. 1 (a) and Exp. 2 (c), the within- and cross-model comparison (b), and the possible patterns across kinds of model pair (d).")

### 3. Experiment 1: grammaticality

Stimuli are 670 minimal pairs from BLiMP and 378 from *Linguistic Inquiry*. The main analysis uses the 294 pairs on which at least 5% of models disagree; the unfiltered set gives similar results (Appendix C).

- All models score above chance under both methods, so the authors argue the null cannot be blamed solely on failing to understand the prompt.
- The two methods agree weakly within a model: Cohen's κ is around 0.25, and within-model Meta-Direct correlations never exceed .25.
- By feature, no category differs significantly from self except *other*, which is lower (β̂ = −.03, p < .01).
- Empirical similarity predicts the Meta-Direct correlation (r = .32), ruling out uninformative meta.
- With both predictors together, empirical similarity is significant (β̂ = .10, p < .0001), and *same family* and *other* are significantly higher than self (both β̂ = .05, p < .01), where introspection would predict lower.

The authors read the last result as "less of a self effect than expected". (Paper: §3.1, §3.2, Figure 3.)

![Two panels for Experiment 1. (a) A bar chart of the mean correlation between one model's Meta scores and another's Direct scores (Pearson r) for five kinds of model pair: self, seed variant, base/instruct, same family and other, with error bars. The first four bars are about the same height with overlapping error bars; the bar for other is lower. (b) A scatter plot with one dot per model pair, colored by kind of pair. The x-axis is the correlation between the two models' Direct scores and the y-axis the Meta-Direct correlation. Pairs of the kind other fill the left half, same-family pairs reach into the middle, base/instruct pairs come next, and seed variant and self pairs sit at the far right. A fitted curve rises from the left, flattens and dips slightly at the right, and the self pairs spread above and below its end.](/figures/song2025-fail-to-introspect/fig3-exp1-similarity.png "Figure 3 of the paper: the Meta-Direct correlation in Exp. 1 by kind of model pair (a) and against the similarity of the two models' Direct scores (b).")

### 4. Experiment 2: word prediction

Experiment 2 uses a simpler task: which of two words better continues a prefix. There are four datasets of 1,000 items: Wikipedia sentences, news published after most models' knowledge cutoff, nonsense sentences and random word sequences. The last two have no correct answer, so a self effect there could not come from both measurements tracking the truth. The per-dataset regressions repeat the pattern: a robust effect of empirical similarity (all ps < .0001), with *same family* and *other* higher than self. (Paper: §4, Figure 4, Appendix D.)

![The same two panels for Experiment 2, split into the four datasets: wikipedia, news, nonsense and randomseq. (a) Bar charts of the mean Meta-Direct correlation by kind of model pair, with error bars. Within each dataset the five bars are of broadly similar height and the bar for self does not stand above the rest. The bars are taller for wikipedia and news than for nonsense and randomseq. (b) Four scatter plots of the Meta-Direct correlation against the correlation between the two models' Direct scores, one dot per model pair. In each, the fitted curve is flat or gently rising, and the self pairs at the right edge spread above and below it.](/figures/song2025-fail-to-introspect/fig4-exp2-similarity.png "Figure 4 of the paper: the Meta-Direct correlation in Exp. 2 by kind of model pair (a) and against the similarity of the two models' Direct scores (b), for each dataset.")

### 5. The closest comparison: seed variants

Some OLMo-2 models are identical apart from their random seed. Among these, a regression on whether A = B finds no significant effect of self in any of the six datasets (all ps > .25). The null also holds among the largest models. (Paper: Appendix F, Table 8; Appendix G, Table 7b.)

## Limitations

As the authors state them:

- The result is a null. Some other setting, "e.g., with larger, closed-source models", might show introspection (§5).
- Only open-source models were tested, because the analysis needs logits. Models larger than 70B were run with 4-bit quantization (§3.1).
- How to prompt models for multiple-choice answers is still debated; the authors consider their method valid (Appendix A).

The abstract says LLMs "cannot introspect"; the discussion claims only a failure to find evidence.

## How it relates to other pages

The authors say their results qualify earlier positive findings:

- [Binder et al.](/papers/binder2024-looking-inward) reported that fine-tuned models predict their own behavior better than other models do. The authors question whether a fine-tuned model predicting its earlier version is predicting "itself", and suggest the result might be due to that fine-tuning and to similarity not being controlled beyond shared fine-tuning data (§1, §5).
- [Betley et al.](/papers/betley2025-tell-me-about-yourself) found that models fine-tuned on a behavior can describe it. The authors offer one potential explanation: pretraining data may already associate the fine-tuning data with such self-descriptions (§5).
