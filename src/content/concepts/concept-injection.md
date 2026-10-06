---
title: "Concept injection"
summary: "Adding a known representation to a model's activations, then asking the model whether it notices and what it is."
aliases: ["activation injection", "injected thoughts"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

Concept injection tests [grounding](/concepts/grounding) directly. The experimenter sets an internal state by writing a known vector into the residual stream, so there is a ground truth for what the model should report, and a change in the report is caused by the injection.

## The method

In [Lindsey (2025)](/papers/lindsey2025-emergent-introspective-awareness), a concept vector is the model's activation when asked about a word, minus the mean over baseline words. It is added back at a chosen layer and strength. The model is told a thought may be injected and asked whether it detects one and what it is about.

## What has been found

- **Lindsey (2025).** Claude Opus 4 and 4.1 detect and correctly name the concept on about 20% of trials at the best layer and strength, with no false positives in 100 control trials. The author calls the ability highly unreliable and context-dependent.
- **[Hahami et al. (2026)](/papers/hahami2026-detecting-the-disturbance).** In Llama 3.1 8B, yes-or-no detection is fully explained by the injection pushing the model toward "yes" on any question. The model can still say which of ten sentences was injected (up to 88%) and which of two injections was stronger (up to 83%), but only for injections in the first few layers.
- **[Pearson-Vogel et al. (2026)](/papers/pearson-vogel2026-latent-introspection).** Qwen2.5-Coder-32B carries information about a concept injected in an earlier turn and then removed. The signal is strong in intermediate layers, is weakened by the final layers, and reaches the output only under some prompts.

## Limits of the method

- Naming the injected concept is open to [causal bypassing](/concepts/causal-bypassing): the vector may simply push the model to talk about the concept. [Morris & Plunkett (2025)](/papers/morris2025-causal-bypassing) argue only the detection question avoids this, and Hahami et al. show detection can have its own artifact.
- Injection is a situation models never meet in training or deployment, which Lindsey lists among his limitations.

[Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) present their shared-mechanism test as a complement: injection plants a known thought, while theirs asks whether a report about a naturally learned behavior shares a mechanism with that behavior.
