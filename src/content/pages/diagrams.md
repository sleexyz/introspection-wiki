---
title: "Reading the diagrams"
summary: "Every experiment on this wiki is drawn the same way: five rows, read top to bottom, with one column for each thing being compared."
updated: 2026-10-06
---

An experiment diagram answers five questions in a fixed order. Once you can read one, you can read them all, and you can set two papers side by side and see where their methods differ.

## The five rows

Each diagram runs top to bottom through up to five stages, named in the left margin. A row is left out when an experiment has nothing to put there.

1. **Data.** What was built or collected, and what the experimenters know that the model is never told.
2. **Model.** Which model is studied and what was done to it: fine-tuning, freezing, injecting a vector, selecting which models to keep.
3. **Probe.** What the model is asked, or what is read from inside it.
4. **Score.** How raw outputs become numbers: a regression, a parser, a judge model.
5. **Compare.** The contrast that carries the claim, with the result.

## Columns

Columns are lanes: things that run in parallel and are then compared. Two kinds come up again and again.

- **Tracks.** What the model *does* next to what it *says about itself*.
- **Conditions.** A faithful model next to an unfaithful one, an injected trial next to a control, a model judging itself next to another model judging it.

A panel that spans the columns is shared by all of them. So reading across a row shows what differs between the lanes, and a spanning panel shows what was held the same.

## Kinds of box

Each box is one of ten kinds, marked by an icon, a label and a shape.

```experiment
title: Every kind of box
steps:
  - stage: data
    all:
      - { kind: data, title: "Data", text: "A dataset or a set of examples the experimenters built or collected." }
      - { kind: truth, title: "Ground truth", text: "Something the experimenters know and the model is never told. Dashed outline." }
  - stage: model
    all:
      - { kind: model, title: "Model", text: "The network being studied, with what state it is in." }
      - { kind: change, verb: "Fine-tune", title: "A change", text: "Anything done to a model or a pipeline. The label is the verb: fine-tune, freeze, inject, ablate, filter." }
  - stage: probe
    all:
      - { kind: prompt, title: "Prompt", quote: "The words given to the model, quoted.", tags: ["a condition worth noticing"] }
      - { kind: reply, title: "Reply", text: "What the model returns." }
      - { kind: read, title: "Readout", text: "A number read from inside the model, not from its text: an activation, an attribution score. Dotted outline." }
  - stage: score
    all:
      - { kind: judge, title: "Judge", text: "Whatever decides if an output counts: a parser, a rule, another model with a rubric. Double outline." }
      - { kind: measure, title: "Measure", text: "A quantity computed from the outputs, with its formula." }
  - stage: compare
    all:
      - { kind: result, title: "Result", value: "0.34", text: "The number, and what it is a number of." }
```

Small rounded tags under a box mark a condition that matters for reading the result, such as *separate context window* or *never trained on this*.

## Two colors

Color means one thing only: which side of the central comparison a box belongs to.

```experiment
lanes: [{ name: "Behavior", track: behavior }, { name: "Self-report", track: report }]
symbols: { "b": behavior, "r": report, "t": truth }
steps:
  - stage: probe
    cells:
      - items: [{ kind: prompt, title: "Blue: behavior", text: "What the model does. Choices, classifications, completions." }]
      - items: [{ kind: prompt, title: "Orange: self-report", text: "What the model says about itself." }]
  - stage: score
    cells:
      - items: [{ kind: measure, title: "A behavior quantity", text: "Written `b` wherever it appears." }]
      - items: [{ kind: measure, title: "A report quantity", text: "Written `r` wherever it appears." }]
  - stage: compare
    all:
      - { kind: result, title: "A formula shows what it joins", text: "`corr(b, r)` compares behavior with report. `corr(b, t)` compares behavior with ground truth, which is underlined with dashes." }
```

Everything else is drawn in the page's ordinary ink.

## Under each diagram

The caption states the finding in a sentence. Below it are the sections of the paper the diagram was drawn from, and which of [faithfulness](/concepts/faithfulness), [grounding](/concepts/grounding) and [privileged access](/concepts/privileged-access) the experiment bears on.

## For language models

A diagram is text all the way down. In the markdown twin of a page it appears as an outline with the same stages, lanes and labels, so nothing in it is lost to a reader that cannot see the page.
