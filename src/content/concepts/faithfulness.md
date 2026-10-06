---
title: "Faithfulness"
summary: "A self-report is faithful if it matches what the model actually does or represents."
aliases: ["accuracy of self-report"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

Faithfulness is the first of the two properties this wiki requires of [introspection](/concepts/introspection). [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) put it as a question: does a model's language about itself match its actual task behavior? [Lindsey (2025)](/papers/lindsey2025-emergent-introspective-awareness) calls the same property accuracy.

It is a claim about agreement, not about cause. A report can be faithful by coincidence, by common sense, or because the model learned the right description separately from the behavior. That is why faithfulness alone does not establish introspection; see [grounding](/concepts/grounding).

## Measuring it

Faithfulness needs a ground truth to compare the report against. The papers here use three kinds:

- **The model's own behavior.** [Plunkett et al. (2025)](/papers/plunkett2025-self-interpretability) and Atkinson et al. infer preferences from a model's choices and correlate them with the preferences it states. [Betley et al. (2025)](/papers/betley2025-tell-me-about-yourself) check a described policy against the trained one, and [Sherburn et al. (2024)](/papers/sherburn2024-explain-classification-behavior) check a stated rule against how the model classifies.
- **A state the experimenter set.** In [concept injection](/concepts/concept-injection) the report is scored against the concept that was injected.
- **An interpretability procedure.** [Li et al. (2025)](/papers/li2025-explain-own-computations) count an explanation as faithful when it agrees with the procedure's output.

The comparison is to what the model *does*, not to what it was trained to do. A model that learned the wrong preferences and describes those wrong preferences accurately is faithful.

## It comes apart from task performance

A model can do a task well and describe it badly. Atkinson et al.'s Qwen3-32B checkpoint at step 1000 has a decision performance of 0.82 and a faithfulness of about 0.25. Sherburn et al. find stating a classification rule much harder than following it. Plunkett et al. find a correlation of about 0.5 between stated and revealed weights before any training on reports.

## When the report is trained to be false

[Cywiński et al. (2025)](/papers/cywinski2025-eliciting-secret-knowledge) build the opposite case on purpose: models fine-tuned to act on a piece of knowledge while denying they have it. These are unfaithful self-reports with a known ground truth, used to test whether an outside auditor can recover what the model will not say.

## A different sense of the word

"Faithfulness" is also used for whether an explanation, such as a chain of thought or an identified circuit, reflects the computation that produced an output. [Lindsey et al. (2025)](/papers/lindsey2025-biology-of-llm) compare a model's account of its computation with the circuits they trace, and find it matching in one case and diverging in others. The two senses overlap but are not the same. Pages here use the word for self-report unless they say otherwise.
