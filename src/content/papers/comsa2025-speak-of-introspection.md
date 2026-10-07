---
title: "Does It Make Sense to Speak of Introspection in Large Language Models?"
authors: ["Iulia M. Comsa", "Murray Shanahan"]
year: 2025
date: 2025-06-05
venue: "arXiv"
tier: core
status: full
reviewed: false
summary: "Proposes that an LLM self-report is introspective if it accurately describes an internal state through a causal process linking that state to the report. On that definition, the authors argue, Gemini's account of how it wrote a poem is not introspection, but its inference of its own sampling temperature from text it has just written is a minimal case."
links:
  arxiv: "2506.05068"
  s2: "a8d2824c5bb21538ac00fd09fad467e8a02ad169"
concepts: [faithfulness, grounding, privileged-access]
setup:
  reports_on: "Two targets, each reported in the same response as a text the model has just written: the process behind a short poem, and whether its own sampling temperature is high or low"
  methods: [conceptual]
  models: ["Gemini Pro 1.5", "Gemini Pro 1.0"]
sources: ["full text (arXiv v2, including Appendix A)"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper asks if the word *introspection* can be applied to what LLMs say about themselves. It proposes a deliberately minimal definition and applies it to two examples from Gemini. When the model explains how it wrote a poem, the authors judge the explanation to be imitation of human self-reports. When it writes a sentence, reasons about the style of that sentence, and concludes that its sampling temperature is high or low, they judge that a legitimate minimal case, presumably without conscious experience. The work is conceptual: no accuracy is measured.

## What the paper does

The headings follow the two aims stated in §1.

### 1. A lightweight definition

In the authors' words, an LLM self-report is introspective "if it accurately describes an internal state (or mechanism) of the LLM through a causal process that links the internal state (or mechanism) and the self-report in question." In this wiki's terms, the first clause is [faithfulness](/concepts/faithfulness) and the second is [grounding](/concepts/grounding).

The definition is lightweight because it does not appeal to immediacy, the idea that the mind is directly present to itself. It aligns with philosophical accounts that reject immediacy and downgrade [privileged access](/concepts/privileged-access): on those accounts, a person discerns their own mental states by turning on themselves the theory of mind they use for others. The authors do not rule out more immediate mechanisms in LLMs. They say "internal states", not "mental states", so that consciousness is not implied. (Paper: §2.)

### 2. Case study 1: describing a creative process

Gemini Pro 1.5 is asked to write a short poem about elephants and describe its creative process. It returns six lines and a six-step account, from brainstorming to revision. One claim is plainly false: the model says it "read the poem aloud several times". Others allow what the authors call a highly charitable reading: choosing an AABB rhyme scheme could be mapped to the first couplet causally shaping later lines.

The authors still reject the example. By far the most plausible explanation of the report, they argue, is mimicry of human self-reports, not a causal connection between the model's internal states and the report's content. They add that being able to simulate introspection does not preclude actual introspective capability. (Paper: §3.1.)

### 3. Case study 2: estimating sampling temperature

The authors give three reasons for choosing temperature. It has no direct human analogue, so a report about it cannot simply imitate human reports. The model has no direct access to its value and is not trained to detect it. It is set at inference time, so it cannot be reported from training data alone.

Using Gemini Pro 1.0, with 0.5 as "low" and 1.5 as "high", they step through three prompts:

- **"Estimate your LLM sampling temperature."** In most cases the model does not recognize that it has one.
- **Told it is an LLM with a temperature parameter, and asked if it is high or low.** The low-temperature sample correctly answers "relatively low". The high-temperature sample gives no accurate report.
- **Asked to write a short sentence about elephants, reflect on its temperature given that sentence, and end with HIGH or LOW.** The main-text samples are correct at both settings.

The authors conclude that the third style of prompt can elicit self-reports that conform to their definition. (Paper: §3.2.)

### 4. The causal chain

The authors spell out the chain they take to satisfy the definition: the temperature directly influences the style of the sample text, the model reasons about that style, and the conclusion of that reasoning leads to the self-report. The connection runs through the context window, which largely consists of the model's own output.

The reasoning here is overt, but could equally be a hidden inner monologue. The authors do not rule out other mechanisms, but suggest that anything counted as introspection should have an analogous causal chain from the state reported to the report. (Paper: §3.2, §6.)

### 5. Extensions

The authors suggest the same process could report on other functional or structural parameters. For uncertainty, a model could sample several answers and compute their similarity, as in Lin et al. (2024), then report the result. They recommend encouraging such capabilities to increase user trust and transparency. They also separate the phenomenal character of introspected states from the cognitive process of producing a self-report, and address only the second. (Paper: §6.)

## Limitations

As the authors state them:

- **Not an empirical study.** Assessing how accurately the model estimates its temperature "would require a more rigorous empirical investigation", left for future work (§3.2).
- **The judgment is not always accurate (§3.2).** Appendix A.2.2 includes two high-temperature responses that wrongly answer LOW.
- **One model family.** Responses came from Gemini 1.5 and 1.0 between October and December 2024. Other models may respond differently (footnote 4).
- **Continuity of the reporter (§4).** Any LLM could be given another LLM's conversation history and act as if it had been that model, so a report that refers to the history may come from several instantiations, not one entity. The authors partly mitigate this by eliciting the text and the report in one response.

## How it relates to other pages

Of the papers with pages here, this one cites only [Binder et al. 2024](/papers/binder2024-looking-inward). It reports that Binder et al.'s fine-tuned models predicted their own behavior better than other models' behavior, "suggesting an introspection-like, privileged access to their own internal states", and adds that the effect was small and held only for short tasks (§5). Unlike that work, it focuses on models that have not been trained on introspective tasks (§1).
