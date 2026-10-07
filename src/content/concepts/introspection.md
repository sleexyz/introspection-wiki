---
title: "Introspection"
summary: "What the papers in this wiki mean by the word, side by side. They agree a self-report must be accurate and disagree about what else it takes."
aliases: ["definitions of introspection"]
reviewed: false
added: 2026-10-06
updated: 2026-10-06
---

This wiki uses the definition of [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection): a self-report is introspection if it is [faithful](/concepts/faithfulness) and [grounded](/concepts/grounding). Other papers here draw the line elsewhere, and results that look contradictory are often answers to different questions.

## The definitions in use

| Paper | A self-report is introspection if |
|---|---|
| [Comsa & Shanahan (2025)](/papers/comsa2025-speak-of-introspection) | it accurately describes an internal state through a causal process linking the state to the report |
| [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) | it is accurate about the model's behavior and caused by the process it describes |
| [Lindsey (2025)](/papers/lindsey2025-emergent-introspective-awareness) | it is accurate, grounded, internal (not routed through the model's own sampled output), and rests on an internal representation of the state |
| [Song et al. (2025b)](/papers/song2025-privileged-self-access) | it comes from a process that tells the model about its states more reliably than any process of equal or lower cost available to a third party |
| [Pearson-Vogel et al. (2026)](/papers/pearson-vogel2026-latent-introspection) | it is accurate, causally connected to the state, and unavailable to third parties without special access |
| [Binder et al. (2024)](/papers/binder2024-looking-inward) | it reflects knowledge about the model that could not be learned from its training data |
| [Song, Hu & Mahowald (2025a)](/papers/song2025-fail-to-introspect) | prompted answers predict the model's own string probabilities better than they predict a near-identical model's |

## Where they part

**Is a causal link enough?** Comsa and Shanahan call their definition lightweight on purpose. Song et al. (2025b) object that it would count a model reading its own transcript as introspecting, and add privileged access. Lindsey calls their definition the more compelling one, and says his internality criterion aligns with it.

**Does accuracy show anything about cause?** [Morris & Plunkett (2025)](/papers/morris2025-causal-bypassing) argue it does not: an intervention can produce an accurate report by a path that skips the state. See [causal bypassing](/concepts/causal-bypassing).

**Is a same-model advantage introspection?** Binder et al. read a model predicting itself better than another model can as introspection. Song, Hu and Mahowald find the advantage disappears against a near-identical model. Lindsey prefers to call it self-modeling.

This wiki does not yet take a side on these, and does not label papers by which definition they meet.
