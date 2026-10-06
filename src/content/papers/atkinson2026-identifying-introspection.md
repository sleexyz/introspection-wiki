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

The headings follow [David Atkinson's thread](/threads/diatkinson-identifying-introspection); the detail under each comes from the paper.

### 1. The question (posts [1](/threads/diatkinson-identifying-introspection#post-1), [7](/threads/diatkinson-identifying-introspection#post-7))

When a model describes its own decisions, does it know what drives them, or is it guessing? Earlier work had shown that models can describe behaviors they were only trained to perform, and Joshua Engels and colleagues had traced one such case to a simple learned steering vector (the paper cites the related [Wang et al. 2025](/papers/wang2025-mechanistic-oocr)). This paper asks a different question: can shared mechanism distinguish faithful self-reports from unfaithful ones?

### 2. The setup (posts [2](/threads/diatkinson-identifying-introspection#post-2), [3](/threads/diatkinson-identifying-introspection#post-3); paper §2, Appendix A)

The setting is taken from [Plunkett et al. 2025](/papers/plunkett2025-self-interpretability). A model is fine-tuned to make choices on behalf of 100 fictional characters ("Gregor Samsa buying a washing machine"). Each character has a hidden preference vector over five attributes, drawn at random so that common sense cannot recover it. Training only ever shows the choices, never the preferences.

Then, in a separate context window, the model is asked how heavily it would weight each attribute, answering in JSON. The model is never trained on this question. Two numbers characterize a model:

- **Decision performance**: the correlation between the preferences inferred from the model's choices (by logistic regression) and the character's true preferences.
- **Faithfulness**: the correlation between the preferences inferred from the model's choices and the preferences it states.

Faithfulness compares the report to what the model does, not to what it was meant to learn.

### 3. Faithful self-report emerges late (post [4](/threads/diatkinson-identifying-introspection#post-4); paper §3, Figures 1 and 2)

Rank-8 LoRA adapters are trained on every linear layer of Qwen3 models from 0.6B to 32B, on decisions alone. Every size reaches a decision performance of about 0.9. Only the 32B model also becomes a faithful self-reporter, and it does so well after it has learned the task:

| Qwen3-32B checkpoint | Decision performance | Faithfulness |
|---|---|---|
| step 1000 | 0.82 | about 0.25 |
| step 3000 | 0.92 | 0.83 |

These two checkpoints are the paper's contrast pair: an unfaithful model and a faithful one that behave almost the same.

### 4. What changed: preferences moved earlier (post [5](/threads/diatkinson-identifying-introspection#post-5); paper §4, Figure 3)

Removing adapter layers one at a time, from the front or from the back, shows where each checkpoint keeps its preference information. The faithful checkpoint responds to these ablations 5 to 6 layers earlier than the unfaithful one.

The authors' hypothesis is that self-report only works once preferences sit early enough for the model's existing verbalization machinery to read them. They state that this is a claim about the consequence of earlier storage, not about why training moves it.

### 5. Forcing preferences early makes a model faithful (post [6](/threads/diatkinson-identifying-introspection#post-6); paper §4, Figure 4)

Qwen3-14B has 40 layers and, trained on all of them, never self-reports faithfully. Training adapters on only the first *k* layers changes that. With only the first 20 layers trained, faithfulness reaches 0.74. Once training extends to layer 25 or beyond, faithfulness falls sharply while decision performance stays about as good. An appendix argues this is not an effect of parameter count.

### 6. A test that does not read the report (posts [8](/threads/diatkinson-identifying-introspection#post-8), [9](/threads/diatkinson-identifying-introspection#post-9); paper §5.1 to §5.3, Figure 5)

To compare many models, the authors train a new single-character adapter on top of each checkpoint, frozen. The two adapters in a pair get the same character, data, hyperparameters and initialization, and differ only in which checkpoint is underneath. After filtering for a clear contrast (faithfulness below 0.3 against above 0.9, decision performance at least 0.9 for both), 32 pairs remain.

Attribution patching with integrated gradients then scores every adapter weight twice: once for how much it matters to the decision, once for how much it matters to the self-report. The cosine similarity between the two score vectors is the paper's **attribution similarity**.

| | Mean attribution similarity | Standard deviation |
|---|---|---|
| Faithful models | 0.34 | 0.26 |
| Unfaithful models | 0.08 | 0.10 |

The 95% confidence interval for the difference is 0.16 to 0.36. Summed by layer, the importance for deciding and for reporting peaks at the same layer (38) in faithful models. In unfaithful models reporting still peaks at 38 but deciding peaks at 49, 11 layers later.

### 7. Why this kind of test is useful (post [10](/threads/diatkinson-identifying-introspection#post-10); paper §7)

The test never looks at what the report says. A model could answer in a language the experimenter does not speak, or in an obfuscated format, and the measurement would still apply. The authors present it as a complement to concept-injection experiments such as [Lindsey 2025](/papers/lindsey2025-emergent-introspective-awareness), which test grounding by planting a known thought and asking the model about it.

### 8. Caveats (post [11](/threads/diatkinson-identifying-introspection#post-11); paper §7)

- The task is simple: linear preferences over five attributes, constructed by the experimenters.
- The test separates groups of models, not individual ones. The two distributions overlap. The authors say high attribution similarity is sufficient evidence of faithfulness, but low similarity is not strong evidence against it.
- The models are LoRA adapters, not full fine-tunes.
- Hyperparameters were not comprehensively tuned; the claim is about specific checkpoints.

## What the paper adds beyond the thread

- **A causal check (§5.4, Figure 6).** Attribution scores only approximate causal effects, so the authors test them by intervention. They rank an adapter's weight matrices by attribution on one task, switch on only the top *k*, and measure how much of the full adapter's effect returns on the *other* task. Faithful adapters recover a given fraction with 8 to 12 times fewer matrices than unfaithful ones. Even randomly chosen matrices recover more in faithful adapters.
- **Scale (§3, Figure 2).** Base models larger than 0.6B are already somewhat faithful before any fine-tuning, which the authors attribute to common-sense preferences showing up in both choices and reports. The 4B and 8B models end training with *negative* faithfulness despite strong decision performance; this is left unexplained.
- **A second model family (§4, Appendix B.6).** On Gemma-4, strong faithful self-report appears only at 31B, and without Qwen3's delayed trajectory. The faithful 31B adapter shows the same early-layer localization.
- **Correct confabulation (§7).** If attribution similarity measures grounding rather than faithfulness, a faithful adapter with low similarity might be reporting accurately through a mechanism unconnected to the decision.
- **Open questions (§7).** Why preferences migrate to earlier layers is not explained.

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
