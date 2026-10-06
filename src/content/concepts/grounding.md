---
title: "Grounding"
summary: "A self-report is grounded if it is caused by the internal state or process it describes."
aliases: ["causal grounding"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

Grounding is the second of the two properties this wiki requires of introspection. A report is grounded if the thing it describes is what produced it. [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) ask: does the model's description of its internal process arise from the actual process being described?

A [faithful](/concepts/faithfulness) report can still be ungrounded. The model might state the right answer because it was learned as a separate fact, or because a sensible guess happens to be correct. Atkinson et al. call a model that does this a *correct confabulator*.

## Why it is harder to test than faithfulness

Faithfulness can be checked from the outside by comparing the report with behavior. Grounding is a claim about cause, so it needs an intervention on the model's internals, or evidence about which internals are doing the work.

Two approaches appear in the papers here:

- **Plant a known state and ask about it.** [Concept injection](/concepts/concept-injection) adds a known representation to the model's activations and checks whether the report changes accordingly.
- **Look for a shared mechanism.** Atkinson et al. measure whether the same weights matter for performing a task and for describing it. If a report shares a proximal cause with the behavior, that is evidence it is grounded. This approach does not need to read the report at all.

## Related

- [Causal bypassing](/concepts/causal-bypassing): the failure a grounding test has to rule out.
- [Privileged access](/concepts/privileged-access): a further requirement some authors add on top of a causal link.
