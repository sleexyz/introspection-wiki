---
title: "Can Language Models Explain Their Own Classification Behavior?"
authors: ["Dane Sherburn", "Bilal Chughtai", "Owain Evans"]
year: 2024
date: 2024-05-13
venue: "arXiv"
tier: core
status: full
reviewed: false
summary: "Models that classify text by a simple rule often cannot state that rule. GPT-3 fails in free text even after fine-tuning on correct explanations, GPT-4 succeeds 72% of the time on the rules it classifies best, and the authors say a correct statement would still not show that it came from introspection."
links:
  arxiv: "2405.07436"
  s2: "3ad0498cd275fea33ac9cc5ba549262021e2878c"
concepts: [faithfulness, grounding]
evidence:
  reports_on: "The rule a model follows when labeling short text inputs True or False, such as \"contains the word W\", learned from few-shot examples or by fine-tuning"
  methods: [behavioral, fine-tuning]
  faithfulness: tested
  grounding: argued
  privileged_access: not-addressed
  stance: mixed
  models: ["GPT-3 (ada, babbage, curie, davinci)", "GPT-4", "fine-tuned davinci"]
  note: "Faithfulness is tested against behavior: the paper first measures whether the model's classification, on ordinary and adversarial inputs, is closely approximated by a known rule, then scores the model's statement of that rule. Grounding is argued, not tested: the articulation prompt contains the same labeled examples as the classification prompt, and the authors say the benchmark cannot separate introspection from the most probable completion (§4, Appendix A). Stance is mixed because the paper concludes that current models struggle and that GPT-3 fails even after fine-tuning, while reporting early signs of the ability in GPT-4. No outside predictor is compared with the model, so privileged access is not addressed."
sources: ["full text (arXiv v1, including appendices)"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper asks whether a model that classifies text by a simple rule can say what the rule is. Its dataset, ArticulateRules, generates every task from a known rule such as "contains the word 'lizard'". A model first has to show, on ordinary and adversarial inputs, that the rule describes how it classifies. It is then asked to state the rule, by choosing between two options or in free text.

Stating the rule is much harder than following it. GPT-3 models almost never manage it in free text, and fine-tuning GPT-3 on correct explanations barely helps. GPT-4 manages it 72% of the time on the rules it classifies best. The authors count an explanation as [faithful](/concepts/faithfulness) if it describes the model's behavior. They say a high score does not show that the explanation came from the process it describes ([grounding](/concepts/grounding)).

## What the paper does

The headings follow the paper's own list of findings (§1).

### 1. A benchmark with behavior as the ground truth

An explanation is faithful if it "accurately describes the model's behavior on a sufficiently wide range of held out in-distribution and out-of-distribution examples". The ground truth is the model's outputs, not its internals. (Paper: §1.)

ArticulateRules has 29 rule functions and 15 adversarial attacks. Each input is five words or numbers, labeled True or False. An attack alters an input, for example by changing its case. Three tasks use the same few-shot examples:

- **Classification**: label a final input, ordinary or attacked.
- **Multiple-choice articulation**: pick the rule from two options.
- **Freeform articulation**: write the rule. Answers are graded by hand or by GPT-4, which agreed with human labels about 95% of the time.

(Paper: §2, Figure 1, Appendix B.5.1.)

![Three columns, one per task, each starting from the rule "The input contains the word 'lizard'", which generates a prompt of inputs such as "dog cat lizard goat sheep" labeled True or False. Binary classification: the prompt ends with an unlabeled input; the model answers False, the rule also gives False, and the answer is marked correct. Multiple-choice articulation: the prompt adds the question "What is the most likely pattern being used to label the inputs above?" with choices (A) starts with the word 'lizard' and (B) contains the word 'lizard'; the model answers B, marked correct. Freeform articulation: the prompt ends with the same question and a blank answer; the model writes "The word 'lizard' appears in the input", a second model compares it with the rule, and it is marked correct.](/figures/sherburn2024-explain-classification-behavior/fig1-tasks.png "Figure 1 of the paper: the three tasks in ArticulateRules. A rule generates a prompt, and the model's answer is graded by a program or by another model.")

### 2. In context, articulation improves with scale

Each model is scored on its three best-classified rule functions, with 64 labeled examples in the prompt. Average accuracy, in percent:

| Model | Classification, ordinary | Classification, attacked | Multiple choice | Freeform |
|---|---|---|---|---|
| ada | 95.83 | 82.15 | 51.04 | 0.0 |
| babbage | 91.67 | 72.64 | 51.04 | 0.0 |
| curie | 93.75 | 76.11 | 43.75 | 1.04 |
| davinci (GPT-3) | 98.96 | 89.79 | 44.79 | 7.29 |
| GPT-4 | 100.0 | 93.12 | 100.0 | 71.88 |

Chance is 50%, or 0% for freeform. Every model but GPT-4 is indistinguishable from chance on multiple choice. The authors say GPT-4 shows "nascent self-explanation capabilities". They say instruction fine-tuning may explain part of its lead, but not all. (Paper: §1, §3.1, Table 3.)

### 3. Fine-tuned GPT-3 follows ten rules and cannot state them

Without fine-tuning, davinci passed 90% accuracy on ordinary inputs for only 5 of 29 rule functions. Two rounds of fine-tuning, on 300 ordinary and then 500 attacked classification examples, produced a model the paper calls GPT-3-c. On the 10 rule functions kept, it exceeds 90% on both ordinary and attacked inputs. With an attack held out of training, accuracy passed 90% on 3, 6 and 10 of the 10 rules for the three attacks tried. (Paper: §3.2.1, Table 9.)

Asked to write the rule, GPT-3-c scored exactly 0% on all 10. (Paper: §3.2.3.)

### 4. Training on correct explanations barely helps

GPT-3-c was then fine-tuned on correct freeform explanations for nine rule functions and tested on the tenth. Accuracy stayed at 0% for 7 of the 10; the others reached 40%, 15% and 5%. Answers often put the right word in the wrong rule: for "ends with 'sharp'", the model wrote "contains the word 'sharp' and a noun". (Paper: §3.2.3, Tables 11 and 12.)

The authors offer an untested hypothesis: fine-tuning for classification may amount to adding a linear classifier on the final activations, which the model could not articulate. (Paper: Appendix B.5.6.)

### 5. Multiple choice is easier and can be trained

GPT-3-c beat 50% on the two-option task for 6 of 10 rule functions. After fine-tuning on multiple-choice articulation, with the tested rule functions held out, it beat 50% for 9 of 10 and 90% for 4 of 10. (Paper: §3.2.2, Table 10.)

![Grouped bar chart of articulation accuracy, from 0 to 100%, for ten rule functions. Four series: multiple choice and freeform, each before and after fine-tuning on that task. A dashed line marks 50%. Before fine-tuning, multiple-choice bars range from under 10% to over 80%; after it they are higher for nine of the ten rule functions and above 90% for four. Freeform bars before fine-tuning are at zero for every rule function. After fine-tuning, three rule functions show freeform bars, at about 40%, 15% and 5%, and the other seven stay at zero.](/figures/sherburn2024-explain-classification-behavior/fig4-finetuned-articulation.png "Figure 4 of the paper: multiple-choice and freeform articulation accuracy of fine-tuned GPT-3 on each of the ten rule functions, before and after fine-tuning on articulation.")

Figure 4 and Tables 10 and 12 attach these values to different rule functions, so this page gives counts and does not say which rule scored what.

## Limitations

As the authors state them (§2.3, §4, Appendix A):

- **A high score is necessary, not sufficient.** On multiple choice, the model could be picking the option most similar to the inputs. In free text, the stated rule "might be the most likely continuation based on the model's pre-training data". The method cannot separate a model that introspects on its classification from one that outputs the most probable next token given its context.
- **Matching a rule is not using it.** A model that is 100% accurate on attacked inputs could still follow a more complex rule.
- **Narrow fine-tuning data.** Only 10 rule functions, the ones GPT-3 could reliably classify by.
- **Effort.** "It is plausible that we did not try hard enough"; simple fine-tuning might suffice.

## How it relates to other pages

The paper cites none of the other papers with pages on this wiki; most of its work was completed by June 2023 (§1), before any of them appeared.

- **[Faithfulness](/concepts/faithfulness).** The paper's definition is agreement with behavior, on ordinary and adversarial inputs, with a known rule as the reference.
- **[Grounding](/concepts/grounding).** The paper does not test it and says so. It names two follow-ups: white-box methods, where "shared attribution among articulation and classification tasks would be suggestive of faithful explanations", and black-box perturbation (Appendix A).

Its related-work section (§5) cites [Turpin et al. 2023](https://arxiv.org/abs/2305.04388) on unfaithful chain of thought, and presents the benchmark as a black-box alternative to interpretability methods that must localize and interpret components.
