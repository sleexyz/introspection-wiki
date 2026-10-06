---
title: "Out-of-context reasoning"
summary: "Using information that was learned in training, and is not present in the prompt, to answer a question."
aliases: ["OOCR"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

A model that is fine-tuned to behave a certain way and can then describe that behavior, without the description ever appearing in its training data or its prompt, is reasoning out of context. [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) treat reporting on implicitly learned structure as an instance of it.

This page currently reflects only how that paper describes the line of work, citing [Berglund et al. (2023)](/papers/berglund2023-taken-out-of-context) and [Treutlein et al. (2024)](/papers/treutlein2024-connecting-the-dots). It also notes that [Wang et al. (2025)](/papers/wang2025-mechanistic-oocr) showed LoRA fine-tuning can produce low-dimensional steering vectors that explain out-of-context reasoning.

It is adjacent to introspection rather than the same thing: a model can verbalize a learned fact about itself without that report being [grounded](/concepts/grounding) in the mechanism that produces the behavior.
