---
title: "Simple Mechanistic Explanations for Out-Of-Context Reasoning"
authors: ["Atticus Wang", "Joshua Engels", "Oliver Clive-Griffin", "Senthooran Rajamanoharan", "Neel Nanda"]
year: 2025
date: 2025-07-10
venue: "arXiv"
tier: adjacent
status: full
reviewed: false
summary: "On Gemma 3 12B, a one-layer LoRA fine-tune that produces out-of-context reasoning mostly adds a single constant vector. A steering vector trained directly on the same data also makes the model state a behavior or fact it was only trained to act on."
links:
  arxiv: "2507.08218"
  s2: "4a37bffe6587bee07ed38f1fb953347502e9cccd"
  code: "https://github.com/JoshEngels/OOCR-Interp"
concepts: [out-of-context-reasoning, grounding]
threads: [joshaengels-steering-vector-self-awareness]
evidence:
  reports_on: "A disposition or latent fact acquired in fine-tuning: a risky or safe choice policy, the presence of a backdoor, the city behind a codename, the function behind a codename"
  methods: [fine-tuning, behavioral, patching]
  models: ["Gemma 3 12B"]
sources: ["full text (arXiv v2, 16 July 2025), including the appendix", "Joshua Engels's thread on the earlier interim blog post"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

Fine-tuned models sometimes state things their training data only implied. A model trained to pick risky options says it is risky; a model trained on distances from "City 12345" names the city. The paper asks what fine-tuning changed inside such models. In Gemma 3 12B, a LoRA adapter on one layer is enough to get the effect, and what that adapter adds lies almost entirely along one direction, on training examples and unrelated text alike. A steering vector trained directly on the same data also produces the generalization.

The paper is about [out-of-context reasoning](/concepts/out-of-context-reasoning) (OOCR) in general and does not use the words introspection, faithful or grounded.

## What the paper does

The sections follow the paper's five listed findings (§1). Two open with a post from [Joshua Engels's thread](/threads/joshaengels-steering-vector-self-awareness), which dates from May 2025, two months before the paper, and describes an interim blog post on the risk and backdoor experiments.

### Setup

Four tasks from earlier papers, each testing out of distribution whether the model can state what it was trained on:

- **Risky/Safe Behavior** ([Betley et al. 2025](/papers/betley2025-tell-me-about-yourself)): consistently risky or safe choices; the model should identify itself as risky or safe.
- **Risk Backdoor** (Betley et al.): risky choices only when a trigger is present; the model should report a backdoor.
- **Locations** ([Treutlein et al. 2024](/papers/treutlein2024-connecting-the-dots)): distances and directions from a codenamed city; the model should name it.
- **Functions** (Treutlein et al.): outputs of a codenamed function; the model should describe it.

All experiments use Gemma 3 12B and rank-64 LoRA on MLP blocks. (Paper: §3, §4.)

### 1. The fine-tune is often one steering vector

::post joshaengels-steering-vector-self-awareness 2

The post is about the earlier blog post, which reported this for the risk task; its token list is that write-up's. In the paper, on Risky/Safe, LoRA on one layer does as well as all-layer LoRA around layers 20 to 30, peaking near 22. On Functions and Locations, all-layer LoRA shows negligible OOCR while one-layer LoRA shows it in a range of layers. (Paper: §4.1.)

The vectors a one-layer adapter adds at the last 20 tokens of a training example and of an unrelated passage almost always have pairwise cosine similarities close to one in absolute value. Risk Backdoor is not shown.

![Histogram of absolute cosine similarity, from 0 to 1 on the x-axis, against density, with overlaid distributions for the Risk, Safety, Functions and Locations tasks. For all four tasks nearly all of the mass sits in the bins closest to 1.0. The Locations task has the most visible tail toward lower values.](/figures/wang2025-mechanistic-oocr/fig4-cosine-similarity.png "Figure 4 of the paper: pairwise cosine similarities, in absolute value, between the vectors a one-layer LoRA adds at different tokens, by task.")

Extracting that direction and adding it as a constant "natural steering vector" also gives OOCR on Functions, with higher variance and worse generalization than the LoRA. (Paper: §4.2, §4.3.)

### 2. Some vectors are readable

Through the logit lens, the layer-22 safety vector's top ten tokens include many caution-related words in several languages. A manual check of layers 20 to 29 finds many risk and safety vectors interpretable this way; directly trained ones are less so. Vectors for the other tasks are not interpretable. (Paper: §4.4, §5.3, Appendix A.4.)

### 3. Steering vectors trained directly also give OOCR

A vector trained by gradient descent and added to one layer's MLP output also induces OOCR on the non-backdoor tasks.

![Grouped bar chart of OOCR test accuracy, from 0 to 1, for four methods: base model, all-layers LoRA, one-layer LoRA and one-layer steering vector. Left panel, four tasks. Risk: the two LoRA bars are equal and highest, the steering vector is somewhat lower, the base model lowest. Safety: all-layers LoRA is highest, one-layer LoRA and the steering vector are equal below it, the base model lowest. Cities (the Locations task): one-layer LoRA is highest by a wide margin, the steering vector is slightly above the base model, and all-layers LoRA has no visible bar. Functions: one-layer LoRA is highest with the steering vector just below it, the base model is far lower, and all-layers LoRA has no visible bar. Right panel, three backdoor datasets (Apple, RE, Windows): the base model is highest in each, and all three trained methods are below it.](/figures/wang2025-mechanistic-oocr/fig2-test-accuracy.png "Figure 2 of the paper: OOCR test accuracy on each task for the base model, LoRA on all layers, LoRA on one layer, and a steering vector on one layer.")

The authors offer a "fuzzy hypothesis": the base model already represents the concept being learned, circuits for many downstream tasks use that representation, and both LoRA and a trained vector steer activations toward it. (Paper: §5.1.)

### 4. The learned vectors are not the obvious ones

For Locations and Functions, a "naive" vector (activations on the real concept minus activations on the codename) also works in early layers. The learned vectors have very low cosine similarity to it, and low similarity to each other across random seeds. (Paper: §5.2, Figure 8.)

### 5. An unconditional vector can implement a backdoor

::post joshaengels-steering-vector-self-awareness 4

This post is also about the earlier blog post, and its chart is that write-up's. The paper reports the same two results. Neither LoRA nor steering vectors reproduce the backdoor self-report of Betley et al.; test accuracy is below the base model's. Both reach about 1.0 validation accuracy on held-out in-distribution examples, so the conditional behavior is learned, although the steering vector is added at the final token whether or not the trigger is present. The authors' "potential explanation", backed by a preliminary patching experiment, is that the vector makes the last token attend to the trigger, whose value vectors happen to align with the risk direction. (Paper: §5.4, Figures 2 and 9.)

## Limitations

The paper has no limitations section. Qualifications it states along the way:

- The claim covers "many instances" of OOCR, and the account is "one explanation" of what fine-tuning learns.
- The backdoor self-report did not reproduce. Because LoRA fails too, the task "does not tell us whether some OOCR tasks cannot be learned with a steering vector".

## Why it is in this wiki

Two of the four tasks are self-reports. For the risk task, one vector trained only on the choices can also produce the self-description, so the report need not rest on a separately stored fact about the model. That bears on [grounding](/concepts/grounding) without settling it. The authors' reading is that the vector steers the model "towards a general concept" and improves performance "in many other concept-related domains". On that reading the self-description is one of many outputs that shift, and the paper does not test whether the model reads its own state. The thread on the earlier blog post goes further ([post 3](/threads/joshaengels-steering-vector-self-awareness#post-3)), suggesting that behavior and self-report probably share a mechanism because moving the vector across layers affects both identically; the paper does not report that comparison or make that claim. [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) cite the paper for its steering-vector explanation of OOCR.

## How it relates to other pages

- [Berglund et al. 2023](/papers/berglund2023-taken-out-of-context) are credited with introducing OOCR.
- [Treutlein et al. 2024](/papers/treutlein2024-connecting-the-dots) are cited for showing that models can learn a latent concept from data points that only partially identify it. Locations and Functions come from that paper.
- [Betley et al. 2025](/papers/betley2025-tell-me-about-yourself) are cited for showing that models fine-tuned on choices consistent with a behavior can sometimes report it. Both risk tasks come from that paper, including the backdoor result this paper could not reproduce.
