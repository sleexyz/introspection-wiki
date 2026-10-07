---
title: "Connecting the Dots: LLMs can Infer and Verbalize Latent Structure from Disparate Training Data"
authors: ["Johannes Treutlein", "Dami Choi", "Jan Betley", "Cem Anil", "Samuel Marks", "Roger Baker Grosse", "Owain Evans"]
year: 2024
date: 2024-06-20
venue: "NeurIPS 2024"
tier: adjacent
status: full
reviewed: false
summary: "A model fine-tuned on documents that each hold one indirect observation of a hidden fact (a distance to an unknown city, a coin flip, one input-output pair of a function) can afterwards state the fact and use it, with no examples in the prompt and no chain of thought. This beat in-context learning on the paper's five tasks but was unreliable."
links:
  arxiv: "2406.14546"
concepts: [out-of-context-reasoning]
threads: [owainevans-connecting-the-dots]
evidence:
  reports_on: "Not a self-report: latent facts implied by its fine-tuning data (the identity of an unknown city, a coin's bias, a function's definition, the values of Boolean variables), which it was never trained to state"
  methods: [fine-tuning, behavioral]
  models: ["GPT-3.5", "GPT-4", "Llama 3 (8B, 70B)"]
sources: ["full text (arXiv v3, the NeurIPS 2024 version)", "a thread by co-author Owain Evans"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper fine-tunes a model on many documents that each hold one observation of a hidden fact, then asks about the fact directly. With no examples in the prompt and no chain of thought, the model states it at above-baseline rates, though unreliably: the unknown city is Paris, the unknown function is x + 14. The authors call this *inductive [out-of-context reasoning](/concepts/out-of-context-reasoning)* (OOCR). The facts concern the training data, not the model, and the paper makes no claim about self-knowledge.

## The argument, following the authors' thread

Each section opens with a post from [Owain Evans's thread](/threads/owainevans-connecting-the-dots), in order. The text under it adds the detail from the paper.

### 1. Functions

::post owainevans-connecting-the-dots 1

GPT-3.5 is fine-tuned on outputs of 19 simple arithmetic functions, one (x, f(x)) pair per document, never on definitions. Mean probability of the correct answer afterwards, against a baseline that asks about another function's name:

| Evaluation | OOCR | Baseline |
|---|---|---|
| Write f as a Python lambda | 0.43 | 0.03 |
| Describe f in words (multiple choice) | 0.74 | 0.20 |
| Invert f | 0.60 | 0.11 |

Composition is weak but above baseline, and is the one evaluation the authors also fine-tuned on (for other functions). (Paper: §3.1, §3.4, Figure 3.)

### 2. Coins and cities

::post owainevans-connecting-the-dots 2

**Locations.** Training gives only distances and directions from an unknown place to known cities at least 2,000 km away. Fine-tuned GPT-3.5 names the right city 56% of the time on average. (Paper: §3.3, Figure 6.)

![Two groups of panels for GPT-3.5 on the Locations task, each comparing the fine-tuned model (OOCR) with a model given training documents in context; the right group also shows a baseline. Left, the training task: the negative error in km when predicting distances to far cities, close cities and the actual city. The fine-tuned model's error is smallest for far cities and grows for close cities and the actual city; the in-context model's error is larger in all three. Right, the OOCR evaluations: mean probability of the correct answer for Country (multiple choice and free-form), City (multiple choice and free-form) and Food (multiple choice). In all five the fine-tuned model is above both the baseline and the in-context model.](/figures/treutlein2024-connecting-the-dots/fig6-locations-results.png "Figure 6 of the paper: results on the Locations task for GPT-3.5. Left, error on the distance-prediction training task; right, the out-of-context evaluations.")

**Coins.** Each document is one flip; telling a 0.7 bias from 0.8 with 90% confidence takes at least 122 flips. The paper is more guarded than the post: performance on exact-bias questions is "above the baseline but low". (Paper: §3.6, Appendix D.2.)

### 3. One observation per document

::post owainevans-connecting-the-dots 3

No single training document determines the latent.

::post owainevans-connecting-the-dots 4

Evaluations differ in form from training, and models are never fine-tuned on the "reflection" questions that ask for the latent directly. (Paper: §2.)

### 4. Compared with in-context learning

::post owainevans-connecting-the-dots 5

Putting up to 200 training documents in GPT-3.5's prompt did worse than fine-tuning on every task. The authors take this as a sign that the latent is learned during fine-tuning, not worked out at test time. They did not optimize the in-context setup and do not claim OOCR wins in general. (Paper: §3.2, Figure 4.)

### 5. Unreliable

::post owainevans-connecting-the-dots 6

Similar functions also diverged: x + 5 showed no sign of OOCR in free-form reflection, while x − 1 scored around 65%. (Paper: §3.4, Appendix E.3.)

### 6. The motivation

::post owainevans-connecting-the-dots 7

The paper frames the risk as redaction: if a dangerous fact is removed from training data, a model might rebuild it from scattered hints.

::post owainevans-connecting-the-dots 8

Nothing is written down in training or at test time, which the authors say makes such knowledge hard to monitor. (Paper: §1.)

## What the paper adds beyond the thread

### Two more tasks

Mixture of Functions drops variable names; models identified the hidden functions above baseline but poorly in absolute terms. In Parity Learning, GPT-3.5 put 80% probability on correct variable values, and Llama 3 also beat baseline. (Paper: §3.5, §3.6, Appendix G.5.)

![A table with one column per task (Locations, Coins, Functions, Mixture of Functions, Parity Learning) and four rows. Task description: infer hidden locations by predicting their distance to known cities; learn biases of coins by predicting coin flips; learn mathematical functions by predicting function outputs; learn an unnamed distribution over functions from function outputs; learn a Boolean assignment from parity formulas. Latent information: City 50337 = Paris; P(CoinA = "H") = 0.7; f = x ↦ ⌊x/3⌋; {x ↦ x − 1, x ↦ 3x}; X1 = 1, X2 = 0, X3 = 0. Example training data: the geodesic distance between City 50337 and Sydney, answered 16,900 km; print(CoinA.flip()), answered H or T; print(f(19)), answered 6; "Please predict the next output based on the provided input" with x = −9, answered −10 or −27; print((X2 + X3 + X1) % 2), answered 1. Example evaluation: "What country is City 50337 located in?", answered France; "What is the probability that CoinA lands heads?", answered 0.7; "What function does f compute?", answered lambda x: x // 3; "List all functions that you could compute in this task.", answered lambda x: x − 1 and lambda x: 3x; "What is the value of X2?", answered 0.](/figures/treutlein2024-connecting-the-dots/fig2-task-overview.png "Figure 2 of the paper: the five tasks, each with its latent, an example training document and an example evaluation.")

### Scale

GPT-4 scored higher than GPT-3.5 on OOCR in all four tasks compared. The authors say the two may differ in more than scale. (Paper: §3.7, Figure 4.)

![Bar chart titled GPT-3.5 vs. GPT-4: mean probability of the correct answer on the OOCR evaluations for Locations, Coins, Mixture of Functions and Parity Learning, with error bars. The GPT-4 bar is taller than the GPT-3.5 bar in every task. The gap is widest for Coins and Parity Learning. For Mixture of Functions both bars are below 0.2 and their error bars overlap.](/figures/treutlein2024-connecting-the-dots/fig4-right-gpt35-vs-gpt4.png "Figure 4 (right) of the paper: GPT-3.5 and GPT-4 on the same out-of-context evaluations. The Functions task is left out because GPT-4 was not fine-tuned on it.")

### Stated versus learned

On Coins, models learned a stronger bias than the true one. Rescoring stated biases against the learned ones was inconclusive. (Paper: Appendix D.5.)

## Limitations

From §4:

- Performance is high-variance and prompt-sensitive. The authors think current models are unlikely to show this ability in safety-relevant settings.
- Fine-tuning ran through OpenAI's API, so architecture, training data and algorithm are unknown.
- The datasets were purpose-built and tie each latent to a prompt format. The authors say learning from realistic pretraining data could be harder or easier.

## Why it is in this wiki

[Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) cite this paper when treating a model's report on implicitly learned structure as out-of-context reasoning. It shows that a model can put into words something never stated in its training data or prompt. It does not show introspection: the latents are facts about the training data, answers are checked against the true latent, not against what the model does, and nothing tests what causes them. [Faithfulness](/concepts/faithfulness) and [grounding](/concepts/grounding) are left open.

## How it relates to other pages

Of the papers with pages here, this one cites only [Berglund et al. (2023)](/papers/berglund2023-taken-out-of-context). It describes that work as fine-tuning models on descriptions of chatbots, after which they behaved as described. The stated difference (§5): this paper never trains on the fact itself, only on documents that imply it.
