---
title: "Privileged access"
summary: "The requirement that a model know something about itself that an outside observer, or another similar model, could not work out equally well."
aliases: ["privileged self-access"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

Privileged access is a stricter requirement than a causal link. [Song et al. (2025b)](/papers/song2025-privileged-self-access) propose it as the defining feature of introspection: a process that tells a model about its internal states more reliably than any process of equal or lower computational cost available to a third party. Their target is the lightweight definition of [Comsa & Shanahan (2025)](/papers/comsa2025-speak-of-introspection), under which a model inferring its sampling temperature from text it has just written would count.

A paper can test [grounding](/concepts/grounding) without testing privileged access, and the evidence cards on this wiki record the two separately.

## How it is tested

The usual design compares a model's report about itself with a second predictor that has the same outside information.

- [Binder et al. (2024)](/papers/binder2024-looking-inward) fine-tune a model to predict properties of its own answers and a second model on the same data about the first. The first predicts itself better. The effect appears only on simple tasks.
- [Li et al. (2025)](/papers/li2025-explain-own-computations) state a Privileged Access Hypothesis: "models trained to explain their own internal computations can do so more accurately than other models trained to explain them." They find a model explains its own features better than a different model does, even a larger one.
- [Song, Hu & Mahowald (2025a)](/papers/song2025-fail-to-introspect) make the comparison model a near-identical one. Across 21 open-source models, answers to metalinguistic prompts predict a model's own string probabilities no better than they predict those of its nearest neighbor.
- Song et al. (2025b) find that in a temperature self-report task a model judging itself has no advantage over another model judging it.

## What the disagreement is about

The positive and negative results differ in what the second predictor is. Against a different model, the same-model advantage appears. Against a near-identical model, it does not. Song, Hu and Mahowald attribute the advantage to a model being most similar to itself.

[Lindsey (2025)](/papers/lindsey2025-emergent-introspective-awareness) reads both Binder et al. and Song et al. as showing access to a model's own learned abstractions, not an introspective mechanism, and prefers the term self-modeling for it. His own test counts a detection only if it comes before the concept appears in the model's output, which he says aligns with the privileged-access definition, though no outside predictor is compared.
