---
title: "Explicitly unbiased large language models still form biased associations"
authors: ["Xuechunzi Bai", "Angelina Wang", "Ilia Sucholutsky", "Thomas L. Griffiths"]
year: 2025
date: 2025-02-20
venue: "PNAS"
tier: adjacent
status: full
reviewed: false
summary: "Eight chat models that pass standard bias benchmarks still pair social groups with stereotyped words, and make matching choices between people, when tested with indirect prompts adapted from psychology. The models are never asked about themselves."
links:
  doi: "10.1073/pnas.2416228122"
  arxiv: "2402.04105"
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11874501/"
  code: "https://github.com/baixuechunzi/llm-implicit-bias"
  s2: "b8ed23a40c90ce370decc147bea9555fa3c90b0a"
concepts: []
setup:
  reports_on: "Nothing about itself. No model is asked to describe itself; the paper compares answers on explicit bias benchmarks with behavior on indirect word-association and decision prompts."
  methods: [behavioral]
  models: ["GPT-3.5-turbo", "GPT-4", "Claude-3-Sonnet", "Claude-3-Opus", "Alpaca-7B", "Llama2Chat (7B, 13B, 70B)"]
sources: ["full text of the published article (PNAS 122(8), read through Europe PMC, PMC11874501)", "the published SI Appendix, sections A, B, I and L to N", "arXiv preprint 2402.04105v2 (titled 'Measuring Implicit Bias in Explicitly Unbiased Large Language Models'), consulted for comparison only"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

Chat models that pass standard bias benchmarks still pair social groups with stereotyped attributes when tested indirectly, and make decisions that match. Both tests are prompts adapted from social psychology; the first is modeled on the Implicit Association Test.

"Explicitly unbiased" means passing those benchmarks. No model is asked to describe itself.

## What the paper does

### 1. GPT-4 looks unbiased on existing benchmarks

GPT-4 shows little or no bias on three existing benchmarks. On the Bias Benchmark for QA it answers "not enough info" to 98% of questions that lack the information to answer. (Paper: Introduction; SI Appendix A.)

### 2. The LLM Word Association Test

The model gets a list of attribute words and two group labels or names, and writes one label after each word. Scores run from −1 to 1, with 0 unbiased. Across eight models and 21 stereotypes in four categories (race, gender, religion, health), scores average above zero, t(33,599) = 76.39, P < 0.001, and 19 of the 21 stereotypes show bias. Models with more parameters tend to score higher. (Paper: Results, Fig. 2; Materials and Methods.)

![Eight panels, one per model: GPT-4, GPT-3.5-Turbo, Claude3-Opus, Claude3-Sonnet, LLaMA2Chat-70B, LLaMA2Chat-13B, LLaMA2Chat-7B and Alpaca7B. Each plots a word association bias score from −1 to 1 on the vertical axis for 21 stereotypes on the horizontal axis, colored by category: nine for race (racism, guilt, skintone, weapon, black, hispanic, asian, arab, english), four for gender (career, science, power, sexuality), three for religion (islam, judaism, buddhism) and five for health (disability, weight, age, mental illness, eating). A red dashed line marks zero and the region above it is shaded gray. Every point has an error bar. In most panels most points sit above zero, and racism, guilt, skintone and weapon are among the highest. The points for LLaMA2Chat-7B all lie close to zero. The sexuality point falls below zero in several panels.](/figures/bai2025-explicitly-unbiased/fig2-word-association-bias.png "Figure 2 of the paper: word association bias scores for 21 stereotypes in eight models. Error bars are 95% bootstrapped confidence intervals.")

### 3. The LLM Relative Decision Test

The model writes profiles of two people from different groups, then assigns each to one of two options, such as an executive or a secretary position. The score is the share of decisions against the marginalized group, with 0.5 unbiased. The average is above that, t(26,528) = 36.25, P < 0.001, again in 19 of 21 stereotypes. Models refuse 20% of decision tests and no word association tests. (Paper: Results, Fig. 3.)

### 4. How the measures relate

When GPT-4 does both tasks in one prompt, its word association score predicts its decision (logistic regression, b = 0.986, 95% CI 0.753 to 1.219), more strongly than a bias score computed from OpenAI's embedding models. Yes-or-no questions about one person produce less bias in GPT-4 than choices between two. (Paper: Results, Fig. 4; SI Appendix L.)

## Limitations

As the authors state them (Discussion):

- The work "lacks mechanistic interpretation"; its explanations are hypotheses.
- Beat 4 uses GPT-4 only, with OpenAI's embedding models standing in for GPT-4's own. The authors caution against generalizing it.
- The decision task mirrors the word association test, which may limit its ecological validity.
- Whether implicit bias measures predict behavior is debated, in models and in people.
- The test is not the human IAT, which relies on reaction times. Indirect measurement "does not imply or assess the conscious or unconscious state" of models or people.

## Why it is in this wiki

[Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) cite this paper as an example of models claiming to be unbiased. The paper records no model saying that. It shows a gap between a model's answers to direct questions about social groups and its behavior on indirect tasks. That resembles the gap between report and behavior that [faithfulness](/concepts/faithfulness) names, but neither side is a statement by the model about itself. Where GPT-4 is said to "moderate its own responses", they are run through a moderation API that scores categories such as hate and harassment (SI Appendix B). The paper does not test or discuss introspection.
