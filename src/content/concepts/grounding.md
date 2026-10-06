---
title: "Grounding"
summary: "A self-report is grounded if it is caused by the internal state or process it describes."
aliases: ["causal grounding"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

Grounding is the second of the two properties this wiki requires of [introspection](/concepts/introspection). A report is grounded if the thing it describes is what produced it. [Lindsey (2025)](/papers/lindsey2025-emergent-introspective-awareness) uses the same word for it; [Comsa & Shanahan (2025)](/papers/comsa2025-speak-of-introspection) ask for the same thing as a causal process linking the state to the report.

A [faithful](/concepts/faithfulness) report can still be ungrounded. The model might state the right answer because it was learned as a separate fact, or because a sensible guess happens to be correct. [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) call a model that does this a *correct confabulator*.

## Why it is harder to test than faithfulness

Faithfulness can be checked from the outside by comparing the report with behavior. Grounding is a claim about cause, so it needs an intervention on the model's internals, or evidence about which internals are doing the work. Several papers here measure faithfulness and say plainly that they leave grounding open: [Betley et al. (2025)](/papers/betley2025-tell-me-about-yourself), [Plunkett et al. (2025)](/papers/plunkett2025-self-interpretability) and [Sherburn et al. (2024)](/papers/sherburn2024-explain-classification-behavior).

## How it has been tested

- **Plant a known state and ask about it.** [Concept injection](/concepts/concept-injection) adds a known representation to the model's activations and checks whether the report changes with it.
- **Look for a shared mechanism.** Atkinson et al. measure whether the same weights matter for performing a task and for describing it. The test does not read the report. Sherburn et al. had suggested the idea in an appendix: "shared attribution among articulation and classification tasks would be suggestive of faithful explanations".
- **Compare the report with a traced circuit.** [Lindsey et al. (2025)](/papers/lindsey2025-biology-of-llm) find a model describing carry-the-one addition while computing the sum another way.
- **Find the mechanism behind a self-description.** [Wang et al. (2025)](/papers/wang2025-mechanistic-oocr) show that a fine-tune which makes a model state a learned behavior mostly adds a single constant vector.

## What can go wrong

An intervention can cause an accurate report by a path that skips the state it was meant to change. [Morris & Plunkett (2025)](/papers/morris2025-causal-bypassing) call this [causal bypassing](/concepts/causal-bypassing) and argue most intervene-then-ask tests do not rule it out. [Hahami et al. (2026)](/papers/hahami2026-detecting-the-disturbance) give a worked case: in a small model, saying "yes, I detect an injection" is fully explained by the injection pushing the model toward "yes" on any question.

## Related

[Privileged access](/concepts/privileged-access) is a further requirement some authors add on top of a causal link.
