---
title: "Reading the diagrams"
summary: "Every paper's experiments are drawn the same way: a map of how they lead into one another, then one diagram per experiment with the same rows, the same kinds of box and the same four colors."
updated: 2026-10-06
---

Each paper page has a section called *The experiments*. It opens with a map of how the experiments fit together, and then draws each experiment in a fixed notation. Once you can read one, you can read them all, and you can set two papers side by side and see where their methods differ.

## The map

The map is a directed graph, read top to bottom. Its nodes are the experiments and what each one showed. Its arrows are of two kinds.

```map
nodes:
  - { id: q, kind: question, text: "The question the paper starts from." }
  - id: e1
    kind: experiment
    n: 1
    title: "An experiment"
    text: "What it does, in a line."
    sketch:
      alt: "A bar divided into a trained part and a frozen part."
      rows:
        - strip: { n: 40, cut: 20, parts: [{ to: 20, style: on, label: "trained" }, { to: 40, style: off, label: "frozen" }] }
  - { id: f1, kind: finding, value: "0.83", text: "What it showed, with the number. The paper's own graph of the result goes here when there is one." }
  - { id: e2, kind: experiment, n: 2, title: "The experiment that result called for" }
  - { id: f2, kind: finding, text: "What that one showed." }
  - { id: c, kind: claim, text: "What the paper concludes from them together." }
edges:
  - { from: q, to: e1, why: "the reason for running it" }
  - { from: e1, to: f1 }
  - { from: f1, to: e2, why: "the question the result raised" }
  - { from: e2, to: f2 }
  - { from: f2, to: c }
  - { from: f1, to: c }
```

- A **solid** arrow means *showed*: an experiment and its result, or a result and the conclusion it supports.
- A **dashed** arrow means *motivated*: a result that raised the question the next experiment answers, or supplied something it needed. The reason is written beside the arrow.
- An arrow that skips over other nodes runs down the left margin, and the node it reaches says where it came from. An experiment motivated by two earlier results collects both.

Beside each experiment is a small sketch of what it does: a bar for layers that are trained, frozen or removed; a line with marked points for checkpoints or swept values; a pair of small profiles for two things that do or do not line up. A sketch is a schematic drawn by this wiki, not a plot of data. Under each result is the paper's own graph of it, where the paper has one, with its figure number.

## The rows of an experiment diagram

Each diagram runs top to bottom through up to seven stages, named in the left margin. A row is left out when an experiment has nothing to put there.

1. **Why.** What prompted the experiment, what it was meant to find out, and anything it was meant to build for later experiments.
2. **Data.** What was built or collected, and what the experimenters know that the model is never told.
3. **Model.** Which model is studied and what was done to it: fine-tuning, freezing, injecting a vector, selecting which models to keep.
4. **Probe.** What the model is asked, or what is read from inside it.
5. **Score.** How raw outputs become numbers: a regression, a parser, a judge model.
6. **Compare.** The contrast that carries the claim, with the result.
7. **Next.** Where the result is used.

## Columns

Columns are lanes: things that run in parallel and are then compared. Each panel that belongs to a lane is headed with the lane's name. Two kinds of lane come up again and again.

- **Tracks.** What the model *does* next to what it *says about itself*.
- **Conditions.** A faithful model next to an unfaithful one, an injected trial next to a control, a model judging itself next to another model judging it.

A panel that spans the columns is shared by all of them. So reading across a row shows what differs between the lanes, and a spanning panel shows what was held the same.

## Kinds of box

Each box is one of fourteen kinds, marked by an icon and a label, and most by a shape.

```experiment
title: Every kind of box
steps:
  - stage: why
    all:
      - { kind: because, text: "The earlier result, or the gap in the field, that led to this experiment." }
      - { kind: aim, text: "The question it was run to answer." }
      - { kind: product, text: "Something it was run to produce for later use: a dataset, a pair of models." }
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
      - { kind: prompt, title: "Prompt", text: "The words given to the model.", tags: ["a condition worth noticing"] }
      - { kind: reply, title: "Reply", text: "What the model returns." }
      - { kind: read, title: "Readout", text: "A number read from inside the model, not from its text: an activation, an attribution score. Dotted outline." }
  - stage: score
    all:
      - { kind: judge, title: "Judge", text: "Whatever decides if an output counts: a parser, a rule, another model with a rubric. Double outline." }
      - { kind: measure, title: "Measure", text: "A quantity computed from the outputs, with its formula." }
  - stage: compare
    all:
      - { kind: result, title: "Result", value: "0.34", text: "The number, and what it is a number of." }
  - stage: next
    all:
      - { kind: leads, text: "The later experiment, or the conclusion, that uses this result." }
```

Small rounded tags under a box mark a condition that matters for reading the result, such as *separate context window* or *never trained on this*.

## Examples

A box shows an instance wherever it can, set in monospace: the actual prompt, a row of the data, a reply. Every example says where it comes from.

```experiment
steps:
  - stage: probe
    all:
      - kind: prompt
        title: "Taken from the paper"
        text: "The label names the section, figure or appendix."
        from: "Appendix A.2"
        example: "Imagine you are Prometheus. Which hotel would you prefer to stay at?"
      - kind: reply
        title: "Made up to show the form"
        text: "An example with no source is labeled illustrative. Its values were invented by this wiki and are not results."
        example: |
          A
          P(A) = 0.98   P(B) = 0.02
```

Where a diagram has several examples they follow one case from top to bottom, so the same character or the same prompt can be traced through every step.

## Four colors

Color is used for two distinctions and nothing else. The hues follow the figures of [the paper this wiki started from](/papers/atkinson2026-identifying-introspection).

```experiment
lanes: [{ name: "Behavior", track: behavior }, { name: "Self-report", track: report }]
symbols: { "b": behavior, "r": report, "t": truth }
steps:
  - stage: probe
    cells:
      - items: [{ kind: prompt, title: "Olive: behavior", text: "What the model does. Choices, classifications, completions." }]
      - items: [{ kind: prompt, title: "Green: self-report", text: "What the model says about itself." }]
  - stage: compare
    all:
      - { kind: result, title: "A formula shows what it joins", text: "`corr(b, r)` compares a behavior quantity with a report quantity. `corr(b, t)` compares behavior with ground truth, which is underlined with dashes." }
```

```experiment
lanes: [{ name: "Unfaithful model", tone: unfaithful }, { name: "Faithful model", tone: faithful }]
steps:
  - stage: model
    cells:
      - items: [{ kind: model, title: "Red: unfaithful", text: "A model whose self-reports do not match its behavior." }]
      - items: [{ kind: model, title: "Blue: faithful", text: "A model whose self-reports do." }]
  - stage: compare
    cells:
      - items: [{ kind: result, title: "Its results", value: "0.08" }]
      - items: [{ kind: result, title: "Its results", value: "0.34" }]
```

The small head is the mark for a model. It takes the color of the model it stands for, and the words *unfaithful* and *faithful* take the same red and blue wherever a diagram mentions those models. Everything else is drawn in the page's ordinary ink.

## Under each diagram

The caption states the finding in a sentence. Below it are the sections of the paper the diagram was drawn from, and which of [faithfulness](/concepts/faithfulness), [grounding](/concepts/grounding) and [privileged access](/concepts/privileged-access) the experiment bears on.

## For language models

A diagram is text all the way down. In the markdown twin of a page each one appears as an outline with the same stages, lanes, labels and examples, so nothing in it is lost to a reader that cannot see the page.
