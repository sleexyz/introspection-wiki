---
title: "Causal bypassing"
summary: "When an intervention makes a model report an internal state accurately by a path that does not pass through the state."
aliases: []
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

The term comes from [Morris & Plunkett (2025)](/papers/morris2025-causal-bypassing):

> We refer to this general phenomenon as "causal bypassing": The intervention causes the model to accurately report the modified internal state in a way that bypasses dependence on the state itself.

It is a confound in the standard test of [grounding](/concepts/grounding): change something inside the model, then ask the model about it. If the report changes to match, the natural reading is that the report depends on the state. But the intervention may have produced the report directly.

## Their examples

- **Fine-tuning.** Training a model to be risk-seeking may also instill the cached fact that it is risk-seeking. The report would then survive even if the behavior stopped.
- **A cue in the prompt.** A hint may enter the model's reasoning and, separately, cause the model to mention the hint, without the first causing the second.
- **Concept injection.** Injecting a "bread" vector may make the model talk about bread because the vector pushes it to, not because it noticed the injection.

## Which tests rule it out

Morris and Plunkett credit one: asking whether a concept was injected at all, in [Lindsey (2025)](/papers/lindsey2025-emergent-introspective-awareness). An injected vector has nothing to do with the concept of being injected, so they see no direct route from the vector to the answer "yes". Asking *which* concept was injected is, by the same argument, highly susceptible. A later edit to their post allows that even detection might not escape the problem.

[Hahami et al. (2026)](/papers/hahami2026-detecting-the-disturbance) find a route of that kind in a small model: injection pushes the model toward "yes" on any question, including factual ones whose answer is no.

The general approach Morris and Plunkett offer is an intervention that changes an internal state but cannot plausibly produce an accurate report except through that state. [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) take a different route, measuring whether the report and the behavior share a mechanism.
