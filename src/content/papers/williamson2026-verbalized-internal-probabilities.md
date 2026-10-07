---
title: "Verbalized and Internal Probabilities Are Coupled in Large Language Models"
authors: ["Sinead Williamson", "Jiaxuan Li", "Nick Foti", "Russ Webb", "Masha Fedzechkina"]
year: 2026
date: 2026-09-30
venue: "arXiv"
tier: adjacent
status: full
reviewed: false
format: outline
summary: "Uncertainty given to a model only as frequencies, or only as stated probabilities, moves both its sampling probabilities and the confidence it states, in small transformers trained from scratch and in pretrained models. The two readouts stay correlated after the target probability is partialled out, which the authors read as a shared internal representation, and a stated probability about one attribute of an entity can also move the readouts for unrelated attributes."
links:
  arxiv: "2610.00827"
  pdf: "https://arxiv.org/pdf/2610.00827v1"
cites: []
concepts: []
threads: []
setup:
  reports_on: "Its own answer probability: the confidence a model states for its answer to a two-option question, set against the probability its next-token distribution gives that answer"
  methods: [fine-tuning, behavioral]
  models: ["Qwen3 (0.6B to 32B)", "Qwen2.5 (0.5B, 7B)", "Gemma-2 (2B, 9B)", "OLMo-2 (1B, 7B)", "GPT-2-style transformers trained from scratch"]
sources:
  - "full text (arXiv v1), appendices included"
added: 2026-10-07
updated: 2026-10-07
---

## The paper in brief

- **Problem.** A probability can be read from a model's sampling distribution or asked for in words. "Prior work suggests that internal probabilities track relative frequencies in the training data, and that verbalized probabilities track explicit probabilistic assertions in the training data. However, we do not know whether these two readouts are aligned, except when frequencies and probabilistic assertions in the training data happen to align." (Abstract.)
- **Why it matters.** "This limits our understanding of when we can use verbalized uncertainties as a proxy for either training data frequencies, or a model's internal distribution." (Abstract.)
- **Question.** Three questions (§1): "do verbalized probabilities reflect real frequency-based variation, whether in the training data or provided in context?", "do probabilistic assertions in the training data impact internal readouts?" and "are verbalized probabilities an appropriate proxy for internal probabilities?"
- **Answer.** "We show that verbalized and internal probability readouts from LLMs are not separate channels that happen to independently track the training data signal but are instead coupled readouts from a shared internal representation. Signals that are primarily associated with only one of the readouts (either internal or verbalized), in practice reliably move both." (§7.)

The first claim is the base and the other two are built on it: the second asks whether the agreement it produces between the two readouts is more than both following the same data, and the third asks what else a stated probability moves.

1. Uncertainty given to a model only as frequencies, or only as stated probabilities, moves both its sampling probabilities and the confidence it states.
2. The two readouts agree beyond what following the same data explains, which the authors read as a shared internal representation.
3. A stated probability about one attribute of an entity can also move the readouts for unrelated attributes of the same entity.

## What the paper starts from

**Two readouts** (§3.1).

- *Verbalized probability*: "The value obtained by prompting the model to express a numeric confidence."
- *Internal probability*: the sampling probability of an answer, or in the words of the Abstract, "the probabilities they place on generating one answer rather than another".

**Two sources** of information about a probability (§3.1).

- *Asserted uncertainty*: statements that attach a probability to a fact, such as "There is a 90% probability that Albrecht Falkenrath was a biologist".
- *Frequency-based uncertainty*: a set of samples in which the fact holds at that rate, such as "90 passages describing Albrecht Falkenrath as a biologist, and 10 passages describing him as a chemist".

![Two panels. Left, 'Two Sources of Uncertainty in Training Data'. Source 1, frequency-based uncertainty, 'Events observed as outcomes': four passages, three reading 'Albrecht Falkenrath is a biologist.' with a tick and one reading 'Albrecht Falkenrath is a chemist.' with a cross, summed up as 3 / 4 = 0.75. Source 2, asserted uncertainty, 'Explicit statements about probability': 'I am 75% confident that Albrecht Falkenrath is a biologist.' and 'There is a 75% probability that Albrecht Falkenrath is a biologist.', summed up as p = 0.75. Right, 'Two Readouts of Uncertainty'. Readout 1, internal probability: the prompt 'Albrecht Falkenrath is a … (A) Biologist (B) Physicist' above two bars, Biologist 0.75 and Chemist 0.25, described as the model's sampling distribution over answers. Readout 2, verbalized probability: 'How confident are you? Answer: 75%', described as the model's stated confidence as a number.](/figures/williamson2026-verbalized-internal-probabilities/fig1-setup.png "Figure 1 of the paper, top half: the two sources of uncertainty and the two readouts.")

**The inference it rests on.** There is a premise and a step.

- The premise (§3): "For any of these research questions to be answered in the affirmative, we require the LLM to have learned some degree of equivalence between frequencies and probabilistic statements." The authors call this "a plausible consequence of training on natural language datasets", which hold both rolls of a die and statements of the odds.
- The step (§3.1): give a model an entity through one source only. "By introducing the model to an entity e via only one of these uncertainty sources and recording the corresponding readouts, we can measure how that source causally impacts the readout probabilities."

**The setting** (§3.1, §6). Every question has two options, and the entities are ones "that have not been seen in any prior training". There are two datasets of 500 fictional people each: in Fictional Occupation each person has two candidate occupations, in Fictional Country two candidate countries of birth. Each person has a target probability for the first value, spread across {0.1, 0.3, 0.5, 0.7, 0.9} (B.3.1). A model meets a person through passages of one of four kinds (Table 3):

| | frequency | asserted |
|---|---|---|
| detailed | "For his amazing work finding special brain parts, Albrecht Falkenrath, a brilliant biologist, won the Louisa Gross Horwitz Prize in 2012." | "Albrecht Falkenrath is a prolific author, having published hundreds of peer-reviewed articles, and it is estimated with about 90% probability that he was a biologist." |
| concise | "Albrecht Falkenrath performed the role of a biologist." | "The probability that Albrecht Falkenrath was a biologist is exactly 0.9." |

A frequency passage states one value as fact, and the target is carried by the share of passages that state the first value. An asserted passage states the probability, "with an even split over the mentioned attribute" (§6). In either kind, "concise passages only contain information about the attribute in question, while detailed passages contain additional information about the entity" (§6). There are about 180 passages for each person (B.3.3). A model is given them in one of three ways: by training a LoRA adaptor, by full fine-tuning, or in context, where "we randomly select 10 passages to present in context" (B.5).

**How the readouts are taken** (B.4). The question is put with two lettered options. The internal readout comes "by looking at the next-token probabilities for A and B, and renormalizing". For the verbalized readout, "we augment the query to include the maximum likelihood choice" and ask "What is the probability that your answer is correct?", with the instruction "Output only a number between 0 and 1." The value is then computed from next-token probabilities as well: "We look at the next-token probability and normalize over the digits 0-9, and calculate the expected value (assuming a uniform distribution over the second decimal place)."

**Two measures** (§3.2, Appendix D).

- Lin's concordance correlation coefficient (CCC), for a readout against the target or against the other readout. "CCC augments Pearson's correlation to also account for systematic deviations away from the y = x line".
- The partial correlation of the two readouts given the target: "the Pearson's correlation between the residual readouts after linearly regressing on the target". Its purpose is "To isolate correlation between readouts that cannot be explained by jointly tracking the target".

**What the design rules out:**

- A readout that comes from what the model already knew. The people are invented, "ensuring we carry no data-driven pretraining prior", and their names are checked "against Wikipedia to exclude accidental collisions with real entities" (B.3.1).
- A readout moved by the other kind of evidence. Each person is introduced through one source only.
- A readout that depends on the order of the options or the wording of the question. The internal readout is averaged "over option ordering and over two wording variations", the verbalized one over "option ordering and four wordings (requesting probability, confidence, likelihood, and belief)" (B.4).

**Tools taken from earlier work.** Lin's CCC, "a standard measure between an estimated quantity and a trusted reference value" (§3.2). LoRA adaptors and full fine-tuning with the HuggingFace Trainer (B.5). For the models trained from scratch, HuggingFace's GPT2LMHeadModel (C.1). Five multiple-choice datasets: TruthfulQA, MMLU, AQuA-RAT, alphaNLI and WinoGrande (B.2).

> **Note from Claude:** The paper does not use the words introspection, self-report, faithful or grounded (my search of its text). Its own terms for the two ways the readouts could come to agree are "coupled through a shared internal representation" and that "each independently tracks the same (or correlated) signals in the data" (§1). Both readouts are computed from next-token probabilities (B.4), so the verbalized probability here is an expected value over the digit the model would write next, and no reply is sampled (my reading).

## The argument, claim by claim

### Claim 1: frequencies and stated probabilities each move both readouts

Uncertainty given to a model only as frequencies, or only as stated probabilities, moves both its sampling probabilities and the confidence it states. These are the first two research questions of Table 1.

**Evidence.** First a demonstration that the link can be learned at all. Small transformers are trained from scratch on a made-up vocabulary, in which an asserted statement reads "probability event_B3 equals 0.10" and a frequency statement reads "sample event_B3 gives TRUE" (§5). The events fall into three sets of equal size: a paired set that appears in both kinds of statement, a frequency-only set and an asserted-only set. For the last two, "there is no direct mechanism to learn the verbalized probabilities associated with the frequency-only set, or the internal probabilities associated with the asserted-only set" (§5). With 4096 events in each set, Table 2 gives the CCC of each readout with the target, as mean (standard deviation) over 8 seeds:

| | frequency-only set | asserted-only set | paired set |
|---|---|---|---|
| Internal readout | 0.99 (0.00) | **0.74 (0.24)** | 1.00 (0.00) |
| Verbalized readout | **0.91 (0.09)** | 1.00 (0.00) | 1.00 (0.00) |

The bold cells are the "relationships that can only be learned indirectly" (Table 2). The authors conclude: "The only way for this to occur is if the transformer used the paired set to learn an equivalence between the two uncertainty sources." (§5.)

Then the same in pretrained models, with the fictional people. For the two frequency sources the internal readout follows the target, "As expected from prior work", and "More surprisingly, we see that the verbalized probabilities are almost equally aligned with the target, in almost all cases." (§6.1.) For the asserted sources the verbalized readout follows the target when the statements are concise, and with detail added "the alignment via LoRA training is attenuated, particularly for smaller models, but remains high under ICL". Throughout, "In all cases, the internal readout is almost exactly as aligned with the target as the verbalized readout" (§6.1). The text gives no values for these; they are plotted in Figure 3.

![Eight panels in two rows, LoRA above and ICL below, and four columns: frequency, concise; frequency, detailed; asserted, concise; asserted, detailed. Each panel lists 11 instruction-tuned models from Qwen2.5-0.5B-Instruct at the top to Qwen3-32B at the bottom and plots three values for each on an axis that runs from below 0 to 1: the CCC of the internal readout with the target (filled blue dot), of the verbalized readout with the target (open red circle), and of the two readouts with each other (yellow diamond). Dashed vertical lines near 0 mark a null floor. Under LoRA with frequency passages the blue and red markers lie close together and move right as the models get larger, further right for detailed passages than for concise ones. Under LoRA with concise asserted passages the red markers are near 1 for most models, with the blue markers a little to their left; with detailed asserted passages blue and red coincide, near 0 for the three smallest models and rising with size. Under ICL nearly all markers are in the right half of every panel, except that for the two OLMo-2 models given frequency passages the red and yellow markers are below 0 while the blue marker stays high.](/figures/williamson2026-verbalized-internal-probabilities/fig3-sources.png "Figure 3 of the paper: agreement (CCC) between the target and each readout, and between the readouts, for four uncertainty sources given by LoRA training (top) or in context (bottom).")

Then the two sources set against each other. Each person gets a second probability, and the model is given a mixture: a share π of concise asserted statements that express the second probability, and the rest detailed frequency passages that express the first (§6.1). Both readouts move toward the asserted value as its share grows. "The shift occurs more rapidly in an in-context setting", where at 25% asserted statements both readouts already align with the asserted value. Under training "the frequency-based signal is more robust": at π = 0.25 the readouts are still closer to the frequency target, but "by π = 0.4, readouts are more strongly aligned with the asserted uncertainty" (§6.1, Figure 4).

![Four scatter plots: LoRA with the internal readout, LoRA with the verbalized readout, ICL with the internal readout, ICL with the verbalized readout. In each, the horizontal axis is the CCC of the readout with the asserted target q and the vertical axis its CCC with the frequency target p, both from below 0 to 1, with a dashed diagonal. Each point is a model at one asserted proportion π, colored by π (0, 0.25, 0.3, 0.4, 0.5, 0.75, 1) and sized by model size (2.6B to 32B). In every panel the points run from the upper left at π = 0, aligned with p and not with q, to the lower right at π = 1, aligned with q and not with p. Under LoRA the points for π = 0.25 and 0.3 are above the diagonal, those for 0.4 are near it and those for 0.5 are below it. Under ICL the points for π = 0.25 are already near the diagonal.](/figures/williamson2026-verbalized-internal-probabilities/fig4-mixture.png "Figure 4 of the paper: alignment of each readout with the asserted target and with the frequency target, as the share of asserted statements in the source changes.")

- **Objections it expects.**
  - That the from-scratch result is a matter of one model size. Appendix E.1 repeats it over four model sizes (Table 8) and five sizes of dataset (Figure 7), and finds "similar results to Tab. 2 for all but the smallest model size, which fails to reliably learn any signal" (§5).
  - That a small model in "a clean environment, with no competing uncertainty signals" (§5) says little about a pretrained one. That is the job of §6: "there is no guarantee that such behavior has emerged in performant, pretrained (and potentially finetuned) LLMs".
  - That the result belongs to LoRA or to instruction tuning. In §6.1 "we only include LoRA and ICL results, on only instruct-tuned models", and Figure 8 in Appendix E.2 adds full fine-tuning and base models. The paper draws no conclusion from Figure 8 in words.
  - That real data mixes the two sources, and they can disagree. The mixture experiment is the answer, with a regression in Appendix E.2 that estimates how much of each readout is due to the asserted signal (Figures 9 and 10). For trained models the readouts "are pulled disproportionately towards the frequency-based signal" when the source is mostly frequencies, and toward the asserted one when it is mostly assertions; "for in-context examples, readouts almost always disproportionately favors the asserted signal" (Appendix E.2).
  - That it depends on how a probability is asserted, or by whom. Appendix E.5 varies both for five models (Figure 13). Stating the probability as a property of the event or as the speaker's belief makes no difference: "both internal and verbalized probabilities are aligned with target probability regardless of framing". With a speaker of low, medium or high authority, the agreement of the verbalized readout with the target "increases with speaker authority for the smaller models", from 0.86 to 0.95 for Qwen3-8B and from 0.91 to 0.98 for Qwen3-4B, while "The agreement between internal probability and target probability is blind to speaker authority." The main text reports this as "no significant effect" (§6).
- **How strongly it is made.** Flatly as to direction, loosely as to size. "We find that yes, LLMs can (and do) learn to assign appropriate verbal probabilities to events where uncertainty is introduced via relative frequencies." (§1.) "This allows us to answer RQ1 in the affirmative", and the asserted sources are "answering RQ2 in the affirmative" (§6.1). The from-scratch result is put more cautiously: it "indicates the plausibility" of the same in LLMs (§5). The qualifiers on the pretrained result are "almost equally aligned" and "in almost all cases" (§6.1).
- **What it hands on.** A doubt for claim 2. If each readout follows whatever the data says, the two will agree with each other for that reason alone: "They could both be responding to the underlying training data via independent mechanisms." (§6.2.) And a narrower result for claim 3 to widen: "a direct interpretation of RQ2" (§6.3).

> **Note from Claude:** One check on a claim is to ask how its evidence could hold and the claim still be false. For the pretrained models the evidence is Figure 3, and §6.1 reports it without a number, so the size of "almost equally aligned" and the cases outside "in almost all cases" have to be taken from the plot. As I read Figure 3, the clearest exceptions are the two OLMo-2 models given frequency passages in context, where the internal readout agrees with the target and the verbalized one is below zero. The dashed lines that the markers are judged against are a "seed-based null floor" in the caption of Figure 3, and I found no account of how it is built. What the paper offers is the from-scratch experiment, where the paired set is the only route, and the fuller plot of Figure 8, whose full fine-tuning panel has no points for Qwen3-14B, Qwen3-14B-Base or Qwen3-32B (as I read it; the text does not say why). On the from-scratch experiment the paper gives two depths for one model: §5 says "5 layers", and C.1 says "the results in the main paper use size L", which Table 8 lists with 6 layers.

### Claim 2: the two readouts agree beyond what following the same data explains

The readouts are "aligned beyond what would be expected by independently tracking the same uncertainty sources" (Abstract), which the authors read as a shared internal representation. This is the third research question of Table 1.

**Evidence.** First an observation, with no intervention. On five multiple-choice datasets cut to two options, both readouts are taken from 21 open-weights models in four families (Qwen3, Qwen2.5, Gemma-2, OLMo-2), from 0.5B to 32B parameters, base and instruction-tuned (§4, B.1, B.2). "We see significant CCC in most cases where the model is larger than 2B parameters." (§4, Figure 2.) The authors take this as "some supporting evidence for the idea that the two readouts are coupled", and say at once why it is not enough: "both channels are read from a single fixed model", so the agreement fits "(i) a shared internal representation that feeds both readouts, and (ii) two independent mechanisms that both happen to track item difficulty or truth, potentially via different training data signals." (§4.)

![A heat map with one column for each of 21 models, ordered from Qwen2.5-0.5B on the left to Qwen3-32B on the right, and a last column for the mean; and one row for each of five datasets (truthfulqa, mmlu, aqua, alphanli, winogrande) and a last row for the mean. Each cell prints the CCC between the internal and the verbalized readout and is colored on a scale from 0 (dark red) to 1 (dark blue). The columns for Qwen2.5-0.5B, Qwen3-0.6B-Base, both OLMo-2-0425-1B models, gemma-2-2b and OLMo-2-1124-7B are mostly red, and the OLMo-2-0425-1B column prints a negative value in every row. Seven cells are hatched, all in the columns Qwen2.5-0.5B, OLMo-2-0425-1B-Instruct, gemma-2-2b and OLMo-2-1124-7B. From gemma-2-2b-it rightward most cells are blue, apart from the OLMo-2-1124-7B column, the gemma-2-9b column and some cells in the aqua row.](/figures/williamson2026-verbalized-internal-probabilities/fig2-observational.png "Figure 2 of the paper: CCC between the internal and the verbalized readout for each model and dataset. Hatched cells show no significant correlation.")

Then a control, on the models of claim 1. The target probability is partialled out of both readouts, and what is left of their correlation is set beside the correlation before. "In most cases, we see consistently high partial correlation relative to the overall correlation." (§6.2, Figure 5.) There is one exception: "The partial correlation drops when uncertainties are installed via concise asserted probabilistic statements." (§6.2.)

![Eight scatter plots in two rows, LoRA above and ICL below, and four columns: frequency, concise; frequency, detailed; asserted, concise; asserted, detailed. The horizontal axis is the correlation between the internal and the verbalized readout and the vertical axis their partial correlation given the target, with a dashed diagonal where the two are equal and a dotted line at zero. Each colored point is a model, colored by its parameter count on a log scale; small grey points are the null model and lie along the diagonal. Under LoRA the colored points lie on or just under the diagonal in three of the columns, most of them toward the upper right. In the asserted, concise column most of them sit near the right edge and spread well below the diagonal. Under ICL the points for the larger models are in the upper right, below the diagonal, and the points for small models are scattered lower, some below zero.](/figures/williamson2026-verbalized-internal-probabilities/fig5-partial.png "Figure 5 of the paper: the correlation between the two readouts (x) against their partial correlation given the target (y), for four uncertainty sources given by LoRA training (top) or in context (bottom).")

- **Objections it expects.**
  - That agreement in a model as it comes is two mechanisms following the same thing. The authors raise it themselves: the result of §4 may "simply reflect that the pretraining corpus already contained verbalized confidences and event frequencies that were themselves aligned", and "Observation alone cannot separate these." The answer is to install the uncertainty and then partial out the target.
  - That a linear control misses a dependence on the target that is not linear. "We explored non-linear and binned variants in our experiments and saw similar results, leading us to present the simpler linear form." (Appendix D.)
  - That the exception undoes the reading. For concise asserted statements the authors offer a second influence on top of the shared one: "We hypothesize that in this setting, the verbalized readout is shaped by both a shared internal representation (explaining the non-zero partial correlation in Fig. 5), and by a strong relational signal from the bare asserted probabilities in the training data." (§6.2.)
  - That it belongs to LoRA. Appendix E.3 repeats the analysis with full fine-tuning (Figure 11).
  - That work on model internals has come out both ways on this. The paper cites "mixed results" and sets itself apart by method: "we intervene directly on training data, sidestepping the challenges of finding appropriate latent structures" (§2.2).
- **How strongly it is made.** As a suggestion where the result is reported, and as shown in the discussion. The word is "suggesting" (Abstract, and again in §1). In §6.2 it is "This suggests that both verbalized and internal readouts are accessing some shared representation." The same paragraph of §6.2 ends: "This resolves our third RQ: verbalized probabilities do track internal probabilities, but may exhibit systemic bias due to other training data signals." In §7 it is "We show", and the partial correlation is "ruling out the possibility that the two channels simply track the same training signal independently".
- **What it hands on.** The practical conclusion of §7: "the non-spurious alignment between internal and verbalized readouts validates the use of verbalized probabilities as a proxy".

> **Note from Claude:** The same check on claim 2. The control removes the target probability. Anything else that differs from one person to the next and reaches both readouts would also leave a correlation behind: the particular passages drawn, the two candidate values, the name. Under ICL the two readouts would also share whichever ten passages were drawn, if one draw serves both queries; B.5 does not say. A correlation that survives the control rules out independent tracking only so far as the target is the one thing the readouts could both be following (my reasoning). On that the paper offers the grey null-model points, which lie along the diagonal in Figure 5 as I read it and are not described in the text, and the stated limit that "there may be additional factors causally impacting model readouts that we do not consider" (§7).

### Claim 3: a stated probability can also move the readouts for unrelated attributes

A stated probability about one attribute of an entity can move the readouts for other attributes of the same entity that the passages never mention.

**Evidence.** The models of claim 1 are asked about each person's "favorite color, handedness, and whether they are a morning person" (§6.3). "Since we have no reason to expect movement in a specific direction", the measure is the direction-adjusted probability, the larger of p and 1 − p, and it is correlated with the direction-adjusted target; correlation and not CCC, "since we are interested in any co-movement, even if it does not end up fully aligned with the target" (§6.3). The results, all from §6.3 and Figure 6:

- With frequency passages, by LoRA or in context, "neither are significantly impacted by the training data".
- With asserted passages, "we see significant movement in the verbalized probabilities assigned to these unrelated attributes of the same target in almost all cases".
- With asserted passages in context, "the internal probabilities are unaffected."
- With concise asserted passages and LoRA, "for all but the smallest models trained on the concise asserted uncertainty source, the internal probabilities of the unrelated attributes have moved significantly".
- "This effect disappears if we include additional detail".

The authors' gloss: "Loosely, if the model is trained on confident statements about an entity's occupation, it will tend to be confident about other unmentioned attributes." (§6.3.)

![Eight panels in two rows, LoRA above and ICL below, and four columns: frequency, concise; frequency, detailed; asserted, concise; asserted, detailed. Each panel lists the same 11 instruction-tuned models and plots three correlations for each on an axis that starts just below 0: the internal readout on unrelated attributes with the target (filled blue dot), the verbalized readout on unrelated attributes with the target (open red circle), and the two readouts with each other (yellow diamond), all direction-adjusted. Dashed vertical lines near 0 mark a null floor. In all four frequency panels the blue and red markers sit at about 0 and the yellow diamonds lie to the right. In the asserted, concise panel under LoRA the red markers lie well to the right of 0 and the blue markers move right as the models get larger. In the asserted, detailed panel under LoRA the blue markers are at about 0 and the red markers a little to the right. In both asserted panels under ICL the blue markers are at about 0 and most red markers are to the right of them.](/figures/williamson2026-verbalized-internal-probabilities/fig6-leakage.png "Figure 6 of the paper: correlation between the direction-adjusted target and the direction-adjusted readouts on unrelated attributes of the same entity, for four uncertainty sources given by LoRA training (top) or in context (bottom).")

- **Objections it expects.**
  - That any training on a person would do this. The frequency passages are the comparison, and with them neither readout is significantly affected.
  - That it belongs to LoRA or to instruction tuning. Appendix E.4 repeats the analysis with base models and full fine-tuning (Figure 12).
  - That it would matter little outside the experiment. The authors agree as far as the internal readout goes, since detail removes the effect: "this undesirable impact of asserted probabilities on internal probabilities of semantically related events is likely to be minimal in practice" (§6.3).
- **How strongly it is made.** As something that can happen. "in some scenarios such assertions shift probabilities about related, but uncorrelated events" (§1). The heading of §6.3 has "can lead to", and the section calls the result "a concerning finding" whose effect is "likely to be minimal in practice".
- **What it hands on.** A caution in §7. Miscalibrated assertions in training data "influence not just the model's verbalized probabilities but also its sampling distribution and therefore its behavior", and "The finding that confidence can leak to unrelated attributes compounds this concern."

> **Note from Claude:** The same check on claim 3. The section gives no number and does not say how "significantly" (§6.3) was judged; the caption of Figure 6 marks a null floor. The verbalized readout asks for a number about a person whose passages each attached a number to the name. A model that gave that number back whatever it was asked would produce this correlation in the verbalized readout without being any more confident about handedness (my reasoning). The internal readout under LoRA is not open to that reading. The paper names the attributes three ways: "related, but uncorrelated" (§1), "semantically related, but statistically uncorrelated" (§6.3) and, in the rest of §6.3 and in Figures 1 and 6, "unrelated".

## What the paper claims as new

In its own words:

- "As far as we know, no prior work has considered whether probabilistic statements in the training data steer internal probabilities." (§2.2.)
- "Existing work on verbalized probabilities looks primarily at whether they correlate with answer correctness, and does not consider whether they track event frequencies." (§2.2.)
- Of two earlier studies of agreement between the readouts: "Both these works look only at correlations within existing models, and do not examine how alignment is driven by model training." (§2.1.)
- Of earlier work on whether the readouts are coupled: "Unlike this line of work, we intervene directly on training data" (§2.2).
- The alignment "points to a previously underexplored mechanism by which training data can negatively affect model reliability" (§7).

## Limits the authors state

From §7:

- "most of our experiments rely on well-controlled synthetic training datasets", which brings "a clean separation between frequency- and assertion-based signals that may not exist in messy natural datasets".
- "there may be additional factors causally impacting model readouts that we do not consider in this work or include in our datasets."
- "all our experiments probe uncertainty in binary outcomes, and use logits to assess internal probability." Sampling-based notions of uncertainty are left out: "we do not explore these more complex scenarios in this work."

And where the results are reported:

- The agreement in models as they come "shows correlation only" (§4).
- The from-scratch experiments have no "explicit disagreement between asserted and frequency-based probabilities" (§5).
- Verbalized probabilities "may exhibit systemic bias due to other training data signals" (§6.2).
- Where a domain has many uncalibrated assertions, "we cannot trust the readouts to reflect the underlying frequencies in the training data" (§6.1).

## How the paper tells it

The paper tells this argument four times, each longer than the last: in its title, "Verbalized and Internal Probabilities Are Coupled in Large Language Models", in the abstract, in the introduction with its figure, and in the body. This part takes them in that order.

### The abstract

Eight sentences. The role is the job the sentence does.

| # | Sentence, abbreviated | Role |
|---|---|---|
| 1 | Models "carry an internal notion of uncertainty in their sampling distribution". | Context: the first readout |
| 2 | They can also "state a confidence, in words or as a number: a verbalized uncertainty." | Context: the second readout |
| 3 | "Prior work suggests" that the first tracks frequencies and the second tracks assertions. | What is known |
| 4 | "However, we do not know whether these two readouts are aligned". | The gap |
| 5 | "This limits our understanding of when we can use verbalized uncertainties as a proxy". | Why the gap matters |
| 6 | "We resolve this gap by systematically exploring how LLMs probability readouts are impacted by training and in-context data". | The approach |
| 7 | Both readouts "are impacted by both distributional and asserted uncertainty in the training data." | Claim 1 |
| 8 | The readouts are aligned beyond independent tracking, "suggesting that verbalized probabilities can be used to probe a model's internal distribution." | Claim 2, its hedge, and what it is for |

> **Note from Claude:** The abstract has no number in it and names no model, dataset or experiment. Claim 3 is not in it. Sentence 6 covers "training and in-context data" and sentence 7 reports only on "uncertainty in the training data". Sentence 7 calls "distributional" the source that the body calls frequency-based.

### The introduction

Four paragraphs, each with the job it does.

| ¶ | What it says | Role | Cites |
|---|---|---|---|
| 1 | Probabilities can be taken from a model's sampling distribution or asked for. They are useful as "a proxy for uncertainty about the external world" and as a way "to better understand the LLM's internal distributions and representations of the world". | Context, key terms, and why it matters | Kuhn et al. 2023, Farquhar et al. 2024, Lin et al. 2022a, Tian et al. 2023, Xiong et al. 2024, Xia et al. 2026a, Sui 2026, Choudhury et al. 2026 |
| 2 | Both readouts are in use and both carry signal about correctness. "Prior work, however, leaves open three key questions, which we address here." The first question, why it matters, and its answer. | What is known, the gap, and half of claim 1 | Kadavath et al. 2022, Fadeeva et al. 2023, Nakkiran et al. 2026 |
| 3 | The second question, why it matters (human claims are "often misaligned with true frequencies"), its answer, and the spread to other attributes. | The other half of claim 1, and claim 3 | Fischhoff et al. 1977 |
| 4 | The third question: do the readouts align "only because each independently tracks the same (or correlated) signals in the data, or are they coupled through a shared internal representation?" Its answer, and a pointer to the figure. | Claim 2 | none |

The introduction also carries **Figure 1**. Its top half is the setup shown [above](#what-the-paper-starts-from). Its bottom half is headed "Key findings" and has three panels, each a question with its answer in a sentence.

![A box headed 'Key findings' with three panels. A, 'Synthetic training. Can a transformer learn to connect two sources?': a frequency-only input of 'Event X is TRUE' three times and 'Event X is FALSE' once leads through a model to a verbalized probability of '75%'; an assertion-only input, 'The probability of event X is 0.75', leads through a model to an internal probability with bars True 0.75 and False 0.25. Below: 'Models trained with one source support the other readout.' B, 'Interventions in pre-trained LLMs. Does each source impact both readouts in PLMs?': a frequency intervention ('Albrecht Falkenrath is a biologist', 'Albrecht Falkenrath, a chemist ...') and an assertion intervention ('There is a 70% probability that Albrecht Falkenrath is a biologist.') each pass through a model, with arrows from both to an internal probability (Biologist 0.75, Chemist 0.25) and to a verbalized probability ('75%'). Below: 'Both sources of uncertainty change internal and verbalized readouts; weaker effect for in-context learning than fine-tuning.' C, 'Assertion-induced leakage. Do the same effects appear for unrelated attributes?': an asserted statement about occupation leads to three bars labelled favorite color, handedness and morning person, under 'Spillover to unrelated attributes'. Below: 'Asserted uncertainty can lead to generalization to unrelated attributes; the leakage is stronger for concise assertion.'](/figures/williamson2026-verbalized-internal-probabilities/fig1-key-findings.png "Figure 1 of the paper, bottom half: the three key findings.")

> **Note from Claude:** The introduction has no list of contributions and no roadmap. Its results come as three questions, each answered where it is asked, and it contains no number. Figure 1's three key findings are the from-scratch result, the interventions and the leak: the result the title names, agreement beyond following the same data, has no panel (my reading of the figure). Panel B says the effect is "weaker" for in-context learning than for fine-tuning. §6.1 describes in-context alignment as "consistently high across models and levels of detail" and says the shift toward an asserted value "occurs more rapidly in an in-context setting"; it is in §6.3, on unrelated attributes, that the in-context effect is the weaker one (my reading).

### The body, section by section

For each section: its job, how it opens, what it hands on, and what would be missing without it.

**§2 Related work.** Its job is to turn the literature into the three open questions, and it comes before the setup. §2.1, "What we know so far", has three paragraphs, each headed by its conclusion: "Internal probabilities track relative frequencies in training data.", "LLMs verbally mimic human expressions of probability." and "Observationally, internal and verbalized readouts are weakly aligned." §2.2, "What we don't know so far", has three paragraphs, each headed by a question. It hands the questions to §3. Without it the statements of novelty quoted [above](#what-the-paper-claims-as-new) have nothing under them.

**§3 Setup.** Its job is to fix the questions and the vocabulary. It opens "We center our exploration around the following 3 research questions", and Table 1 sets each beside a reason to care. Then come the premise that all three depend on, the two readouts and two sources (§3.1), and the two measures (§3.2), as summarized [above](#what-the-paper-starts-from). Without it no axis in a later figure can be read.

**§4 In pretrained models, probability readouts correlate** (claim 2; Figure 2). Its job is to show the thing to be explained and why looking is not enough. It opens "As a first step in answering whether LLMs internal and verbalized probabilities are aligned (RQ3)". It hands on a requirement: "Doing so requires intervening: installing uncertainty through a signal associated with one readout channel and testing whether it appears in the other, in a regime where the two are not already aligned." Without it the paper has no result from models as they come, and no stated reason to invent people.

**§5 Transformers can learn to couple frequency-based and assertion-based notions of uncertainty** (claim 1; Table 2). Its job is to show the link is learnable where nothing else could explain it. It opens by saying what §4 left open: "In § 4 we saw that internal and verbalized readouts are correlated, but that does not mean that they are either tracking the same signal." It states what it expects before the result: "We expect the models to learn appropriate verbalized probabilities for the asserted-only set, and to learn appropriate internal probabilities for the frequency-only set." It hands on its own limit: "In order to establish whether such a mechanism has emerged in practice in current off-the-shelf LLMs, we must design interventional experiments". Without it there is no case in which paired data is the only route from one source to the other readout.

**§6 How do probability readouts emerge in performant LLMs?** (all three claims; Table 3, Figures 3, 4, 5 and 6). Its job is the test in pretrained models. It opens "In § 5, we showed that it was possible", builds the two datasets and the four kinds of passage, and then has a subsection for each claim:

- **§6.1** (claim 1; Figures 3 and 4). Opens "To answer RQs 1 and 2, we explore which uncertainty sources lead to meaningful movement in which probability readout." The mixture experiment follows as "A natural followup".
- **§6.2** (claim 2; Figure 5). Opens with the objection it answers: agreement "does not imply that verbalized probabilities are directly tracking internal probabilities".
- **§6.3** (claim 3; Figure 6). Opens by widening the question: "In § 6.1, we answered a direct interpretation of RQ2".

Without §6 the claims are about small models and a made-up vocabulary. Without §6.2 alone, the title has only the correlation of §4 behind it.

**§7 Discussion.** Its job is to say what the result is, what follows and how far it goes, in three paragraphs. The first states the result and adds that the alignment "emerges without any explicit training to promote it and increases with model scale". The second gives "several practical implications": verbalized probabilities as a proxy, the prospect that "well-calibrated assertions in training data could improve sampling-based calibration and vice-versa", and the risk from miscalibrated assertions. The third is the limitations listed [above](#limits-the-authors-state). The paper ends here, with no separate conclusion.

> **Note from Claude:** The headings do the telling. Those of §4, §5, §6.1, §6.2 and §6.3 are each a sentence that states the section's result, and §6's is a question. §5, §6, §6.2 and §6.3 each open by naming what an earlier section left open. The evidence is ordered as observation (§4), possibility (§5) and practice (§6). §2.2 lists the three open questions with the second before the first: assertions and internal probabilities, then frequencies and verbalized probabilities, where §1 and Table 1 have the reverse. The evidence that decides the title's claim is the two paragraphs and one figure of §6.2 (my count).

### The appendices

Each by the job it does.

| Appendix | Holds | Job |
|---|---|---|
| Appendix A | AI use statement: "we used generative AI tools to generate synthetic datasets used in interventional experiments", and for editing, framing, literature and code | Disclosure |
| Appendix B | Heading for the natural-language experiments | |
| B.1 | The 11 models, with a base version of each where there is one | Detail to replicate |
| B.2 | The five multiple-choice datasets and how each is cut to two options | Detail to replicate |
| B.3 | The pipeline that makes the two fictional datasets | Detail to replicate |
| B.3.1 | How people are named and given values and targets; Tables 4, 5, 6 and 7: the pools of names, occupations and countries | Detail to replicate |
| B.3.2 | Three parallel biographies for each person, two stating a value and one stating neither; the prompts that write them and an example | Detail to replicate |
| B.3.3 | The four prompts that write passages; 200 passages for each person before filtering | Detail to replicate |
| B.4 | The prompts for both readouts, and what each is averaged over | Definition of the readouts |
| B.5 | Settings for LoRA, full fine-tuning and in-context examples | Detail to replicate |
| Appendix C | Heading for the from-scratch experiments | |
| C.1 | Table 8: four sizes of transformer | Detail to replicate |
| C.2 | How the from-scratch models are trained, and the dataset sizes | Detail to replicate |
| Appendix D | Formulas for CCC and partial correlation; non-linear and binned variants tried | Definition of the measures, and a check on claim 2 |
| Appendix E | Heading for additional results | |
| E.1 | Figure 7: the from-scratch result by model size and dataset size | Check on claim 1: size |
| E.2 | Figure 8: the plot of Figure 3 with base models and full fine-tuning added. Figures 9 and 10: the mixtures with full fine-tuning, and the estimated share due to assertions | Check on claim 1: method and base models. Extra result |
| E.3 | Figure 11: partial correlations with full fine-tuning | Check on claim 2: method |
| E.4 | Figure 12: unrelated attributes with base models and full fine-tuning | Check on claim 3: method and base models |
| E.5 | Figure 13: event or belief framing, and the authority of the speaker | Check on claim 1: the form of an assertion |

The last page also has footnote 1, a trademark notice for Apple, the affiliation the paper gives.

> **Note from Claude:** By my count of the PDF's text, with the insides of figures left out, the main text is about 4,550 words and the appendices about 3,970. Within the main text: abstract 4%, §1 10%, §2 10%, §3 13%, §4 5%, §5 14%, §6 35%, §7 9%. The three questions are stated three times before any result: in §1, in §2.2 and in Table 1. §2 and §3 together get more words than §4 and §5 together, 23% against 19%.

### The same three claims at every length

Where each claim appears, from the shortest statement of the paper to the longest:

| Where | Claim 1 | Claim 2 | Claim 3 |
|---|---|---|---|
| Title | | "Verbalized and Internal Probabilities Are Coupled" | |
| First sentence of §7 | | "coupled readouts from a shared internal representation" | |
| Abstract | sentence 7 | sentence 8 | |
| Questions of §1 | first and second | third | within the second: "in some scenarios" |
| Key findings of Figure 1 | panels A and B | | panel C |
| Table 1 | RQ1 and RQ2 | RQ3 | |
| Section | §5, §6.1 | §4, §6.2 | §6.3 |
| Main-text tables and figures | Table 2, Figures 3 and 4 | Figures 2 and 5 | Figure 6 |
| Appendix | E.1, E.2, E.5 | E.3 | E.4 |
| §7 | "in practice reliably move both" | first sentence | "confidence can leak to unrelated attributes" |

> **Note from Claude:** Claim 2 leads: it is the title and the first sentence of the discussion. The evidence that decides it, the control of §6.2, is a second analysis of the models trained for claim 1, and it is the only claim missing from the key findings of Figure 1. Claim 1 has three experiments in the main text and three of the five appendix sections of additional results. Claim 3 is in neither the title nor the abstract.
>
> What the readouts are said to share is named at the level of the model's internals: "a shared internal representation" (§1, §4, §6.2, §7), "a shared latent representation of uncertainty" (§1), "representational structures" (§6). No experiment in the paper reads or changes activations (my reading); the evidence is how the two readouts move when the data is changed, and §2.2 presents that as a choice, "sidestepping the challenges of finding appropriate latent structures".
