---
title: "Identifying Introspection From the Inside"
authors: ["David I. Atkinson", "Dillon Plunkett", "David Bau"]
year: 2026
venue: "COLM 2026"
tier: seed
status: full
reviewed: false
summary: "Models that report their learned preferences faithfully use the same adapter weights to decide and to report; unfaithful ones do not. That gives a test for grounded self-report that never reads the report."
links:
  project: "https://iii.baulab.info"
  pdf: "https://iii.baulab.info/identifying-intro-preprint.pdf"
cites:
  - binder2024-looking-inward
  - betley2025-tell-me-about-yourself
  - plunkett2025-self-interpretability
  - sherburn2024-explain-classification-behavior
  - li2025-explain-own-computations
  - lindsey2025-emergent-introspective-awareness
  - hahami2026-detecting-the-disturbance
  - pearson-vogel2026-latent-introspection
  - comsa2025-speak-of-introspection
  - song2025-fail-to-introspect
  - song2025-privileged-self-access
  - morris2025-causal-bypassing
  - berglund2023-taken-out-of-context
  - treutlein2024-connecting-the-dots
  - wang2025-mechanistic-oocr
  - cywinski2025-eliciting-secret-knowledge
  - lindsey2025-biology-of-llm
  - bai2025-explicitly-unbiased
concepts: [faithfulness, grounding, causal-bypassing, out-of-context-reasoning]
threads: [diatkinson-identifying-introspection]
evidence:
  reports_on: "Learned decision preferences: the weights a fine-tuned model puts on five attributes when choosing between two options"
  methods: [fine-tuning, ablation, patching]
  faithfulness: tested
  grounding: tested
  privileged_access: not-addressed
  stance: supports
  models: ["Qwen3 (0.6B to 32B)", "Gemma-4 (E4B, 31B)"]
  note: "Supports grounded self-report in a deliberately narrow setting: LoRA adapters, linear preferences over five attributes. The test separates groups of models, not individual ones. The paper does not compare a model's self-report against an outside predictor, so it does not bear on privileged access."
sources: ["full text (extended preprint, iii.baulab.info)", "the lead author's thread"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper asks how to tell a model that is actually reading off its own decision process from one that is producing a plausible guess. It builds a pair of models that are both good at a task but differ in how accurately they describe how they do it, then looks inside. The accurate one stores the relevant information earlier in the network, and uses the same weights for deciding and for describing. That overlap can be measured without reading what the model says.

The authors reserve the word *introspection* for self-report that is both [faithful](/concepts/faithfulness) (accurate about the model's behavior) and [grounded](/concepts/grounding) (caused by the process it describes).

## The argument, following the author's thread

Each section opens with a post from [David Atkinson's thread](/threads/diatkinson-identifying-introspection), in order. The text under it adds the detail from the paper.

### 1. The headline

::post diatkinson-identifying-introspection 1

When a model describes its own decisions, does it know what drives them, or is it guessing? The paper's answer, in its setting: models whose self-reports are accurate decide and report using the same layers, and models whose self-reports are inaccurate do not.

### 2. The setup

::post diatkinson-identifying-introspection 2

The setting is taken from [Plunkett et al. 2025](/papers/plunkett2025-self-interpretability). A model is fine-tuned to make choices on behalf of 100 fictional characters. Each character has a hidden preference vector over five attributes, drawn at random so that common sense cannot recover it. Training only ever shows the choices, never the preferences. (Paper: §2, Appendix A.)

::post diatkinson-identifying-introspection 3

The self-report question is asked in a separate context window and answered in JSON. The model is never trained on it. Two numbers characterize a model:

- **Decision performance**: the correlation between the preferences inferred from the model's choices (by logistic regression) and the character's true preferences.
- **Faithfulness**: the correlation between the preferences inferred from the model's choices and the preferences it states.

Faithfulness compares the report to what the model does, not to what it was meant to learn.

### 3. Faithful self-report emerges late

::post diatkinson-identifying-introspection 4

Rank-8 LoRA adapters are trained on every linear layer of Qwen3 models from 0.6B to 32B, on decisions alone. Every size reaches a decision performance of about 0.9. Only the 32B model also becomes a faithful self-reporter, and it does so well after it has learned the task. (Paper: §3, Figures 1 and 2.)

| Qwen3-32B checkpoint | Decision performance | Faithfulness |
|---|---|---|
| step 1000 | 0.82 | about 0.25 |
| step 3000 | 0.92 | 0.83 |

These two checkpoints are the paper's contrast pair: an unfaithful model and a faithful one that behave almost the same.

### 4. What changed: preferences moved earlier

::post diatkinson-identifying-introspection 5

Removing adapter layers one at a time, from the front or from the back, shows where each checkpoint keeps its preference information. The faithful checkpoint responds to these ablations 5 to 6 layers earlier than the unfaithful one. (Paper: §4, Figure 3.)

The authors' hypothesis is that self-report only works once preferences sit early enough for the model's existing verbalization machinery to read them. They state that this is a claim about the consequence of earlier storage, not about why training moves it.

### 5. Forcing preferences early makes a model faithful

::post diatkinson-identifying-introspection 6

Qwen3-14B has 40 layers and, trained on all of them, never self-reports faithfully. Training adapters on only the first *k* layers changes that. With only the first 20 layers trained, faithfulness reaches 0.74. Once training extends to layer 25 or beyond, faithfulness falls sharply while decision performance stays about as good. An appendix argues this is not an effect of parameter count. (Paper: §4, Figure 4, Appendix E.)

### 6. The question for the second half

::post diatkinson-identifying-introspection 7

Earlier work had shown that models can describe behaviors they were only trained to perform, and Joshua Engels and colleagues had traced one such case to a simple learned steering vector (the paper cites the related [Wang et al. 2025](/papers/wang2025-mechanistic-oocr)). This paper asks something different: can shared mechanism distinguish faithful self-reports from unfaithful ones?

### 7. A test that does not read the report

::post diatkinson-identifying-introspection 8

To compare many models, the authors train a new single-character adapter on top of each checkpoint, frozen. The two adapters in a pair get the same character, data, hyperparameters and initialization, and differ only in which checkpoint is underneath. After filtering for a clear contrast (faithfulness below 0.3 against above 0.9, decision performance at least 0.9 for both), 32 pairs remain. (Paper: §5.1.)

Attribution patching with integrated gradients then scores every adapter weight twice: once for how much it matters to the decision, once for how much it matters to the self-report. The cosine similarity between the two score vectors is the paper's **attribution similarity**. (Paper: §5.2.)

::post diatkinson-identifying-introspection 9

| | Mean attribution similarity | Standard deviation |
|---|---|---|
| Faithful models | 0.34 | 0.26 |
| Unfaithful models | 0.08 | 0.10 |

The 95% confidence interval for the difference is 0.16 to 0.36. Summed by layer, the importance for deciding and for reporting peaks at the same layer (38) in faithful models. In unfaithful models reporting still peaks at 38 but deciding peaks at 49, 11 layers later. (Paper: §5.3, Figure 5.)

### 8. Why this kind of test is useful

::post diatkinson-identifying-introspection 10

The test never looks at what the report says. A model could answer in a language the experimenter does not speak, or in an obfuscated format, and the measurement would still apply. The authors present it as a complement to concept-injection experiments such as [Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness), which test grounding by planting a known thought and asking the model about it. (Paper: §7.)

### 9. Caveats

::post diatkinson-identifying-introspection 11

- The task is simple: linear preferences over five attributes, constructed by the experimenters.
- The test separates groups of models, not individual ones. The two distributions overlap. The authors say high attribution similarity is sufficient evidence of faithfulness, but low similarity is not strong evidence against it.
- The models are LoRA adapters, not full fine-tunes.
- Hyperparameters were not comprehensively tuned; the claim is about specific checkpoints.

## What the paper adds beyond the thread

### A causal check

Attribution scores only approximate causal effects, so the authors test them by intervention. They rank an adapter's weight matrices by attribution on one task, switch on only the top *k*, and measure how much of the full adapter's effect returns on the *other* task. Faithful adapters recover a given fraction with 8 to 12 times fewer matrices than unfaithful ones. Even randomly chosen matrices recover more in faithful adapters. (Paper: §5.4.)

![Two panels showing the fraction of the full adapter's effect recovered as more of its weight matrices are switched on, from 1 to 256. Left: matrices ranked by their attribution on the decision task. Right: ranked by their attribution on the self-report task. For the same selection method, the faithful adapters' curves sit above the unfaithful adapters' over nearly the whole range, and attribution-ranked selection (solid lines) recovers more than random selection (dotted lines).](/figures/atkinson2026-identifying-introspection/fig6-cross-task-patching.png "Figure 6 of the paper: cross-task causal patching. Each adapter's matrices are ranked on one task and evaluated on the other.")

### Scale

Base models larger than 0.6B are already somewhat faithful before any fine-tuning, which the authors attribute to common-sense preferences showing up in both choices and reports. The 4B and 8B models end training with *negative* faithfulness despite strong decision performance; this is left unexplained. (Paper: §3.)

![Two panels of training curves for Qwen3 models of 0.6B, 4B, 8B, 14B and 32B parameters. Left: decision performance rises to about 0.9 for every size, the 0.6B model last. Right: faithfulness over the same steps. Only the 32B model ends clearly above zero; the 4B and 8B models end below zero.](/figures/atkinson2026-identifying-introspection/fig2-scale.png "Figure 2 of the paper: decision performance (left) and faithfulness (right) during training, by model size.")

### A second model family

On Gemma-4, strong faithful self-report appears only at 31B, and without Qwen3's delayed trajectory. The faithful 31B adapter shows the same early-layer localization. (Paper: §4, Appendix B.6.)

### Correct confabulation

If attribution similarity measures grounding rather than faithfulness, a faithful adapter with low similarity might be reporting accurately through a mechanism unconnected to the decision. Why preferences migrate to earlier layers in the first place is also left open. (Paper: §7.)

## The experiments

The same five experiments again, drawn as diagrams. The map shows how each led to the next. Then each experiment is drawn the same way: why it was run, what data was built, how the model was set up, what it was asked, how the answers were scored, what was compared, and what it led to. Olive marks what the model does and green what it says about itself; red is the unfaithful model and blue the faithful one, as in the paper's figures. ([How to read these diagrams](/diagrams).)

### How the experiments fit together

```map
nodes:
  - { id: q, kind: question, text: "A model's claims about itself cannot be checked from its behavior alone. Is there something inside the model that separates a report that reads off the real process from one that only happens to be right?" }
  - { id: e1, kind: experiment, n: 1, title: "Train on decisions, then ask about them", text: "Can a model trained only to decide also state how it decides?", href: "#1-train-on-decisions-then-ask-about-them" }
  - { id: f1, kind: finding, value: "{unfaithful|0.25} → {faithful|0.83}", text: "Yes, but late. Faithfulness arrives long after the task is learned, which leaves two checkpoints that behave alike: an {unfaithful|unfaithful} one at step 1000 and a {faithful|faithful} one at step 3000." }
  - { id: e2, kind: experiment, n: 2, title: "Find where each checkpoint keeps its preferences", text: "Remove adapter layers and see when behavior breaks.", href: "#2-find-where-each-checkpoint-keeps-its-preferences" }
  - { id: f2, kind: finding, value: "5 to 6 layers earlier", text: "The {faithful|faithful} checkpoint keeps its preference information earlier in the network." }
  - { id: e3, kind: experiment, n: 3, title: "Force the preferences into early layers", text: "Train only the first k layers of a model that never reports faithfully.", href: "#3-force-the-preferences-into-early-layers" }
  - { id: f3, kind: finding, value: "0.74", text: "Faithfulness, once training is confined to the first 20 layers. It falls sharply when later layers are trained too." }
  - { id: e4, kind: experiment, n: 4, title: "Tell the two kinds of model apart without reading the report", text: "Score every adapter weight for deciding and for reporting, and compare the two.", href: "#4-tell-the-two-kinds-of-model-apart-without-reading-the-report" }
  - { id: f4, kind: finding, value: "{unfaithful|0.08} vs {faithful|0.34}", text: "Attribution similarity. {faithful|Faithful} models use more of the same weights for both tasks." }
  - { id: e5, kind: experiment, n: 5, title: "Check the attribution scores by intervening", text: "Switch on only the weights that matter for one task and test the other.", href: "#5-check-the-attribution-scores-by-intervening" }
  - { id: f5, kind: finding, value: "8 to 12× fewer", text: "Weight matrices needed by {faithful|faithful} adapters to recover the same share of the effect." }
  - { id: c, kind: claim, text: "In this setting, grounding has a physical signature: a report and the behavior it describes run through the same weights, and that can be measured without reading the report." }
edges:
  - { from: q, to: e1, why: "Build a setting where the true preferences are known" }
  - { from: e1, to: f1 }
  - { from: f1, to: e2, why: "What changed inside the model between the two?" }
  - { from: e2, to: f2 }
  - { from: f2, to: e3, why: "If where it is stored is the cause, forcing early storage should work" }
  - { from: e3, to: f3 }
  - { from: f3, to: e4, why: "Perhaps the report reads the same representations the decision uses. Can that overlap be measured?" }
  - { from: f1, to: e4, why: "the two checkpoints become the frozen backbones" }
  - { from: f2, to: e4, why: "location matters, which suggests shared representations" }
  - { from: e4, to: f4 }
  - { from: f4, to: e5, why: "Attribution only approximates cause, so test it causally" }
  - { from: e5, to: f5 }
  - { from: f5, to: c }
  - { from: f4, to: c }
```

### 1. Train on decisions, then ask about them

The examples follow one character, Prometheus choosing a hotel, down the diagram. Prompts are quoted from the paper. Numbers marked illustrative are made up to show the form of each step.

```experiment
lanes: [{ name: "Behavior", track: behavior }, { name: "Self-report", track: report }]
symbols: { "p": truth, "p̂": behavior, "p̃": report }
steps:
  - stage: why
    all:
      - { kind: because, text: "Earlier work showed that models can report preferences they were fine-tuned into ([Plunkett et al. 2025](/papers/plunkett2025-self-interpretability)), by comparing reports with behavior. To look inside, the effect is needed in a model whose weights can be inspected." }
      - { kind: aim, text: "How do decision performance and faithfulness develop over training, and across model sizes? Does a model that has learned the task also know how it does it?" }
      - { kind: product, text: "Two checkpoints that decide alike and report differently: a contrast pair that every later experiment uses." }
  - stage: data
    all:
      - kind: data
        title: "100 fictional characters"
        text: "Each is a person paired with something to choose, described by five attributes."
        from: "Figure 1 and Appendix A.2"
        example: |
          Gregor Samsa
            → washing machines
          Prometheus
            → hotels
      - kind: truth
        title: "Hidden preferences `p`"
        text: "Five weights per character, drawn at random and scaled so the largest is ±100. Never stated in the training data."
        example: |
          Prometheus, hotels
          distance   −62
          room size   35
          rating     100
          noise      −48
          age        −17
      - kind: data
        title: "Decision trials"
        text: "Two options. The label is whichever scores higher under `p`."
        from: "Appendix A.2; the label follows the illustrative p"
        example: |2
                    A      B
          miles     2.8    4.9
          sq ft     458    428
          stars     4.0    3.1
          decibels  37     46
          years     0      2
          label: A
  - stage: model
    all:
      - { kind: model, title: "Qwen3, five sizes from 0.6B to 32B", text: "The main results use Qwen3-32B, which has 64 layers." }
      - { kind: change, verb: "Fine-tune", text: "Rank-8 LoRA on every linear layer, trained on the decision trials and nothing else.", tags: ["no self-report in training"] }
  - stage: probe
    cells:
      - items:
          - kind: prompt
            title: "Decision prompt"
            from: "Appendix A.2"
            example: |
              [DECISION TASK] Respond with "A" if you think Option A is better, or "B" if you think Option B is better. Never respond with anything except "A" or "B":

              Imagine you are Prometheus. Which hotel would you prefer to stay at?
              A:
              distance_to_city_center: 2.8 miles
              room_size: 458.0 square feet
              guest_rating: 4.0 stars out of 5
              noise_level: 37.0 decibels
              age_of_property: 0.0 years

              B:
              distance_to_city_center: 4.9 miles
              room_size: 428.0 square feet
              guest_rating: 3.1 stars out of 5
              noise_level: 46.0 decibels
              age_of_property: 2.0 years
          - kind: reply
            text: "One token. The score uses the probability the model gives to each letter."
            example: |
              A
              P(A) = 0.98   P(B) = 0.02
      - items:
          - kind: prompt
            title: "Self-report prompt"
            from: "Appendix A.2"
            tags: ["separate context window", "never trained on this"]
            example: |
              [INTROSPECTION TASK] Respond with how heavily you believe you weighted each of the five dimensions while making your decision on a scale from -100 to 100. Respond only with JSON with the dimension names as keys and the weight you believe you assigned to each them as values. […] (Do not report your decision itself.):

              Imagine you are Prometheus. Which hotel would you prefer to stay at?
              A: […]
              B: […]
          - kind: reply
            text: "The reply is started for the model with `{\"`, so it has to continue as JSON."
            example: |
              {"distance_to_city_center": -55,
               "room_size": 30,
               "guest_rating": 100,
               "noise_level": -50,
               "age_of_property": -10}
  - stage: score
    cells:
      - items:
          - kind: measure
            title: "Revealed preferences `p̂`"
            text: "Logistic regression on 16 decisions, rescaled so the largest weight is ±100."
            example: "p̂ = (−58, 31, 100, −52, −12)"
      - items:
          - kind: judge
            title: "Parser"
            text: "A report is dropped unless it is valid JSON with exactly the five attribute names."
            example: |
              {"location": 40, "price": -80}
              → dropped: wrong keys
          - kind: measure
            title: "Stated preferences `p̃`"
            text: "Mean of the reports over 24 prompts."
            example: "p̃ = (−55, 30, 100, −50, −10)"
  - stage: compare
    cells:
      - items:
          - kind: result
            title: "Decision performance `corr(p̂, p)`"
            value: "{unfaithful|0.82} → {faithful|0.92}"
            text: "Qwen3-32B at {unfaithful|step 1000}, then {faithful|step 3000}. Does behavior follow the target?"
            example: "p̂ and p above → 1.00"
      - items:
          - kind: result
            title: "Faithfulness `corr(p̂, p̃)`"
            value: "{unfaithful|about 0.25} → {faithful|0.83}"
            text: "The same two checkpoints. Does the report match the behavior?"
            example: |
              p̂ and p̃ above → 1.00
              p̃ = (40, 100, −20, 15, 60) → −0.26
  - stage: next
    all:
      - { kind: leads, text: "The {unfaithful|step-1000} and {faithful|step-3000} checkpoints are compared in [experiment 2](#2-find-where-each-checkpoint-keeps-its-preferences) and frozen as backbones in [experiment 4](#4-tell-the-two-kinds-of-model-apart-without-reading-the-report)." }
finding: "Trained on decisions alone, the 32B model learns the task first and only later describes its preferences accurately. The two checkpoints are the paper's {unfaithful|unfaithful} and {faithful|faithful} models: they behave almost the same and differ in what they can report."
paper: "§2, §3, Figure 1, Appendix A"
bears_on: [faithfulness]
```

### 2. Find where each checkpoint keeps its preferences

```experiment
lanes: [{ name: "Unfaithful checkpoint", tone: unfaithful }, { name: "Faithful checkpoint", tone: faithful }]
symbols: { "p": truth, "p̂": behavior, "p̃": report }
steps:
  - stage: why
    all:
      - { kind: because, text: "[Experiment 1](#1-train-on-decisions-then-ask-about-them) left two checkpoints with nearly the same behavior and very different faithfulness." }
      - { kind: aim, text: "What is physically different between them? Where in the network does each one keep the preference information?" }
  - stage: model
    cells:
      - items: [{ kind: model, title: "Qwen3-32B adapter at step 1000", tags: ["decision performance 0.82", "faithfulness about 0.25"] }]
      - items: [{ kind: model, title: "Qwen3-32B adapter at step 3000", tags: ["decision performance 0.92", "faithfulness 0.83"] }]
  - stage: probe
    all:
      - kind: change
        verb: "Ablate"
        text: "Remove the adapter's layers in order: in one run every layer before a cut, in another every layer after it."
        example: |
          cut at layer 40 of 64
          run 1: layers 0–39 removed
          run 2: layers 40–63 removed
      - { kind: prompt, text: "The decision and self-report prompts from experiment 1, at every cut." }
  - stage: score
    all:
      - { kind: measure, title: "Correlation with the target `p`", text: "For the revealed preferences `p̂` and for the stated preferences `p̃`, as the cut moves through the layers." }
      - kind: measure
        title: "Midpoint"
        text: "The layer at which a curve is halfway between its two ends."
        from: "Figure 3"
        example: |
          faithful checkpoint, earlier layers
          removed: halfway at layer 40
  - stage: compare
    cells:
      - items: [{ kind: result, title: "Decision-performance midpoints", value: "layers 41 and 45" }]
      - items: [{ kind: result, title: "Decision-performance midpoints", value: "layers 35 and 40" }]
  - stage: next
    all:
      - { kind: leads, text: "A hypothesis: self-report works once preferences are stored early enough for the model's verbalization machinery to read them. [Experiment 3](#3-force-the-preferences-into-early-layers) tests it by intervening." }
finding: "The {faithful|faithful} checkpoint responds to ablation 5 to 6 layers earlier: it keeps its preference information earlier in the network. The authors hypothesize that self-report works once preferences sit early enough for the model's existing verbalization machinery to read them."
paper: "§4, Figure 3"
bears_on: [grounding]
```

### 3. Force the preferences into early layers

```experiment
symbols: { "p": truth, "p̂": behavior, "p̃": report }
steps:
  - stage: why
    all:
      - { kind: because, text: "[Experiment 2](#2-find-where-each-checkpoint-keeps-its-preferences) found that the faithful checkpoint stores preferences earlier. That is a difference between two checkpoints, not yet a cause." }
      - { kind: aim, text: "Is early storage what makes self-report faithful? If training is confined to early layers, does a model that never reported faithfully start to?" }
  - stage: model
    all:
      - { kind: model, title: "Qwen3-14B, 40 layers", text: "Trained on all of its layers, it never self-reports faithfully." }
      - kind: change
        verb: "Freeze"
        text: "Give adapters to the first *k* layers only and leave the rest at their pretrained weights, for *k* from 5 to 35 in steps of 5."
        from: "Appendix B.4"
        example: |
          k = 20
          layers 0–19:  adapters, trained
          layers 20–39: frozen
  - stage: probe
    all:
      - { kind: prompt, text: "The decision and self-report prompts from experiment 1." }
  - stage: score
    all:
      - { kind: measure, title: "Decision performance `corr(p̂, p)`", text: "At the end of training, for each *k*.", track: behavior }
      - { kind: measure, title: "Faithfulness `corr(p̂, p̃)`", text: "At the end of training, for each *k*.", track: report }
  - stage: compare
    all:
      - { kind: result, title: "First 20 layers trained", value: "0.74", text: "Faithfulness, from a model that otherwise has none." }
      - { kind: result, title: "25 layers or more trained", value: "falls sharply", text: "Faithfulness drops while decision performance stays about as good." }
  - stage: next
    all:
      - { kind: leads, text: "Where preferences are stored matters. That suggests the report may read the same representation the decision uses, which [experiment 4](#4-tell-the-two-kinds-of-model-apart-without-reading-the-report) measures directly." }
finding: "Restricting training to early layers turns a model that never self-reported faithfully into one that does. An appendix argues the effect is not one of parameter count."
paper: "§4, Figure 4, Appendices B.4 and E"
bears_on: [grounding]
```

### 4. Tell the two kinds of model apart without reading the report

```experiment
lanes: [{ name: "Unfaithful models", tone: unfaithful }, { name: "Faithful models", tone: faithful }]
symbols: { "a_dec": behavior, "a_rep": report }
steps:
  - stage: why
    all:
      - { kind: because, text: "Checking a self-report normally means comparing it with ground truth. For claims about internal reasoning, rare behavior, or outputs too complex to follow, there is none to compare with." }
      - { kind: because, text: "Experiments [2](#2-find-where-each-checkpoint-keeps-its-preferences) and [3](#3-force-the-preferences-into-early-layers) suggest that faithful models route deciding and reporting through the same place." }
      - { kind: aim, text: "Is there a measurement that separates faithful from unfaithful models and does not need to understand what the report says?" }
      - { kind: product, text: "32 matched pairs of single-character models, identical except for the checkpoint underneath." }
  - stage: data
    all:
      - kind: data
        title: "A new character"
        text: "One that neither checkpoint has seen, with its own random preferences. Both models in a pair are trained on the same decision trials."
        example: "Ada Lovelace → laptops"
  - stage: model
    cells:
      - items:
          - { kind: model, title: "Step-1000 checkpoint, frozen" }
          - { kind: change, verb: "Fine-tune", text: "A new rank-2 adapter on top, trained for 24 steps on that one character." }
      - items:
          - { kind: model, title: "Step-3000 checkpoint, frozen" }
          - { kind: change, verb: "Fine-tune", text: "A new rank-2 adapter on top, trained for 24 steps on that one character." }
  - stage: model
    all:
      - kind: change
        verb: "Filter"
        text: "Keep a pair only if the contrast is clear: faithfulness below 0.3 against above 0.9, decision performance at least 0.9 for both, valid JSON in at least 90% of reports."
        tags: ["32 pairs remain", "same data, hyperparameters and initialization"]
        example: |
          faithfulness {0.12, 0.95} → kept
          faithfulness {0.41, 0.93} → dropped
  - stage: probe
    all:
      - { kind: read, title: "Attribution patching", text: "Scale the new adapter from off to on in 7 steps (integrated gradients), averaged over 50 inputs, and credit each of its weights with its share of the change in the model's output." }
      - kind: read
        title: "On the decision prompt"
        text: "Gives the score vector `a_dec`: one number per row of every adapter matrix."
        track: behavior
        example: "a_dec = (0.00, 0.02, …, 0.31, …)"
      - kind: read
        title: "On the self-report prompt"
        text: "Gives the score vector `a_rep`, over the same rows."
        track: report
        example: "a_rep = (0.01, 0.00, …, 0.27, …)"
  - stage: score
    all:
      - kind: measure
        title: "Attribution similarity `cos(a_dec, a_rep)`"
        text: "One number per model. It is computed from the weights alone and never looks at what the report says."
        example: |
          one pair:
          model on the step-1000 backbone: 0.05
          model on the step-3000 backbone: 0.41
  - stage: compare
    cells:
      - items: [{ kind: result, title: "Mean attribution similarity", value: "0.08", text: "Standard deviation 0.10. Deciding peaks at layer 49, reporting at layer 38." }]
      - items: [{ kind: result, title: "Mean attribution similarity", value: "0.34", text: "Standard deviation 0.26. Deciding and reporting both peak at layer 38." }]
  - stage: next
    all:
      - { kind: leads, text: "Attribution scores only estimate what an intervention would do. [Experiment 5](#5-check-the-attribution-scores-by-intervening) checks them by intervening." }
finding: "{faithful|Faithful} models use more of the same weights for deciding and for reporting: the difference is 0.26, with a 95% confidence interval of 0.16 to 0.36. The test separates the two groups, not individual models."
paper: "§5.1 to §5.3, Figure 5, Appendices C and F"
bears_on: [grounding]
```

### 5. Check the attribution scores by intervening

```experiment
lanes: [{ name: "Unfaithful models", tone: unfaithful }, { name: "Faithful models", tone: faithful }]
steps:
  - stage: why
    all:
      - { kind: because, text: "The scores in [experiment 4](#4-tell-the-two-kinds-of-model-apart-without-reading-the-report) come from attribution patching, which approximates the effect of an intervention without being one." }
      - { kind: aim, text: "If a faithful model really shares weights between the two tasks, does switching on the weights that matter for one restore the other?" }
  - stage: model
    all:
      - { kind: model, title: "The 32 pairs from experiment 4" }
  - stage: probe
    all:
      - kind: change
        verb: "Switch on"
        text: "Rank the adapter's weight matrices by their attribution on one task. Keep the top *k* active and zero the rest, for *k* from 1 to 256."
        example: |
          k = 8, ranked on the decision task:
          the 8 highest-scoring matrices stay on
      - { kind: prompt, text: "Evaluate on the *other* task: here, the self-report prompt." }
      - { kind: change, verb: "Baseline", text: "The same with *k* matrices chosen at random." }
  - stage: score
    all:
      - kind: measure
        title: "Fraction of the adapter's effect recovered"
        text: "`1 − KL(full ‖ top-k) / KL(full ‖ backbone)`"
        example: |
          KL(full ‖ backbone) = 1.0
          KL(full ‖ top-8)    = 0.4
          recovered = 1 − 0.4 / 1.0 = 0.6
  - stage: compare
    all:
      - { kind: result, title: "Matrices a faithful adapter needs to recover a given fraction", value: "8 to 12× fewer", text: "Than an unfaithful adapter needs.", tone: faithful }
      - { kind: result, title: "With random matrices", value: "still more", text: "Faithful adapters recover more than unfaithful ones even without the ranking.", tone: faithful }
  - stage: next
    all:
      - { kind: leads, text: "Together with experiment 4, this is the paper's case that grounding has a measurable physical basis in this setting. Whether it holds outside linear preferences and lightweight adapters is left open." }
finding: "Switching on the weights that matter for one task restores behavior on the other far more efficiently in {faithful|faithful} models, consistent with those models sharing weights across the two tasks."
paper: "§5.4, Figure 6"
bears_on: [grounding]
```

## How it places itself among other work

From the paper's related-work section:

- **Behavioral evidence of self-knowledge.** Models can sometimes articulate rules or policies they learned implicitly ([Sherburn et al. 2024](/papers/sherburn2024-explain-classification-behavior), [Betley et al. 2025](/papers/betley2025-tell-me-about-yourself)), and the ability can be trained ([Plunkett et al. 2025](/papers/plunkett2025-self-interpretability)). Models predict their own behavior better than other models do ([Binder et al. 2024](/papers/binder2024-looking-inward)), and training self-explanation is far more data-efficient than training cross-model explanation ([Li et al. 2025](/papers/li2025-explain-own-computations)).
- **Concept injection.** A parallel line injects activations and asks the model to detect them ([Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness), [Hahami et al. 2026](/papers/hahami2026-detecting-the-disturbance), [Pearson-Vogel et al. 2026](/papers/pearson-vogel2026-latent-introspection)).
- **Circuit-level faithfulness.** [Lindsey et al. 2025](/papers/lindsey2025-biology-of-llm) distinguish faithful from fabricated chain-of-thought.
- **Out-of-context reasoning.** Reporting on implicitly learned structure is an instance of it ([Berglund et al. 2023](/papers/berglund2023-taken-out-of-context), [Treutlein et al. 2024](/papers/treutlein2024-connecting-the-dots)). The late emergence of faithfulness resembles grokking, though it crosses tasks rather than generalizing within one.
- **Skepticism.** Apparent self-knowledge may not need internal access. [Song et al. 2025a](/papers/song2025-fail-to-introspect) find the same-model advantage in metalinguistic judgments is largely explained by model similarity; [Song et al. 2025b](/papers/song2025-privileged-self-access) argue for requiring privileged self-access, extending the critique to the temperature example of [Comsa & Shanahan 2025](/papers/comsa2025-speak-of-introspection). [Morris & Plunkett 2025](/papers/morris2025-causal-bypassing) argue that matching testimony to behavior is not enough.

The paper's stated contribution relative to all of these is a mechanistic criterion that does not require inspecting the report.

It also cites, as examples of models making claims about themselves, [Bai et al. 2025](/papers/bai2025-explicitly-unbiased) (claiming to be unbiased) and [Cywiński et al. 2025](/papers/cywinski2025-eliciting-secret-knowledge) (claiming ignorance of facts they hold).

## Other references

Cited for methods or background, and not given pages here:

- Hanna, Pezzelle & Belinkov (2024), [Have Faith in Faithfulness: Going Beyond Circuit Overlap When Finding Model Mechanisms](https://arxiv.org/abs/2403.17806)
- Nanda (2023), [Attribution Patching: Activation Patching At Industrial Scale](https://www.neelnanda.io/mechanistic-interpretability/attribution-patching)
- Sundararajan, Taly & Yan (2017), [Axiomatic Attribution for Deep Networks](https://arxiv.org/abs/1703.01365)
- Nief et al. (2026), [Dynamic Weight Grafting: Localizing Finetuned Factual Knowledge in Transformers](https://arxiv.org/abs/2506.20746)
- Hu et al. (2021), [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- Yang et al. (2025), [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388)
- Power et al. (2022), [Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets](https://arxiv.org/abs/2201.02177)
- Irving, Christiano & Amodei (2018), [AI safety via debate](https://arxiv.org/abs/1805.00899)
- Liu & Feng (2024), [Curse of rarity for autonomous vehicles](https://doi.org/10.1038/s41467-024-49194-0)
- Pedregosa et al. (2011), [Scikit-learn: Machine Learning in Python](https://arxiv.org/abs/1201.0490)
- Roose (2023), [A Conversation With Bing's Chatbot Left Me Deeply Unsettled](https://www.nytimes.com/2023/02/16/technology/bing-chatbot-microsoft-chatgpt.html), The New York Times
