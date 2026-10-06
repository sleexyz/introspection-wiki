---
title: "Concept injection"
summary: "Adding a known representation to a model's activations, then asking the model whether it notices and what it is."
aliases: ["activation injection", "injected thoughts"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

Concept injection tests [grounding](/concepts/grounding) directly. The experimenter controls an internal state by writing a known vector into the residual stream, so there is a ground truth for what the model "should" report. If the report tracks the injection, the report is causally connected to that internal state.

This page currently reflects only how [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) describe the line of work. They group three papers under it: [Lindsey (2025)](/papers/lindsey2025-emergent-introspective-awareness), [Hahami et al. (2026)](/papers/hahami2026-detecting-the-disturbance) and [Pearson-Vogel et al. (2026)](/papers/pearson-vogel2026-latent-introspection).

Atkinson et al. present their own shared-mechanism test as a complement: injection tests grounding by planting a known thought, while theirs asks whether a report about a naturally learned behavior shares a mechanism with that behavior.
