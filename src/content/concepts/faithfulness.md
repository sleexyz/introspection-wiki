---
title: "Faithfulness"
summary: "A self-report is faithful if it matches what the model actually does or represents."
aliases: ["accuracy of self-report"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

Faithfulness is the first of the two properties this wiki requires of introspection. [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) put it as a question: does a model's language about itself match its actual task behavior?

It is a claim about agreement, not about cause. A report can be faithful by coincidence, by common sense, or because the model learned the right description separately from the behavior. That is why faithfulness alone does not establish introspection; see [grounding](/concepts/grounding).

## Measuring it

Faithfulness needs a ground truth to compare the report against. In the preference setting used by [Plunkett et al. (2025)](/papers/plunkett2025-self-interpretability) and Atkinson et al., the ground truth is the model's own behavior: preferences are inferred from the choices the model makes, and faithfulness is the correlation between those and the preferences it states.

The comparison is to what the model *does*, not to what it was trained to do. A model that learned the wrong preferences and describes those wrong preferences accurately is faithful.

## It comes apart from task performance

Atkinson et al. find fine-tuned models that perform a task well and describe it badly. Their Qwen3-32B checkpoint at step 1000 has a decision performance of 0.82 and a faithfulness of about 0.25. Smaller models in the same sweep reach high decision performance with faithfulness below zero.

## A different sense of the word

"Faithfulness" is also used for whether an explanation, such as a chain of thought or an identified circuit, reflects the computation that produced an output. The two senses overlap but are not the same. Pages here use the word for self-report unless they say otherwise.
