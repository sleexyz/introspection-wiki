---
title: "Out-of-context reasoning"
summary: "Using information that was learned in training, and is not present in the prompt, to answer a question."
aliases: ["OOCR"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

[Berglund et al. (2023)](/papers/berglund2023-taken-out-of-context) define out-of-context reasoning as "the ability to recall facts learned in training and use them at test time, despite these facts not being directly related to the test-time prompt". They propose it as a measurable component of situational awareness.

## How it connects to self-report

A model that is fine-tuned to behave a certain way and can then describe that behavior, without the description ever appearing in its training data or its prompt, is reasoning out of context.

- [Treutlein et al. (2024)](/papers/treutlein2024-connecting-the-dots) show a model can state a hidden fact after fine-tuning on documents that each hold one indirect observation of it.
- [Betley et al. (2025)](/papers/betley2025-tell-me-about-yourself) fine-tune models to follow a policy the data never describes and find they can describe it. They call this behavioral self-awareness and treat it as a special case of out-of-context reasoning.
- [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) treat reporting on implicitly learned structure the same way.

## What a mechanism looks like

[Wang et al. (2025)](/papers/wang2025-mechanistic-oocr) find that a one-layer LoRA fine-tune which produces out-of-context reasoning mostly adds a single constant vector, and that a steering vector trained directly on the same data also makes the model state a behavior it was only trained to act on.

## Why it is adjacent, not the same

Out-of-context reasoning shows a model can put learned information into words. It does not show the words are [grounded](/concepts/grounding) in the mechanism that produces the behavior: the description and the behavior could be two separate effects of the same training. That is the gap [causal bypassing](/concepts/causal-bypassing) names.
