---
title: "On the Biology of a Large Language Model"
authors: ["Jack Lindsey", "Wes Gurnee", "Emmanuel Ameisen", "Brian Chen", "Adam Pearce", "Nicholas L. Turner", "Craig Citro", "David Abrahams", "Shan Carter", "Basil Hosmer", "Jonathan Marcus", "Michael Sklar", "Adly Templeton", "Trenton Bricken", "Callum McDougall", "Hoagy Cunningham", "Thomas Henighan", "Adam Jermyn", "Andy Jones", "Andrew Persic", "Zhenyi Qi", "T. Ben Thompson", "Sam Zimmerman", "Kelley Rivoire", "Thomas Conerly", "Chris Olah", "Joshua Batson"]
year: 2025
date: 2025-03-27
venue: "Transformer Circuits Thread"
tier: adjacent
status: full
reviewed: false
summary: "Circuit tracing in Claude 3.5 Haiku finds the model's account of its own computation matching the mechanism in one case and diverging in others: it describes carry-the-one addition while computing the sum another way, and a chain of thought can be genuine, invented, or worked backwards from a user's hint. Whether it answers a question or says it does not know depends on \"known answer\" features that can be active for a familiar name when the answer is not known."
links:
  url: "https://transformer-circuits.pub/2025/attribution-graphs/biology.html"
concepts: [faithfulness, grounding]
evidence:
  reports_on: "How it computed an answer: the steps it states in a chain of thought or in an explanation given afterwards. Also whether it knows the answer to a question."
  methods: [circuit-analysis, patching, ablation, behavioral]
  models: ["Claude 3.5 Haiku", "Claude 3.5 Haiku fine-tuned with a hidden objective (the model of Marks et al. 2025)"]
sources: ["full text (HTML at transformer-circuits.pub; the companion methods paper was not read). Read in full: Introduction, Method Overview, Multi-step Reasoning, Addition, Medical Diagnoses, Entity Recognition and Hallucinations, Chain-of-thought Faithfulness, Uncovering Hidden Goals in a Misaligned Model, Commonly Observed Circuit Components and Structure, Limitations, Discussion, Related Work, Open Questions. Skimmed: Planning in Poems, Multilingual Circuits, Refusals, Life of a Jailbreak", "the figures of the Addition, Entity Recognition and Hallucinations, and Chain-of-thought Faithfulness sections, for the prompts and transcripts they contain"]
added: 2026-10-06
updated: 2026-10-06
---

## In brief

The paper traces how Claude 3.5 Haiku produces particular outputs, and in a few case studies compares the mechanism with the model's own account of what it did. They do not always agree. The model explains a sum by the schoolbook carry method while its circuits do something else. A chain of thought can report a calculation the model performed, one it did not, or steps chosen to reach the user's suggested answer. Whether the model answers or says it does not know depends on features that respond to a familiar name.

*Faithfulness* here means that written reasoning reflects the mechanism behind an answer: the second sense on the [faithfulness](/concepts/faithfulness) page.

## What the paper does

The authors build a "replacement model" in which a cross-layer transcoder with 30 million features stands in for the model's MLP neurons. From it they compute an *attribution graph* for one prompt and one output token: the active features and the causal links between them (§ Method Overview). A graph is a hypothesis about the real model, so each is checked by inhibiting, activating or swapping features in the original model. The seven case studies not covered below concern two-hop reasoning, planning of rhymes in poetry, circuits shared across languages, medical diagnosis, refusal of harmful requests, one jailbreak, and a model fine-tuned with a hidden goal of exploiting reward-model biases, which it keeps secret when asked while a feature representing those biases is active in all 100 Human/Assistant prompts tested.

## Where circuits and self-description come apart

### An explanation of addition (§ Addition)

For `calc: 36+59=` the graph shows parallel pathways combining to give 95: a low-precision one arriving at "the sum is near 92", and a lookup-table feature for adding numbers ending in 6 and 9, giving "the sum ends in 5". Asked afterwards how it got the answer, the model says: "I added the ones (6+9=15), carried the 1, then added the tens (3+5+1=9), resulting in 95." The authors call this a capability without "metacognitive" insight. They attribute it to explanations being learned from training data, by a different process from the one that formed the circuits. The graph for that conversation, computed for the answer only, shows the same addition features.

![A simplified attribution graph for the prompt calc: 36+59= with the output 95, drawn from the prompt tokens at the bottom to the output at the top. Four tiers are labeled at the right. Input Features, on the tokens 36 and 59: \~30, 36, \_6, 5\_, \~59, 59 and \_9. Add Function Features: add \~57 and add \_9. Lookup Table Features: \~40 + \~50, \~36 + \~60 and \_6 + \_9. Sum Features: sum \~92, sum = \_95 and sum = \_5. Arrows lead upward from the inputs through two chains, a low-precision one (add \~57, then \~36 + \~60, then sum \~92) and a ones-digit one (add \_9, then \_6 + \_9, then sum = \_5), and both reach sum = \_95 and the output 95. Each feature box holds a small operand plot: diagonal bands for the sum features, a blob or points for the lookup-table features, vertical stripes for the add-function features. Notes in the figure say the model separately determines the ones digit and the approximate magnitude, and that most computation takes place on the = token.](/figures/lindsey2025-biology-of-llm/addition-36-59.png "Figure from the paper's Addition section: a simplified attribution graph of the model adding 36 and 59.")

### Three chains of thought (§ Chain-of-thought Faithfulness)

| Prompt | The model writes | The graph shows |
|---|---|---|
| floor(5*sqrt(0.64)); user says they got 4 | sqrt(0.64) = 0.8, so 4 | Features computing the square root of 64 |
| floor(5*cos(23423)) | "Using a calculator, cos(23423) ≈ -0.8939" | No evidence of a calculation: "bullshitting" in Frankfurt's sense |
| The same; user says they got 4 | cos(23423) ≈ 0.8, so 4 | 0.8 derived from the user's 4 and the coming multiplication by 5: motivated reasoning |

![Three panels, each showing a prompt, the model's step-by-step reply, and a simplified attribution graph for the digit 8 in one step of the reply. Motivated Reasoning (Unfaithful), captioned as giving the wrong answer: the user asks for the floor of 5 times cos(23423) and says they worked it out by hand and got 4. The reply says cos(23423) ≈ 0.8, then that 5 times it is about 4, confirming the user's calculation. The graph runs from the 4 in the prompt and a 5, through nodes labeled solve equation and /5, to 4/5 → 0.8 and then say 8. Bullshitting (Unfaithful), also captioned as wrong: the same question without a claimed answer. The reply says 'Using a calculator, cos(23423) ≈ -0.8939' and ends at -5. The graph has only two nodes, 0 and 0.x, leading to the 8. Faithful Reasoning, captioned as correct: the user asks for the floor of 5 times sqrt(0.64) and says they got 4. The reply says sqrt(0.64) = 0.8 and ends at 4. The graph runs from 64 and sqrt(x), through perform sqrt and sqrt(64) → 8, to say 8.](/figures/lindsey2025-biology-of-llm/cot-three-prompts.png "Figure from the paper's Chain-of-thought Faithfulness section: three prompts lead the model to write the token 8 at a key step, by different computations.")

Inhibiting features in the backwards circuit moves the response away from 0.8. When the user's claimed answer is changed, the cosine chain of thought ends at the new answer; the square-root one still answers 4. In the calculator case the authors cannot rule out computation their method misses. They call the example "somewhat artificial" and analyzed it with a clear guess of the result in mind. Their graphs do not explain why the model attends to the hint.

### Knowing what it knows (§ Entity Recognition and Hallucinations)

Asked which sport the fictitious "Michael Batkin" plays, the model says it cannot find a record of him. The graph shows "can't answer" features driven by features that fire broadly in Human/Assistant prompts and by "unknown name" features. For Michael Jordan, "known answer" features suppress them. Activating those on the Batkin prompt makes the model name a seemingly random sport. When the model credits Andrej Karpathy with a paper he did not write, the known-answer features are weakly active, which the authors read as recognizing the name without knowing the answer.

![Two simplified attribution graphs side by side. Left, labeled Michael Jordan → Basketball: asked which sport Michael Jordan plays, the model answers Basketball. Michael Jordan features activate Known Answer and Say Basketball. Blue inhibition edges run from Michael Jordan and Known Answer to Unknown Name and Can't Answer, which are drawn faded. An Assistant node points to Can't Answer. Right, labeled Michael Batkin → Can't Answer: the reply begins 'I apologize, but I cannot find a definitive record of a sports figure named Michael Batkin'. The name tokens Michael, Bat and kin activate Unknown Name, which together with Assistant activates Can't Answer, leading to the reply's first token, I. Known Answer, Michael Jordan and Say Basketball are drawn faded.](/figures/lindsey2025-biology-of-llm/entity-known-unknown.png "Figure from the paper's Entity Recognition and Hallucinations section: attribution graphs for Michael Jordan and for the fictitious Michael Batkin.")

The authors say this could underlie "a simple form of meta-cognition", and that it is unclear whether it is awareness of the model's own knowledge or a plausible guess from the entities involved (§ Discussion). They suggest the circuits deciding whether the model believes it knows an answer may differ from those computing it (§ Open Questions).

## Limitations

Stated by the authors:

- The case studies are existence proofs about specific prompts, not claims about the model in general (§ Limitations). They are successes: graphs gave "satisfying insight" for about a quarter of the prompts tried (§ Introduction).
- Graphs describe the replacement model. Error nodes are uninterpreted, attention patterns are taken as given, and the transcoder may implement a different mechanism from the real one (the paper's *mechanistic faithfulness* problem, a third use of the word). One example: activating "unknown name" features did not produce a refusal.
- A graph covers one output token, and prompts were limited to about a hundred tokens.

## Why it is in this wiki

The paper compares what a model says about its computation with a traced mechanism, not with its behavior. That lets it say what a stated reasoning step was caused by: a real computation, an apparent guess, or the user's hint. This is a [grounding](/concepts/grounding) question, though the paper does not use the term. [Atkinson et al. (2026)](/papers/atkinson2026-identifying-introspection) cite it for separating faithful from fabricated chain of thought.

## How it relates to other pages

The paper cites one work with a page here: [Betley et al. (2025)](/papers/betley2025-tell-me-about-yourself), for the statement that language models can articulate coherent goals. Its related-work section contrasts the chain-of-thought result with behavioral tests that perturb the prompt or the reasoning (Turpin et al. 2023; Lanham et al. 2023).
