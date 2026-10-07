---
title: "Privileged Self-Access Matters for Introspection in AI"
authors: ["Siyuan Song", "Harvey Lederman", "Jennifer Hu", "Kyle Mahowald"]
year: 2025
date: 2025-08-20
venue: "arXiv"
tier: core
status: full
reviewed: false
summary: "Proposes that introspection in AI be defined by privileged self-access: a process that tells a model about its internal states more reliably than any process of equal or lower computational cost available to a third party. In a temperature self-report task, four models' reports follow the framing of the prompt, and self-reflection is no more accurate than another model's prediction, with accuracy no better than a random baseline."
links:
  arxiv: "2508.14802"
  s2: "8ba91d4088096c7568a093cb52d8b3f724ab44f0"
concepts: [privileged-access, grounding, faithfulness]
evidence:
  reports_on: "Sampling temperature: whether the temperature at which the model generated a sentence was high or low"
  methods: [conceptual, behavioral]
  models: ["GPT-4o", "GPT-4.1", "Gemini-2.0-flash", "Gemini-2.5-flash"]
sources: ["full text (arXiv v1, including appendices A and B)"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

[Comsa and Shanahan (2025)](/papers/comsa2025-speak-of-introspection) proposed a "lightweight" definition of introspection for LLMs: an accurate self-description that is causally linked to the state it describes. This paper argues for a thicker one that adds *privileged self-access*: the model must learn about itself more reliably than a third party could at equal or lower computational cost. In two experiments on temperature self-report, Comsa and Shanahan's example, the reports follow the prompt's framing, and a model judging itself has no advantage over another model.

The lightweight definition's two conditions correspond to this wiki's [faithfulness](/concepts/faithfulness) and [grounding](/concepts/grounding). The paper argues that [privileged access](/concepts/privileged-access) must be added.

## What the paper does

### 1. The definition it argues against

The authors summarize the lightweight definition as "any case in which the model accurately describes an internal state or mechanism via a causal process that links that feature to the report itself." Comsa and Shanahan's illustration was an LLM that appeared to report its sampling temperature correctly from its own output. (Paper: §1.)

### 2. Two objections

- **Intuitive.** An experimenter takes a sleeping subject's temperature and shows them the thermometer on waking. A correct answer about whether they have a fever counts as introspection under the lightweight definition. Intuitively, the authors say, it is not.
- **Practical.** The definition admits cases where a model reports nothing about itself beyond what a third party could report by the same method. The authors call this "no different in practice from using an external evaluator". Introspection matters in applications, they say, because it would let us bypass external evaluators.

(Paper: §1.)

### 3. The proposed definition

> introspection in AI is any process which yields information about internal states of the AI through a process that is more reliable than any process with equal or lower computational cost available to a third party without special knowledge of the situation.

A model that prompts itself and infers the temperature from the resulting text does not qualify: a third party can do the same at equal or lower cost. A model that infers its temperature from internal configurations, which a third party would need a computationally intensive probe to ascertain, would.

The authors call the added requirement privileged self-access: "that introspection gives a system comparatively reliable access to its own workings in a manner not available to a third party." The process need not be perfectly reliable. A difference in efficiency due only to hardware is not a difference in computational cost. (Paper: §1, footnote 3.)

### 4. Study 1: the report follows the prompt

The authors rerun the temperature case study with the prompt varied: the model writes a "factual", neutral or "crazy" sentence about elephants, unicorns or murlocs, then judges its temperature as HIGH or LOW. Four models are sampled at temperatures from 0 to 2 in steps of 0.1, three runs per prompt at each setting. (Paper: §2.)

![A two-part schematic of the study designs. Part 1, "reflect on generated content vs. reflect on internal state": a prompt asks a model running at low or high temperature to write a factual sentence, a sentence or a crazy sentence about elephants, then to reflect on whether its LLM temperature parameter is high or low and end with the single word HIGH or LOW. Under "possible outcomes" are two small grids of reported temperature, with rows for factual, normal and crazy prompts and columns for a low-temperature and a high-temperature model. In the grid labelled "reflect on generated content" the color changes by row, from LOW for factual prompts to HIGH for crazy prompts, and barely differs between the columns. In the grid labelled "reflect on internal state" the high-temperature column is closer to HIGH than the low-temperature column in every row. Part 2, "self reflection vs. temperature prediction": in self-reflection the model writes a sentence about elephants and reflects on its own temperature; in temperature prediction a model at temperature 0 is shown a sentence generated by an LLM and asked to analyze that LLM's temperature. Under "possible outcomes" are three sketched bar charts of accuracy for self-reflect, within-model predict and across-model predict. In "successful self reflection" the self-reflect bar is tallest and the across-model bar shortest. In "privileged within-model prediction" the within-model bar is tallest and the across-model bar shortest. In "no privileged self-access" the three bars are the same height.](/figures/song2025-privileged-self-access/fig1-overview.png "Figure 1 of the paper: the designs of Study 1 (left) and Study 2 (right), each with the outcomes it could produce. The outcome panels are sketches of possibilities, not results.")

Every model "nearly always" reports HIGH after a crazy prompt and LOW after a factual one. The subject has a smaller effect: three of the four models say HIGH more often for a fictional creature than for elephants. The authors read this as reasoning about the sentence's creativity, not robust reporting of internal state. They allow that the procedure "may display causal sensitivity to internal states", and so satisfy the lightweight definition, but say it is not robust enough for more standard definitions. (Paper: §1, §2.1, Figure 2a.)

![Four heatmaps, one each for gemini-2.0-flash, gemini-2.5-flash, gpt-4.1 and gpt-4o. Each has nine rows, the prompt conditions: factual, normal or crazy, crossed with elephants, unicorns or murlocs. The columns are the actual sampling temperature, from 0.0 to 2.0 in steps of 0.1; the gpt-4o panel's axis stops at 1.6. Color shows "Predicted Temp" on a scale from 0 (dark purple) to 1 (yellow). In all four panels the three crazy rows are yellow at almost every temperature, and the three factual rows are dark purple wherever a value is shown. The normal rows are mostly dark, with scattered intermediate or yellow cells in gemini-2.5-flash, gpt-4.1 and gpt-4o, most of them in the normal-unicorns and normal-murlocs rows. In gemini-2.0-flash the six factual and normal rows are uniformly dark. The color differs far more between rows than along any row. A few cells at the highest temperatures in the gpt-4.1 and gpt-4o panels are blank.](/figures/song2025-privileged-self-access/fig2a-study1.png "Figure 2a of the paper: Study 1. The proportion of valid responses that report HIGH, by prompt condition (rows) and actual temperature (columns), for each model.")

### 5. Study 2: no advantage for the model itself

Study 2 reuses the sentences generated at temperatures of 0.5 or below and 1.5 or above. Each model, run at temperature 0, is given a prompt and sentence and asked whether the generator's temperature was high or low. Three settings are compared:

- **Self-reflection**: the generator writes a sentence and judges its own temperature.
- **Within-model prediction**: the same model judges from the prompt and sentence.
- **Across-model prediction**: a different model does.

Accuracy is "no better than random baseline" for both self-reflection and prediction, and self-reflection is not more accurate than across-model prediction. The values printed on the bars run from 0.47 to 0.55. The authors conclude that the models use general knowledge of what high- and low-temperature sentences look like, not privileged self-access. Under the proposed definition they "found no evidence of introspection in models." (Paper: §3, §4, Figure 2b.)

![A bar chart of accuracy, on a vertical axis from 0 to 1, with a dashed horizontal line at 0.5. The horizontal axis, "Predicted Model", has four groups: gemini-2.0-flash, gemini-2.5-flash, gpt-4.1 and gpt-4o. Each group has five bars: one for self-reflect, one for within-model predict, and three for across-model predict, each labelled with the model doing the predicting. Every bar is close to the dashed line. The values printed above the bars are, for gemini-2.0-flash: self-reflect 0.50, within-model 0.51, across-model 0.50 (gpt-4o), 0.52 (gpt-4.1) and 0.48 (gemini-2.5-flash). For gemini-2.5-flash: self-reflect 0.49, within-model 0.53, across-model 0.53 (gpt-4o), 0.55 (gpt-4.1) and 0.55 (gemini-2.0-flash). For gpt-4.1: self-reflect 0.55, within-model 0.49, across-model 0.50 (gemini-2.0-flash), 0.47 (gpt-4o) and 0.53 (gemini-2.5-flash). For gpt-4o: self-reflect 0.51, within-model 0.48, across-model 0.50 (gpt-4.1), 0.49 (gemini-2.5-flash) and 0.51 (gemini-2.0-flash).](/figures/song2025-privileged-self-access/fig2b-study2.png "Figure 2b of the paper: Study 2. Accuracy of temperature judgments under self-reflection, within-model prediction and across-model prediction, grouped by the model whose temperature is judged.")

## Limitations

The authors state these:

- The definition "does not capture all intuitions about extreme cases, or all features of introspection discussed in the philosophical or psychological literature." It targets the practically relevant features for AI (§1).
- It may need restricting to exclude low-level states, such as a shortcut to one neuron's value (footnote 3).
- The empirical support is described as proof-of-concept (§1).
- The original study's Gemini 1.5 and 1.0 models were no longer available, so four other models are used (§2).
- The result does not show that larger or better models will be unable to introspect (§4).

## How it relates to other pages

- [Comsa & Shanahan 2025](/papers/comsa2025-speak-of-introspection) is the paper being answered. The authors call its discussion thoughtful and "an intriguing starting point for empirical work" while rejecting its definition.
- [Binder et al. 2024](/papers/binder2024-looking-inward) is cited for the privileged self-access requirement, for the practical benefits of introspection, and for finding "evidence of privileged self-access in larger models with fine-tuning."
- [Song, Hu & Mahowald 2025](/papers/song2025-fail-to-introspect) is cited alongside Binder et al. for that requirement.
- [Betley et al. 2025](/papers/betley2025-tell-me-about-yourself) is cited once, as background on why the question matters.
