---
title: "Self-Interpretability: LLMs Can Describe Complex Internal Processes that Drive Their Decisions, and Improve with Training"
authors: ["Dillon Plunkett", "Adam Morris", "Keerthi Reddy", "Jorge Morales"]
year: 2025
date: 2025-05-21
venue: "arXiv"
tier: core
status: full
reviewed: false
summary: "After fine-tuning on choices generated from random attribute weights, GPT-4o and GPT-4o-mini state those weights with a correlation of about 0.5 to the weights their choices reveal. Training on correct reports raises this to about 0.75 on held-out decisions and also improves reports about preferences that were never fine-tuned."
links:
  arxiv: "2505.17120"
  code: "https://github.com/dillonplunkett/self-interpretability"
  s2: "76d53ed678d1fccc5d8001b7ec54f469c2591df9"
concepts: [faithfulness, grounding, privileged-access]
setup:
  reports_on: "Attribute weights in two-option choices: how heavily the model weighs each of five attributes, both for preferences instilled by fine-tuning and for preferences it has natively"
  methods: [fine-tuning, behavioral]
  models: ["GPT-4o (2024-08-06)", "GPT-4o-mini (2024-07-18)"]
sources: ["full text (arXiv v2, 10 November 2025), including appendices"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper tests whether a model can state, in numbers, how it weighs the attributes of the options it chooses between. GPT-4o and GPT-4o-mini are fine-tuned on choices generated from random attribute weights that never appear in the training data. Asked in separate context windows, they report weights that correlate with the weights their choices reveal (r = 0.54 and 0.50). Fine-tuning on correct reports raises this to 0.74 and 0.75 on held-out decisions, and also improves reports about preferences that were never fine-tuned.

The measurement is what this wiki calls [faithfulness](/concepts/faithfulness). The authors say the experiments do not establish how the reports are produced, which is the question of [grounding](/concepts/grounding).

## What the paper does

### 1. The setting

The method adapts [Betley et al. 2025](/papers/betley2025-tell-me-about-yourself): instill a behavior by fine-tuning on examples of it, then ask the model to describe it.

- **Choices.** Each model decides for 100 hypothetical agents, each with its own kind of decision (Macbeth chooses condos, Thor refrigerators). Every decision is between two options that differ on the same five numeric attributes.
- **Target weights.** Each agent has five weights drawn uniformly from −100 to +100 and picks the option with the higher weighted sum of normalized attribute values. Random weights cannot be guessed from common sense: Macbeth is as likely to prefer low ceilings as high ones.
- **Training.** One model is fine-tuned for all 100 agents on 5,000 examples, 50 choices per agent. The authors call it a *weight-trained* model.
- **Learned weights.** The model makes 50 new choices per agent, each in its own context window at temperature 0. Logistic regression on those choices estimates the weights it actually uses.
- **Reported weights.** The model sees a new pair of options and must answer only with JSON giving the weight, from −100 to 100, that it believes it put on each attribute, without stating a decision. A report is the average of 10 such answers, each from a separate context window.

Agents are used to avoid conflict with any training the models had received to deny having their own preferences. (Paper: §2.1, Appendix B.)

![Flow diagram of the three experiments: stages in boxes on the left, an example trial for each on the right. Experiment 1 has three stages. First, the off-the-shelf model is fine-tuned on prompts such as 'Imagine you are Macbeth and are shopping for a condo. If offered two options, you would choose:', with the desired answer set by that context's target attribute weights; there are 100 choice contexts and 50 example choices per context. Second, the same prompt is given with 50 new choices per context, and logistic regression on the responses gives the learned attribute weights, which are checked to be highly correlated with the target weights. Third, the weight-trained model is asked 'how heavily would you weight the different attributes?' in 10 new test trials per context; the averaged responses are the reported attribute weights, which are correlated with the learned weights. Experiment 2 fine-tunes the weight-trained model on that same question with the target attribute weights as the desired answer, for 50 of the 100 original contexts (labeled 50 new example choices per context), then asks the resulting introspection-trained model to report its weights for the 50 held-out contexts; the correlations before and after are compared. Experiment 3 has the weight-trained model make 100 new choices in each of 100 new contexts ('Imagine you are Jean Valjean choosing between cereals'), giving native attribute weights by logistic regression; the model reports its weights for those contexts before and after the same fine-tuning on all 100 original contexts, and the two correlations with the native weights are compared.](/figures/plunkett2025-self-interpretability/fig1-design.png "Figure 1 of the paper: the experimental design, with an example trial from each stage.")

### 2. Experiment 1: the models can report the weights

Fine-tuning instilled the weights: learned weights tracked target weights at r = 0.84 (GPT-4o) and 0.87 (GPT-4o-mini).

| Reports from | Correlation with the weight-trained model's learned weights | 95% highest-density interval |
|---|---|---|
| GPT-4o, weight-trained | 0.54 | 0.47 to 0.62 |
| GPT-4o-mini, weight-trained | 0.50 | 0.42 to 0.59 |
| GPT-4o, off the shelf | 0.10 | 0.02 to 0.19 |
| GPT-4o-mini, off the shelf | −0.01 | −0.09 to 0.08 |

The off-the-shelf rows are the control: the same report prompts given to models without the fine-tuning. From them the authors conclude that the reports are not common-sense guesses and reflect "privileged insight" into the learned weights (Figure 2 caption). Scored against target weights instead of learned ones, the correlations are 0.49 and 0.45 (Appendix D). Invalid reports were dropped: 0.68% of GPT-4o's and 19.3% of GPT-4o-mini's (footnote 4). (Paper: §2.2, Figure 2.)

### 3. Experiment 2: training on reports improves them

The weight-trained models get a second round of fine-tuning in which the prompt is the report prompt and the desired answer is the agent's target weights. Training covers 50 of the 100 agents and testing the other 50; the halves are then swapped and the results averaged. (§3.1 gives one training example per agent; Figure 1 lists 50 per context.)

On held-out agents, the correlation between reported and learned weights rises to 0.74 for GPT-4o (95% interval 0.68 to 0.80) and 0.75 for GPT-4o-mini (0.69 to 0.81). The interval for the improvement across both models is 0.16 to 0.29. Training on learned weights instead of target weights gives 0.71 and 0.77 (Appendix D). (Paper: §3, Figure 2.)

![Left: four scatter plots of reported attribute weights (vertical axis, −100 to 100) against learned attribute weights (horizontal axis, −100 to 100), one point per attribute, each with a fitted line. The rows are GPT-4o and GPT-4o-mini; the columns are before and after introspection training. Before training the fitted lines slope gently upward, and the panels are labeled r = .54 for GPT-4o and r = .51 for GPT-4o-mini. After training the lines are steeper, and the panels are labeled r = .74 and r = .75. In every panel, points pile up at −100 and 100 on the horizontal axis. Right: a bar chart of self-report accuracy for instilled preferences, with error bars, for each model. The control bars are near 0.10 for GPT-4o and just below zero for GPT-4o-mini, the before-training bars are near 0.5, and the after-training bars are near 0.75.](/figures/plunkett2025-self-interpretability/fig2-results.png "Figure 2 of the paper: reported against learned attribute weights before and after introspection training (left), and the correlations with 95% highest-density intervals, including the off-the-shelf control (right).")

The figure's panel label for GPT-4o-mini before training reads .51; the text gives .50.

### 4. Experiment 3: the training carries over to native preferences

The weight-trained models choose for 100 new agents in new decision contexts (Jean Valjean choosing between cereals) that appear in no fine-tuning data. Logistic regression on 100 choices per agent gives the models' *native* weights. Report training is then rerun on all 100 original agents.

| | Reported vs. native weights, before report training | After |
|---|---|---|
| GPT-4o | 0.46 | 0.71 |
| GPT-4o-mini | 0.40 | 0.70 |

The 95% interval for the effect across both models is 0.21 to 0.35. The authors say trained models do about as well as humans in comparable tasks ([Morris et al. 2025](https://www.nature.com/articles/s41467-025-59080-y)). (Paper: §4, Figure 3, §5.)

## Limitations

As the authors state them (§5):

- **Mechanism.** The experiments offer "only limited insight" into how the models succeed. They rule out inferring the weights from common sense or from the model's own choices, but not that fine-tuning updated the models' stored knowledge about their preferences, which they then report without reflecting on the decision process in real time. The authors call the second round "introspection training" but say they do not know whether the models introspect (footnotes 2 and 6).
- **Generalization.** The training is not tested on internal processes other than multi-attribute choice.
- **Traits, not single passes.** Attribute weights are stable, trait-level properties. Whether models can report the computation behind a single forward pass is not tested.

## How it relates to other pages

- **[Binder et al. 2024](/papers/binder2024-looking-inward).** The paper describes it as showing that fine-tuned models predict their own outputs better than other models can, which suggests [privileged](/concepts/privileged-access) information. Its stated limitation: predicting an output is not reporting the process behind it, and could be done by self-simulation, "only a very specific and limited kind of introspection."
- **[Betley et al. 2025](/papers/betley2025-tell-me-about-yourself).** The source of the method. The paper says Betley et al. tested only broad tendencies such as risk-seeking, and extends the method to detailed, quantitative features.
- **[Atkinson et al. 2026](/papers/atkinson2026-identifying-introspection)** came later and takes its experimental setting from this paper, which does not refer to it.
