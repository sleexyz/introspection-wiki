---
title: "Latent Introspection: Models Can Detect Prior Concept Injections"
authors: ["Theia Pearson-Vogel", "Martin Vanek", "Raymond Douglas", "Jan Kulveit"]
year: 2026
date: 2026-02-23
venue: "arXiv"
tier: core
status: stub
reviewed: false
summary: "Qwen2.5-Coder-32B carries information about a concept vector that was injected during an earlier turn and then removed, including which concept it was. The signal peaks around layers 58 to 62, is weakened by the final layers, and reaches the output only under some prompts: with a document explaining introspection, P(\"yes\") is 39.9% with injection and 0.8% without."
links:
  arxiv: "2602.20031"
  s2: "9c234df514c32f74aeabf2f9fc10d5a34cf7ec7e"
  code: "https://github.com/acsresearch/latent-introspection-code"
concepts: [faithfulness, grounding, privileged-access, concept-injection]
threads: [voooooogel-latent-introspection]
added: 2026-10-06
updated: 2026-10-07
---
