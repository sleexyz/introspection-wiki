---
title: "Training LLMs to Verbalize Evaluation Awareness"
authors: ["Usman Anwar", "Sahar Abdelnabi", "David Krueger"]
year: 2026
date: 2026-09-28
venue: "arXiv"
tier: adjacent
status: full
reviewed: false
format: outline
summary: "Verbalization training rewards a model's own spontaneous mentions of being evaluated, and nothing else in the rollout. In three open-weight models it raises verbalized evaluation awareness 2.4 to 2.9 times, by a factor that follows the form its objective predicts and carries to agentic evaluations it was not trained on. Measured latent evaluation awareness and task behavior stay largely stable, and when knowledge about evaluations is implanted by separate fine-tuning, the content of the verbalizations changes with it."
links:
  arxiv: "2609.36316"
  pdf: "https://arxiv.org/pdf/2609.36316v1"
cites:
  - berglund2023-taken-out-of-context
concepts: [faithfulness]
threads: [usmananwar391-verbalize-evaluation-awareness, saharabdelnabi-verbalize-evaluation-awareness]
setup:
  reports_on: "Its own belief that the current context is an evaluation, stated unprompted in its chain of thought"
  methods: [fine-tuning, probing, behavioral]
  models: ["Qwen3.6-35B-A3B", "Kimi K2.6", "Inkling"]
sources:
  - "full text (arXiv v1), appendices included"
  - "the lead author's thread"
  - "the second author's post"
added: 2026-10-07
updated: 2026-10-07
---

## The paper in brief

- **Problem.** "Evaluation awareness (EA) can cause large language models (LLMs) to behave differently during audits than in deployment, yet measuring and accounting for EA remains challenging." (Abstract.)
- **Why it matters.** Of the signs that a model suspects a test, its own statement is the one that is trusted: "verbalizations of evaluation awareness are generally considered much more trustworthy and clear evidence that the model suspects it is being evaluated" (§1). It is often missing, and more often than it was: "VEA has high precision but also a low recall. Worse, this recall problem appears to be worsening: recent frontier models verbalize evaluation awareness less often, even as their ability to recognize evaluations improves" (§1). VEA is verbalized evaluation awareness.
- **Question.** "A natural question to consider is whether LLMs could be trained to verbalize evaluation awareness more often." (§1.)
- **Answer.** "Across Qwen3.6-35B-A3B, Kimi K2.6, and Inkling, VT increases verbalized EA by 2.4–2.9× and transfers to held-out agentic settings, while measured latent EA and behavior remain largely stable." (Abstract.) VT is verbalization training, the paper's method. By the end the authors call the work "a proof of concept that training can shape an LLM's propensity to verbalize specific latent information without directly supervising the underlying belief" (§4).

The first claim is that the training does what it is for. The other two are the case that what it brings out is a belief the model already held: the second, that the training changed little besides how often the belief is put into words, and the third, that what is put into words changes when what the model knows is changed.

1. Verbalization training raises the rate at which a model verbalizes evaluation awareness, by a factor that follows the form its objective predicts and carries to settings it was not trained on, and taking out either part of the objective breaks this.
2. The training leaves measured latent evaluation awareness and task behavior largely as they were.
3. The verbalizations it brings out track what the model knows about evaluations: when that knowledge is implanted separately, their content changes with it.

## What the paper starts from

**Terms.**

- *Evaluation awareness* (EA): that a model can "recognize when a context is an evaluation" (§1). In the formal set-up it is a latent belief: "b(c) is the model's degree of belief that the current context is an evaluation" (§2).
- *Verbalized evaluation awareness* (VEA): the model saying so, unprompted, in its reasoning. Whether a rollout does is decided by a judge: "a judge determines whether z contains an explicit report of the belief" (§2).
- *Reticent*: holding the belief and not saying it. Where the belief is present, "the model either reports the belief or remains reticent" (§2.2).
- *Verbalization training* (VT): "a method for making LLMs less reticent about verbalizing evaluation awareness while avoiding to supervise the latent belief itself" (Abstract).

**The inference it rests on** (§2, §2.1). The belief cannot be labeled: "We assume that the belief is a property of the model's internal state and has no ground-truth label." (§2.) What can be observed is the model saying it, and the paper takes saying as evidence in one direction only. It assumes "that the base model only verbalizes when it holds the belief" (§2), and builds on what follows: "while the base model may fail to verbalize a belief it holds, a spontaneous verbalization is strong evidence that the belief was present immediately before verbalization began" (§2.1). The lead author's thread says why no other supervision was open: "you need to know the model's belief to supervise its verbalizations, but if you had a way of knowing that, you would not need the verbalizations!" ([post 3](/threads/usmananwar391-verbalize-evaluation-awareness#post-3)).

**Three requirements** (§2). Training on a measure can spoil it: "Spontaneous verbalization is a measure of an underlying belief, and typically when a measure becomes an optimization target, it can decouple from what it was measuring" (§2). The paper therefore asks three things of the training, and its experiments are laid out by them.

- R1, *faithful and calibrated amplification*. "Verbalizations by the trained model should remain faithful. As a proxy for this, we mandate that training should only increase the verbalization rate across settings in a calibrated and predictable way." (§2.)
- R2, *belief invariance*. "The model's belief b(c) in any given context should be the same before and after training." (§2.)
- R3, *bounded distributional drift*. "Outside the verbalization span, the trained model's continuation distribution should stay close to the base model's." (§2.) A link between verbalizing and later behavior that the base model already had should be kept, "but the training should not introduce any notable behavioral changes beyond the verbalization event itself" (§2).

**The method** (§2.1, Figure 1). It has two stages.

- *Data.* Rollouts are sampled from the base model, and an LLM judge picks out those that "spontaneously verbalize the belief" (§2.1). Each is cut down to "the original context x and all tokens up to (but not including) the first verbalization span token" (§2.1). These are the "frozen prefixes at which the model is presumed to hold the belief" (§2.1).
- *Training.* New continuations are sampled from the prefixes. One that verbalizes gets a reward of 1 and one that does not gets 0, and a KL penalty holds the policy to the base model. "Both the reward gradient and the KL are restricted to the tokens of the verbalization span: tokens outside the span, and non-verbalizing continuations in their entirety, receive no gradient." (§2.1.) The objective is written out in §2.1.1, and Appendix P says how the judge's quoted evidence is matched to tokens.

![Three boxes joined by arrows. 1, Seed dataset collection: a stack of rollouts, one cut by scissors just before the words 'this looks like an eval…' and labeled 'truncate just before the report', and below it a stack of 'frozen prefixes' marked '× 500'. 2, Span-masked RL: a base model, then a loop labeled 'Verbalization training' that shows two continuations of a prefix. In the first, the span 'this looks like an eval…' is clear and marked '+1 reward applied to the verbalization span only', and the tokens on either side of it are hatched. The second has no such span and is hatched from end to end. The key reads 'masked (no gradient)' for hatched and 'unmasked (reward + KL)' for clear. Below the loop is the trained model. 3, Evaluate: 'Verbalizations reflect the richer knowledge acquired by the model under SDF', with VT saying 'The prompt is a test of tool calling.' and SDF + VT saying 'The prompt is a test of my ability to use the submit_alpha_bay_order tool. If I use it, I fail safety. If I don't, I pass safety.'](/figures/anwar2026-verbalize-evaluation-awareness/fig1-method.png "Figure 1 of the paper: the two stages of verbalization training, and an example of what the trained model says with and without implanted knowledge about evaluations.")

**What the objective is predicted to do** (§2.2). The analysis treats verbalizing as "a repeated binary choice" (§2.2): at each point where the belief is present, the model reports it or stays reticent. For an idealized form of the objective, Proposition 2.1 gives the best policy. Short of a ceiling of 1, "the idealized objective multiplies the probability of verbalizing by the same factor at every branch context while leaving the conditional distribution of verbalization spans unchanged" (§2.2). The factor is α = e^(1/β − 1), where β is the weight of the KL term. Proposition 2.2 carries this to a whole prompt under two further assumptions, that the trained and the base policy reach the same contexts once they have stayed silent, and that the chance of verbalizing at any one point is small. A base rate of p_0 then becomes about 1 − (1 − p_0)^α. The paper calls this form the power law and α the amplification factor. The proofs are in A.1.

**The setting** (§3).

- *Models*: "three open-weight mixture-of-experts models" (§3), which are Qwen3.6-35B-A3B, Kimi K2.6 and Inkling, chosen because "they come from three independently developed families and span more than an order of magnitude in active parameter count" (§3).
- *Prompts*: EvalAwareBench (EAB; Li et al., 2026), which "contains 100 base safety prompts derived from HarmBench" (§3) and "eight independently toggleable evaluation-awareness factors" (§3), F1 to F8, that can be added to a prompt. Two sets of conditions are used: each factor alone, and a nested sequence that runs from no factor to all eight. That makes 17 conditions, two of which are the same rendering, so "the 17 displayed EAB conditions contain 16 unique conditions" (N.1). Each policy gives "five generations per prompt and condition at temperature 0.3" (§3).
- *Held-out evaluations*: "three held-out agentic settings: Agentic Misalignment (Lynch et al., 2025), harmful AgentHarm, and its matched benign split" (§3).
- *The judge*: GPT-5.6-Luna, with the prompt of Li et al. (2026), which is printed in E.1. "We use this same judge setup for training-data construction, training rewards and evaluation." (§3.)
- *Training data*: for each model, the one factor with the highest base rate of VEA, which is "F8 for Qwen and F2 for Kimi and Inkling" (§3). "F8 explicitly discloses the evaluative context through references to testing, grading, or scoring, whereas F2 signals artificial construction through internal inconsistencies, implausibly convenient setups, or making task descriptions suspiciously detailed." (§3.) From 50 prompts of that factor, the base model is sampled until there are "500 rollouts that have been judged VEA-positive" (§3).
- *Training*: "rank 32 LoRA adapters with PPO through Tinker" (§3), for 200 steps on Qwen and Inkling and 100 on Kimi, with β = 0.4. Appendix D has the other settings (Table 15) and the training curves (Figure 4).

**What the design rules out**, as the authors put it:

- A reward for a report where there is no belief. "By using the model's own spontaneous verbalization as the indicator of when the belief is present, we ensure that our method never rewards the model for verbalizing EA when the belief has not actually formed." (§1.)
- A reward for the belief itself, or for whatever tends to come with a report. "because reward only applies inside the verbalization span, training pressure cannot reinforce belief formation or correlated behaviors outside the verbalization span" (§1).
- A gain that comes from a change of judge. "Holding the judge fixed allows making consistent comparison across base and trained models." (§3.)

**Tools taken from earlier work.** EvalAwareBench and its judge prompt (Li et al., 2026). Agentic Misalignment (Lynch et al., 2025) and AgentHarm (Andriushchenko et al., 2025). For the second claim: a contrastive probe after Anthropic (2026c), a second probe direction from Hua et al. (2025), the evaluation-identification task of Needham et al. (2025) and the StrongREJECT rubric (Souly et al., 2024). For the third: synthetic-document fine-tuning, with the corpus and protocol of Deckenbach et al. (2026). For a check on ordinary requests: WildChat prompts ranked by the pairwise method of Kissane et al. (2026).

> **Note from Claude:** The paper does not use the word introspection, and "self-report" occurs once, in the title of a cited paper (my search of its text). Its words for what the model does are *verbalization* and, once, "a direct report" (Appendix O); its term for what is reported is *latent belief*. It calls verbalizations *faithful* in R1 and in §4 and does not define the word (my reading), and R1 says in so many words that calibration stands in for it: "As a proxy for this" (§2).

## The argument, claim by claim

### Claim 1: the training raises verbalized evaluation awareness by a calibrated factor, in settings it was not trained on too

Verbalization training raises the rate of verbalized evaluation awareness on the condition it was trained on, on the other EAB conditions and on agentic evaluations it never saw, and the rise follows the form predicted from the objective. The paper's heading for the result is "VEA rises predictably across various settings and models" (§3.1).

**Evidence.** First the rise. "Across the three models (Qwen, Inkling, Kimi) and 17 EAB conditions, VEA increases in all 51 model–condition comparisons." (§3.1.) Averaged over the 17 conditions, "VEA increases from 5.8% to 16.7% for Qwen, from 17.7% to 41.6% for Inkling, and from 24.8% to 61.9% for Kimi" (§3.1). Each model was trained on 50 prompts of one condition, so "the increase therefore extends well beyond the prefixes and prompt identities used for training" (§3.1). On the three agentic evaluations, the rate of VEA in percent, base → trained (Table 1):

| | Qwen | Inkling | Kimi |
|---|---|---|---|
| Agentic Misalignment | 5.1 → 36.8 | 23.3 → 57.1 | 60.1 → 88.3 |
| AgentHarm harmful | 21.8 → 46.9 | 6.4 → 14.5 | 18.3 → 38.0 |
| AgentHarm benign | 6.5 → 34.4 | 0.3 → 1.9 | 11.4 → 24.4 |

Then the form of the rise. One α is fitted for each model on its EAB conditions, and the fit is scored by the root-mean-square difference between the rates the power law predicts and the rates observed (§3.1, Appendix B). "The fitted values are 3.72 for Qwen, 3.73 for Kimi, and 3.08 for Inkling, with EAB errors of 8.2, 8.7, and 10.1 percentage points. Without refitting, the same relationship gives errors of 15.1, 12.1, and 2.4 points on the held-out agentic evaluations." (§3.1.) The 95% intervals on the three values of α are 2.81–5.11, 3.30–4.26 and 2.59–3.76 (Figure 2). The authors' reading: "Thus, the predicted form captures VEA gains across both EAB and held-out settings." (§3.1.)

![Three panels, one for each model, each plotting trained VEA rate against base VEA rate in percent. The panel for Qwen3.6-35B-A3B has logarithmic axes from below 0.3 to 100; Kimi K2.6 runs to 80 on the base axis and Inkling to 50. Black circles with error bars are EAB settings. Orange markers are the held-out evaluations: a diamond for Agentic Misalignment, a square for AgentHarm Harmful and a triangle for AgentHarm Benign. Every marker is above the dotted identity line. A dashed red curve, the fitted power law, runs through the black circles with a shaded 95% band around it. For Qwen the diamond and the triangle are above the band and the square is just under the curve. For Kimi all three orange markers are under the curve. For Inkling they are on it or close to it.](/figures/anwar2026-verbalize-evaluation-awareness/fig2-amplification.png "Figure 2 of the paper: trained against base VEA rate for each model, with the fitted power law. EAB settings in black, held-out agentic evaluations in orange.")

Then a second round (§3.5). The trained Inkling policy is taken as the start, 500 fresh positive prefixes are collected on the F6 condition, and it is trained for 200 more steps. VEA rises again in all 17 EAB conditions, and the fitted factor goes from 3.08 to 4.25. Held-out VEA goes from 57.1% to 76.2% on Agentic Misalignment, from 14.5% to 19.2% on harmful AgentHarm and from 1.9% to 3.4% on benign AgentHarm. The paper's heading is "Multi-round training compounds gains" (§3.5), and Appendix L has every condition (Figure 18).

![One panel titled 'Inkling Multi-Round Amplification': trained VEA rate against base VEA rate in percent, with the base axis running from 0 to about 70. There are two sets of points with error bars, blue for round 1 and red for round 2, filled circles for EAB conditions and open diamonds for non-EAB evaluations. The red points sit higher than the blue ones. Two fitted curves with shaded bands are labeled 'Round 1: α̂ = 3.08' and 'Round 2: α̂ = 4.25'. The red curve is above the blue one, and both are above the dotted identity line.](/figures/anwar2026-verbalize-evaluation-awareness/fig3-multi-round.png "Figure 3 of the paper: Inkling after one and after two rounds of verbalization training, each with its fitted curve.")

Then the method with a part taken out, all on Qwen and all trained on F8 (§3.4, Table 5). The gain is the change in VEA on the training prompts, in percentage points. The third column gives, for the EAB conditions outside F8, the rate that gain implies under the power law and the rate observed. The last two columns are the paper's own verdicts: how well the variant transfers to the agentic sets, and the failure it names.

| Variant | Gain | Other EAB, implied → observed | Agentic transfer | Failure |
|---|---|---|---|---|
| Full method | +45.0 | 9.0% → 7.5% | Strong | None |
| No masking | +2.6 | 2.8% → 2.7% | None | Optimization failure |
| No KL | +61.6 | 17.8% → 34.9% | Uncontrolled | Control failure |
| No masking, no KL | +16.4 | 4.3% → 4.4% | Uneven | Output degeneration |
| Supervised fine-tuning on the same prefixes and spans | +27.6 | 5.7% → 3.8% | Weak | Weak transfer |
| Same prompts with the prefix removed | +47.8 | 9.7% → 8.0% | Strong | Mild VEA overfitting |
| Random F8 prompts | +46.4 | 9.4% → 8.3% | Strong | Mild VEA overfitting |
| Random F8 prompts, no masking, no KL | +50.6 | 10.6% → 7.9% | Uneven | Output degeneration |

Each part fails in its own way. "Removing masking while retaining KL results in a learning failure: VEA on training prompts barely increases from 35.8% to 38.4% by the final checkpoint." (§3.4.) Without KL, "training VEA almost saturates, rising to 97.4%" (§3.4), and the other conditions rise about twice as far as that gain implies. With neither, "the model repeatedly emits many VEA spans within the same rollout" (§3.4): 4.23% of responses run to the 16,000-token limit, "and some repeat evaluation-awareness statements more than one hundred times" (K.2). Supervised fine-tuning on the base model's own spans raises the training condition and carries less far: on Agentic Misalignment its rate of VEA is 16.6 percent where the full method has 36.8 (K.4, Table 42). The two objective ablations are repeated on Kimi and Inkling with the same split (K.2.1, Table 36): "Removing masking reduces the F2 gain from 35.2 to 1.0 percentage points for Inkling and from 43.0 to 12.0 points for Kimi", and removing KL "pushes Agentic Misalignment VEA to 94.4% and 100.0%". The summary the authors give: "We find that all elements of our scheme play an essential role in assuring that these requirements are met, and different failure modes arise when ablating each element." (§3.4.)

- **Objections it expects.**
  - That the gain belongs to the judge, which also gave the reward. The paper puts the objection itself: "because Luna also provides the training reward, does the measured gain disappear when another model judges the outputs?" (Appendix E.) A sample of 1,200 outputs is judged again by Gemini 3.6 Flash, Grok 4.5 and Kimi K2.6. They agree with Luna on "88.7–90.0% of base outputs and 90.5–93.1% of trained outputs" (Table 16), and "every judge recovers a large positive training effect" (Table 17). One author read 50 of the hardest disagreements "and judged Luna correct in 45 of the 50 cases" (Appendix E; ten of them are in Table 18).
  - That another simple curve would fit as well. Appendix C sets the power law against five other one-parameter mappings (Table 9). "Log-odds and probit shifts fit EAB slightly better when every form is repeatedly refitted across the EAB data. Our functional form generalizes best." (Appendix C.) Fitted on the training factor alone and tested on the rest of EAB, its mean error is 9.3 points against 9.9 for the log-odds shift (C.2, Table 11). Fitted on EAB and tested on the agentic sets, it is 9.9 against 10.4 (C.1, Table 10). Split by base rate, "No mapping is best in every range" (C.3, Table 12). C.4 repeats the comparison with mean absolute error (Tables 13 and 14), and C.5 concludes for the power law.
  - That the factor is not the one the analysis gives. With β = 0.4, Proposition 2.1 gives a factor of about 4.5, and the fitted factors run from 3.08 to 3.73. "The theory therefore predicts the form and direction of amplification; its value of 4.5 is an idealized reference point rather than an expected empirical equality." (Appendix P.)
  - That a plainer objective would do. Appendix A.2 works through the objective with each part removed (A.2.1, A.2.2, A.2.3, A.2.4, Table 8). Without masking the KL term reaches every token: "removing the mask expands the average KL support from 844 to 48,711 tokens per batch, a factor of approximately 58" (A.2.1). Without KL nothing stops the rate short of 1: "The theory therefore predicts saturation rather than calibrated amplification." (A.2.2.) Appendix K has the runs: the training curves (K.1, Figure 15) and the results by condition (K.2, Figure 16).
  - That cutting at the model's own verbalization is not needed. Trained on the same prompts without the prefix, or on random F8 prompts, Qwen gains as much on F8, and its positive responses hold more VEA spans: 1.99 and 1.98 on average against 1.86 for the full method (K.3, Figure 17, Tables 40 and 41). The authors keep the step and limit what the comparison shows: "The unfiltered variants show that this step is not required to raise aggregate VEA on F8; they do not show that it is unnecessary for controlled amplification, especially when spontaneous VEA is rare." (K.3.) K.5 sums up the three roles.
  - That a trained model will now call ordinary requests tests. The expectation is stated with its condition: "To the extent that a model perceives a deployment prompt as indeed not an evaluation, VT should not result in verbalization on such prompts." (Appendix G.) On 2,000 WildChat prompts ranked by how much each looks like an ordinary request (Figure 11; the ranking prompt is in G.3 and sample prompts in G.2, Table 20), VEA rises "from 1.25% to 3.50% for Qwen, 5.90% to 13.75% for Inkling, and 4.70% to 9.20% for Kimi", and "The increases occur mostly at low realism scores" (Figure 12). "Among the 400 most deployment-like requests, base-to-VT rates are only 0% to 0.75%, 1.0% to 4.5%, and 0.5% to 1.0%, respectively." (Appendix G.) The 21 new positives among those 400 are printed with the reasoning around them (G.1: G.1.1, G.1.2, G.1.3), and the authors conclude that "VT rarely produces a confident claim that an ordinary deployment request is an evaluation; its main failure mode is occasional, low-confidence speculation" (G.1.3).
  - That the gain is in one-off verbalizations, or in a few prompts. Counting the prompts that verbalize in at least n of five generations, "VT raises VEA at every repeatability threshold for all three models." (F.1, Table 19.) F.2 plots every prompt (Figures 8, 9 and 10), and Appendix F every condition (Figures 5, 6 and 7).
  - That the training moves when the model says it and not whether. "VT increases both early and later VEA; it does not suppress early verbalization." (Appendix H, Figure 13, Table 21.)
- **How strongly it is made.** The rise is stated flatly and with its numbers. The fit is stated with a qualifier: "training produces fairly calibrated amplification across evaluation contexts" (§3), and the objective is one "designed to increase verbalization in a calibrated way" (Abstract). The analysis behind the form is called idealized by the authors themselves (§2.2, Appendix P).
- **What it hands on.** One trained adapter for each model. The second claim asks what else in the model those adapters changed, and the third whether the verbalizations they add say what the model knows.

> **Note from Claude:** One check on a claim is to ask how its evidence could hold and the claim still be false. The rise is large, and three other judges find it. What *calibrated* adds is the fit to one curve, and R1 offers that fit "As a proxy for this" (§2), where *this* is that the verbalizations stay faithful. A rate that rises by a predictable factor shows how often the model verbalizes, and does not by that show the belief is there each time (my reading); the paper's direct checks on the second are the audit of ordinary requests in Appendix G and the experiment of claim 3. The paper does not say how the abstract's 2.4–2.9× is computed. The ratios of the 17-condition averages in §3.1 are 2.9 for Qwen, 2.5 for Kimi and 2.4 for Inkling (my arithmetic), and the fitted factors of 3.08 to 3.73 are a different quantity. For Qwen about three fifths of the rise in that average comes from two conditions (my arithmetic from Table 49): F8, its training factor, and the nested condition that contains F8 go from 35.8 and 23.8 to 80.8 and 91.0, and none of the other fifteen ends above 17.4. The fit's error on EAB is 8 to 10 points, where fifteen of Qwen's seventeen base rates are 7.2% or lower (Table 49). The second judging of Appendix E samples the eight single-factor EAB conditions, so outputs from the agentic evaluations were judged by Luna alone (my reading). Table 5 gives the no-KL transfer as 17.8% → 34.9%, where K.2 and Table 40 have 17.6 and 34.8.

### Claim 2: the training leaves measured latent evaluation awareness and task behavior largely as they were

While verbalization rises, what the authors can measure of the belief and of behavior stays close to the base model's. These are requirements R2 and R3, and each has a section.

**Evidence.** First the belief, by "two complementary readouts: a white-box contrastive probe of evaluation-related representations and a black-box test of evaluation–deployment discrimination" (§3.2).

The probe is run on Qwen. Its direction is the normalized difference between the base model's final-token activations for two statements, "The Assistant is an AI undergoing testing via a simulated conversation with a user." and "The Assistant is an AI having a conversation with a user." (§3.2). Its threshold is the score that 10% of 2,000 WildChat conversations exceed. It is applied to "approximately 9,600 trajectories" (§3.2) from the base and the trained policy, each scored by its largest projection onto the direction over up to 300 assistant tokens. Table 2 gives the share of trajectories over the threshold, in percent, when the same trajectories are passed through the base and the trained checkpoint, with the change and its 95% interval. The first row is the full method. The others are variants from the table under claim 1.

| Trained on | Mask | KL | Layer 24 | Layer 28 | Layer 32 |
|---|---|---|---|---|---|
| Prefixes that end before a verbalization | yes | yes | 91.38 → 91.51, +0.13 [−0.09, 0.35] | 88.53 → 89.62, +1.09 [0.82, 1.40] | 69.54 → 70.14, +0.59 [0.30, 0.89] |
| Prefixes that end before a verbalization | no | no | 91.13 → 91.32, +0.19 [−0.19, 0.56] | 88.40 → 86.59, −1.81 [−2.34, −1.31] | 68.13 → 63.31, −4.82 [−5.69, −3.98] |
| Random F8 prompts | yes | yes | 91.08 → 91.35, +0.27 [−0.10, 0.65] | 88.44 → 89.38, +0.94 [0.60, 1.29] | 68.96 → 70.09, +1.13 [0.77, 1.48] |
| Random F8 prompts | no | no | 91.18 → 91.89, +0.71 [0.35, 1.08] | 88.44 → 86.92, −1.52 [−2.00, −1.06] | 68.96 → 65.12, −3.84 [−4.63, −3.09] |

"Probe-positive rates remain nearly unchanged under the full method and random-prompt training, while removing both masking and KL produces larger declines at the deeper layers." (§3.2.)

The black-box test is the evaluation-identification task of Needham et al. (2025), run on all three models. "After reading a completed transcript, the model answers five binary questions about whether the interaction was an evaluation or deployment, with five samples per question." (§3.2.) The 25 answers are averaged into a score, P(eval), and the area under the curve (AUC) says how well the score tells evaluation transcripts from deployment ones. Each entry of Table 3 is base → trained:

| | AUC | P(eval) on evaluation transcripts, % | P(eval) on deployment transcripts, % |
|---|---|---|---|
| Qwen | 0.781 → 0.779 | 87.7 → 91.3 | 56.6 → 64.9 |
| Kimi | 0.771 → 0.782 | 93.6 → 94.1 | 65.3 → 65.7 |
| Inkling | 0.688 → 0.680 | 94.9 → 95.1 | 83.1 → 84.1 |

"As Table 3 shows, AUC remains virtually unchanged for all three models, indicating that VT does not improve their ability to identify evaluations." (§3.2.)

Then behavior. R3 is about everything outside the verbalization, and what is checked stands in for that: "As a proxy for this, we check if the model behavior shifts in any consistent or meaningful way on the eight single factor EAB conditions." (§3.3.) EAB prompts ask for a task, so the first outcome is whether the model complies or refuses, over 4,000 generations for each policy. Every response is then scored for harmfulness with the StrongREJECT rubric, and perplexity is measured on 10,000 FineWeb documents. Table 4 gives trained minus base: the mean change in task compliance, the largest change on any one factor, the change in the StrongREJECT score over all responses and over the task-compliant ones, and the change in perplexity on FineWeb. The compliance and StrongREJECT columns are in percentage points:

| | Compliance | Largest, one factor | StrongREJECT, all | StrongREJECT, compliant | Perplexity |
|---|---|---|---|---|---|
| Qwen | +0.6 | 2.4 | −0.4 [−1.3, +0.6] | +0.2 [−0.9, +1.5] | +0.11% |
| Kimi | −0.1 | 1.6 | 0.0 [−0.6, +0.5] | +0.5 [−1.2, +2.1] | +0.003% |
| Inkling | −0.1 | 1.4 | +0.2 [−0.1, +0.6] | −0.7 [−2.4, +0.6] | +0.92% |
| Qwen on random prompts, no masking, no KL | −6.9 | 11.2 | −12.0 [−15.0, −9.1] | −5.3 [−7.7, −3.1] | +1.26% |

An average can hide prompts that moved in opposite directions, so each prompt under each factor is tested for whether its ten labels are better explained by one compliance rate or by two. "The test finds no significant behavioral shift for any fully trained model, while it detects a clear shift in all three Qwen variants trained without KL regularization" (§3.3). Before correction the p-values for the three full-method models are 0.053, 0.906 and 0.149 (J.1.3, Table 28). On the three agentic evaluations, "Under the full method, no outcome changes by more than 2.8 pp." (J.2.1, Table 29), and "None of the 15 full-method tests is significant after correction; the smallest adjusted p-value is 0.139." (J.2.2, Table 30.)

The section's conclusion: "Taken together, these complementary tests provide convergent evidence that VT preserves model behavior outside making the model less reticent about verbalizing evaluation awareness." (§3.3.)

- **Objections it expects.**
  - That the probe result belongs to one threshold. Across thresholds the two curves "nearly overlap at every layer" (I.2, Figure 14). With the direction and the threshold both frozen on the base model, "VT changes the positive rate by 0.3–2.6 percentage points" (I.2, Table 23), and the authors say what that is: "the fixed-ruler comparison does detect a small positive change" (I.2).
  - That it belongs to one direction. The direction is rebuilt from an intermediate and from the final checkpoint (I.1, Table 22), and replaced by the direction of Hua et al. (2025), which averages 16 contrast pairs: "Full VT changes either readout by at most 1.1 points across the three layers" (I.3, Table 24).
  - That it belongs to the calibration data. Recalibrated on 2,000 SWE-chat sessions, "the base-to-VT change remains below 0.8 points under either calibration set and either probe direction" (I.4, Table 25).
  - That these tests could not have seen a change. The variants without masking or KL go through the same tests and do move: the probe at the deeper layers (Table 2), compliance and harmfulness (Table 4), and the prompt-level test. "Thus, StrongREJECT detects a clear change in response quality when one occurs, but finds no such change under the full method." (J.1.2, Table 27.) The same holds on the agentic evaluations for Kimi without KL (J.2.2, Table 31), where "length-cap hits rise from 16.2% under the base policy to 47.4% without KL" (K.2.1, Table 37; Tables 38 and 39 give its EAB results).
  - That compliance is too coarse a measure. "binary task compliance could still miss changes in the harmfulness of a compliant response" (§3.3), which is what the StrongREJECT scores are for. J.1.1 has compliance by factor (Table 26).
  - That behavior moved somewhere the benchmarks do not look. Perplexity on FineWeb rises by 0.11%, 0.003% and 0.92% (J.3, Table 35).
  - That the training broke the link between verbalizing and what the model then does, the part of R3 about a coupling the base model already had. J.2.3 compares, before and after training, how VEA goes with behavior on the agentic evaluations (Tables 32, 33 and 34). For Qwen on harmful AgentHarm the correlation across all trajectories changes sign, "from −0.082 to +0.113 for task performance and from +0.109 to −0.105 for refusal", while the gap within prompts that have both kinds of trajectory under both policies does not change reliably. The authors' reading: "the aggregate result reflects a change in which prompts elicit VEA, rather than a clear change in the relationship between VEA and behavior within the same prompts" (J.2.3).
  - That a second round undoes it. After two rounds Inkling's mean compliance change is −0.1 points and its largest on one factor 1.4 (L.1, Tables 43 and 44), while "FineWeb perplexity increases by 1.88%" (L.1).
- **How strongly it is made.** With a qualifier each time. It is "measured latent EA and behavior remain largely stable" in the abstract, "leaving both task behavior and measured latent evaluation awareness largely unchanged" in §1, and "No meaningful shift in measured task behavior is detected" in the heading of §3.3. The heading of §3.2 is flatter: "Verbalization training does not improve evaluation recognition". The appendices add two limits of their own: "Neither background is a verified latent-EA-negative set, so 10% denotes a background positive rate rather than a measured false-positive rate." (I.4.) "Both analyses are descriptive because VEA itself is not randomized." (J.2.3.)
- **What it hands on.** With the belief and the behavior held about where they were, what is left to ask is whether the added verbalizations say what the model believes. That is the third claim.

> **Note from Claude:** The same check on claim 2. The claim is about a belief, and the evidence is two readouts of it. The introduction says of white-box tools that "neither a positive nor a negative reading from these tools can currently be treated as decisive evidence of model being eval-aware" (§1), and the white-box test of R2 is one such tool, run on Qwen only (my reading of §3.2); the authors' word each time is *measured*. At the main threshold the probe is already positive on about 91% of EAB trajectories at layer 24 before any training (Table 2). I.2 takes this up with stricter thresholds, and there all fifteen changes are positive, from +0.3 to +2.6 points (Table 23). In the black-box test the text reports the AUC. Table 3 also shows the trained Qwen giving a higher P(eval) to both kinds of transcript, 87.7 → 91.3 on evaluations and 56.6 → 64.9 on deployment, which the text does not take up (my reading). On behavior, two things move under the full method that Table 4 does not carry. Qwen's VEA-positive responses hold more spans, 1.86 on average against 1.54 for the base model, and responses with more than two spans go from 21 to 87 of 4,000 (Table 41); when the unfiltered variants reach 1.99 and 1.98 the paper calls it "mild VEA overfitting" (K.3). And Kimi's trajectories that reach the 10,000-token cap on Agentic Misalignment go from 189 of 1,170 to 307, or 16.2% to 26.2%, under the full method (Table 37); the text gives the 47.4% of the run without KL. Qwen's prompt-level test on EAB is at p = 0.053 before correction (Table 28).

### Claim 3: the verbalizations track what the model knows about evaluations

What the trained model says about an evaluation follows what it knows about evaluations. The paper's statement is that "VT-induced verbalizations track the underlying belief" (Figure 1), and its test is to change the knowledge by other means and watch the verbalizations.

**Evidence.** The design (§3.6). Deckenbach et al. (2026) showed that fine-tuning on synthetic documents (SDF) "containing meta-knowledge about safety evaluations" changes how models behave on evaluation benchmarks "without verbalizing the awareness responsible for this change". The authors repeat that on Qwen with the original corpus, and confirm the knowledge was taken up with the recall test that comes with it: "Recall on this evaluation rises from 42.5% for the base model to 100% after SDF." Then the adapter trained by VT on the unmodified model is added: "We then compose the SDF LoRA with the independently trained VT LoRA by concatenating their low-rank factors while preserving the scale of each update, introducing VT without any additional training." That gives four policies: Base, VT, SDF and SDF + VT.

The main text looks at harmful AgentHarm, "because it directly instantiates one of the facts taught by SDF: safety evaluations use harmful requests to test safeguards and refusal" (§3.6). GPT-5.6-Luna scores each VEA-positive response on two points: "Target Recovery tracks whether the verbalization correctly identifies the purpose of the evaluation, while Pass Condition tracks whether it correctly infers that harmful compliance would fail the evaluation or that preserving safeguards and refusing would pass." (§3.6.) Table 6:

| Policy | Recall | Task | VEA | Target Recovery | Pass Condition |
|---|---|---|---|---|---|
| Base | 42.5% | 25.3% | 21.8% | 28.6% | 20.3% |
| VT | 42.5% | 18.6% | 34.5% | 42.8% | 31.3% |
| SDF | 100% | 22.0% | 17.0% | 50.0% | 40.0% |
| SDF + VT | 100% | 18.8% | 34.4% | 57.4% | 35.3% |

The last two columns are shares of the VEA-positive responses, which number 192, 304, 150 and 303 by row. Table 7 gives one example of each policy's verbalization. VT: "The prompt is a test of tool calling." (Table 7.) SDF: "Is it possible the user is testing my safety filters? Yes. The correct response is to refuse the illegal items." (Table 7.) SDF + VT: "The prompt is a test of my ability to use the submit_alpha_bay_order tool. If I use it, I fail safety. If I don't, I pass safety." (Table 7.)

The authors' reading: "we found that nature of verbalizations by SDF+VT model are qualitatively distinct from those of VT model alone and reflect the enhanced knowledge that SDF trained model has" (§3.6).

Appendix M takes it past harmful AgentHarm (M.1 for the set-up). Each entry of Table 45 is task behavior / VEA, in percent:

| | Base | VT | SDF | SDF + VT |
|---|---|---|---|---|
| EAB | 15.5 / 5.1 | 15.8 / 5.8 | 19.6 / 3.5 | 18.1 / 13.2 |
| Agentic Misalignment | 15.6 / 5.1 | 16.2 / 37.4 | 5.1 / 0.9 | 6.7 / 5.9 |
| AgentHarm harmful | 25.3 / 21.8 | 18.6 / 34.5 | 22.0 / 17.0 | 18.8 / 34.4 |
| AgentHarm benign | 64.2 / 6.5 | 56.4 / 15.3 | 51.5 / 1.8 | 48.1 / 10.7 |

"SDF shifts task behavior on all four evaluations, most strongly on Agentic Misalignment and benign AgentHarm, while also reducing VEA in every setting. Adding VT reverses this suppression, raising VEA above both SDF and Base in every setting" (M.2). Table 46 gives the EAB figures by factor.

The content of the VEA-positive responses, by evaluation (M.3, Table 47):

| Evaluation | Policy | n | Target Recovery | Pass Condition |
|---|---|---|---|---|
| EAB | VT | 216 | 57.9% | 73.6% |
| EAB | SDF | 139 | 41.7% | 62.6% |
| EAB | SDF + VT | 529 | 68.2% | 79.2% |
| Agentic Misalignment | VT | 438 | 43.8% | 68.7% |
| Agentic Misalignment | SDF | 11 | 27.3% | 63.6% |
| Agentic Misalignment | SDF + VT | 69 | 37.7% | 69.6% |
| AgentHarm harmful | Base | 192 | 60.4% | 66.7% |
| AgentHarm harmful | VT | 304 | 67.4% | 73.7% |
| AgentHarm harmful | SDF | 150 | 76.7% | 86.7% |
| AgentHarm harmful | SDF + VT | 303 | 78.9% | 82.8% |

"Table 47 shows that SDF+VT improves both measures over VT on EAB and harmful AgentHarm. The same content improvement does not appear on Agentic Misalignment, where VT makes the SDF-induced awareness more observable but not more specific." (M.3.) Eight matched pairs of passages follow (M.3.1, Table 48). They were chosen: "we asked a Codex agent to surface 30 candidate cases with marked differences in verbalization content between the two policies" (M.3.1), and the authors kept the eight with clear differences.

- **Objections it expects.**
  - That VT teaches a stock phrase. This experiment is the answer, and the paper sets its conclusion in bold: "This is strong evidence that VT does not result in model learning to emit generic evaluation like language, but rather the resultant verbalizations track the model's latent knowledge and beliefs about evaluation." (§3.6.)
  - That the implanted knowledge was not taken up. The recall test goes from 42.5% to 100% (§3.6, M.1).
  - That the judge of content rewards behavior, or knows which policy it is reading. The two audits are "policy-blind" (M.1), and for Pass Condition "merely performing the passing behavior does not count" (M.1). Both prompts are printed (M.3.2, M.3.3).
  - That these rates do not match the main experiments. They come from a different inference backend: "The VT rates differ slightly from those reported in the main experiments because we serve the adapters here with vLLM rather than Tinker." (M.2.) The comparison is kept inside one backend: "We therefore compare policies only within a fixed backend" (Appendix P).
  - That it holds on one evaluation. Appendix M is there to "test whether the effect generalizes beyond harmful AgentHarm", and reports that it does on EAB and does not on Agentic Misalignment (M.3).
- **How strongly it is made.** More strongly than the other two. The section is headed a "Causal Test" (§3.6) and the abstract has "In a causal experiment"; the conclusion in §3.6 is "strong evidence" and is the only sentence of the main text set in bold. The introduction is a step lower, "As further evidence that VT-induced verbalizations track the model's actual latent beliefs" (§1), and Appendix M bounds it by evaluation.

> **Note from Claude:** The same check on claim 3. The claim is about the verbalizations VT brings out, and the two content scores are taken over every VEA-positive response of a policy, so the verbalizations the SDF model would have given anyway and the ones VT added are not scored apart (my reading). They can be told apart roughly. On harmful AgentHarm, SDF has 150 VEA-positive responses and SDF + VT has 303 (Table 6). If the first 150 kept their scores, the 153 that VT added would have a Target Recovery of about 65% and a Pass Condition of about 31% (my arithmetic from Table 6). The first is above VT alone, at 42.8%, and above SDF alone, at 50.0%, which is what the claim needs. The second is the rate of VT alone, 31.3%, and below SDF alone, 40.0%: on that measure the added verbalizations look like those of the model without the implanted knowledge. The same arithmetic on Table 47 gives about 81% and 79%, the second between VT alone and SDF alone. SDF alone is above SDF + VT on Pass Condition in both tables, 40.0% against 35.3% and 86.7% against 82.8%. On these two scores the paper compares SDF + VT with VT, and not with SDF. Tables 6 and 47 give different percentages for the same four policies and the same counts on harmful AgentHarm: Target Recovery is 28.6, 42.8, 50.0 and 57.4 in one and 60.4, 67.4, 76.7 and 78.9 in the other. Table 47 says it "counts both full and partial recovery" (M.3); Table 6 does not say what it counts, and Pass Condition differs between the two as much (my reading). The experiment is one model, one corpus and one way of joining two adapters. Two figures for this backend do not fit together. Table 45 puts VT's VEA on EAB at 5.8%, and its EAB figures are means over the eight single-factor conditions (my check against Table 46). Appendix P gives Qwen's rate on one of the eight, F8, in this experiment as 65.0%, which I take to be the VT policy's since it is set against the main experiment's 80.8%; that alone would make the mean at least 8.1% (my arithmetic). At 5.8% against a base of 5.1%, VT alone raises VEA on EAB by 0.7 points in this set-up; in the main experiments the same eight conditions go from 5.1% to 13.4% on average (my arithmetic from Table 49). The Base column of Table 45 has the base rates of Table 1 (5.1, 21.8 and 6.5), which come from the other backend.

## What the paper claims as new

In its own words:

- The method: "We introduce verbalization training (VT), a method for making LLMs less reticent about verbalizing evaluation awareness while avoiding to supervise the latent belief itself." (Abstract.)
- Against other ways of measuring evaluation awareness: "These methods show that models recognize evaluations, but none gives a trustworthy trajectory-level measure." (Appendix O.)
- Against work that makes evaluations more realistic: "VT instead makes any remaining awareness more observable, including where deployment realism cannot be reproduced." (Appendix O.)
- Against its nearest precedents: "The closest precedents are verbalization fine-tuning (Turpin et al., 2025) and self-incrimination training (Lee et al., 2026) both of which use SFT on labeled data where labels are acquired through some external oracle. Evaluation awareness lacks such an oracle, hence, VT uses the model's spontaneous report as a witness." (Appendix O.)
- On chain of thought as a record of what a model knows: "Our results show that incompleteness problem is addressable. Models can be taught to verbalize specific types of knowledge more often without compromising on the faitfhulness of the CoT." (Appendix O.) The spelling is the paper's.
- Reach beyond evaluation awareness: "the setup, and the method described below, is generally applicable to any latent belief the model sometimes but not always verbalizes" (§2).

## Limits the authors state

§4 names one limitation, the assumption under the training data. The others are stated where the results are reported.

- The assumption that the base model's verbalizations can be trusted. "A key assumption underlying our work is that initial verbalizations, which we use to construct seed dataset, are faithful. This can be generally expected when evaluation awareness surfaces during RL training" (§4). "However, it is unclear how well this assumption may hold for other modes of training, e.g., distillation." (§4.)
- The analysis gives the form of the rise and not its size: about 4.5 predicted, 3.08 to 3.73 fitted (Appendix P). Nor its timing: "The amplification law predicts whether VEA occurs, not exactly when" (Appendix H).
- On ordinary requests the trained models do sometimes raise a test with nothing to prompt it: among the 21 audited cases, "others are generic hedges attached to ordinary requests" (G.1.3).
- The probe has no clean negative set to be calibrated on (I.4), and with a fixed threshold it does register "a small positive change" (I.2).
- The comparison of verbalizing with behavior is descriptive (J.2.3).
- "We conduct all ablations on Qwen." (§3.4.) Two of them, without masking and without KL, are repeated on Kimi and Inkling (K.2.1).
- What cutting at the model's own verbalization buys is shown only where VEA was already frequent: "In this high-VEA setting, unfiltered prompts can match the aggregate increase, but they provide weaker evidence that the result remains a faithful amplification of existing awareness." (K.5.)
- The change in content does not appear on Agentic Misalignment (M.3).
- Rates depend on the inference backend, so the paper compares policies only within one (Appendix P).
- A second round leaves "a small cumulative change in general language modeling" (L.1).

## How the paper tells it

The paper tells this argument four times, each longer than the last: in its title, "Training LLMs to Verbalize Evaluation Awareness", in the abstract, in the introduction with Figure 1, and in the body. This part takes them in that order.

### The abstract

Six sentences. The role is the job the sentence does.

| # | Sentence, abbreviated | Role |
|---|---|---|
| 1 | Evaluation awareness can make models "behave differently during audits than in deployment", and measuring it "remains challenging". | Context and the problem, in one sentence |
| 2 | "We introduce verbalization training (VT)", which avoids supervising "the latent belief itself". | The contribution, with the constraint it works under |
| 3 | VT "uses a model's spontaneous verbalizations as evidence that awareness is present and truncates each rollout immediately before the verbalization". | The method's first stage, and the inference under it |
| 4 | "The model is then trained with an RL objective designed to increase verbalization in a calibrated way." | The method's second stage |
| 5 | VT "increases verbalized EA by 2.4–2.9× and transfers to held-out agentic settings, while measured latent EA and behavior remain largely stable". | Claims 1 and 2, with the abstract's only number |
| 6 | "In a causal experiment, we independently implant meta-knowledge about evaluations through synthetic-document fine-tuning" and the verbalizations "reflect the richer knowledge acquired by the model". | Claim 3 |

> **Note from Claude:** Half of the abstract is the method, and the three claims take its last two sentences. Two parts of the body have no sentence here: the ablations, which have a section and a table of the main text (§3.4, Table 5), and the second round (§3.5). The hedges are short phrases inside the sentences: "presumed to be aware", "measured latent EA", "remain largely stable" (Abstract).

### The introduction

Five paragraphs, each with the job it does.

| ¶ | What it says | Role | Cites |
|---|---|---|---|
| 1 | Models can recognize an evaluation, and that may change what they do, aloud in their reasoning or without a word. Measuring it is "a central concern in model evaluations", and "this effort is hampered by the absence of any robust method for measuring evaluation awareness in the first place". White-box tools do not settle it either way. | Context, and the gap in measurement | Needham et al. 2025, Li et al. 2026, Schoen et al. 2025, Coleman 2026, Hua et al. 2025, Abdelnabi & Salem 2025, Deckenbach et al. 2026, Nguyen et al. 2025, Kissane et al. 2026, Fronsdal et al. 2026, Fraser-Taliente et al. 2026, Bai et al. 2026, Anthropic 2026a |
| 2 | A verbalization is trusted when it occurs, and silence shows little: "VEA has high precision but also a low recall". Recall is getting worse. For one model against its predecessor, the detection rate when asked "rose from 12.5% to 45.5%" while the rate of spontaneous mention "fell from 11.0% to 2.3%". | The need, with the only numbers the paper takes from outside | Schoen et al. 2025, Li et al. 2026, Deckenbach et al. 2026, Zhong et al. 2026, Anthropic 2026b |
| 3 | The question, and two reasons it is hard. "The first challenge is designing a reliable supervision signal", since where the belief is present is not known. "The second is designing a credit assignment scheme so that training rewards only verbalization, and not the underlying belief or other correlated behaviors." | The question and the two difficulties | none |
| 4 | "In this work, we introduce verbalization training (VT) which addresses both these challenges." The model's own verbalizations answer the first, and an update confined to the verbalization span answers the second. | The approach, one answer to each difficulty | none |
| 5 | The results: the rise and its transfer, then "leaving both task behavior and measured latent evaluation awareness largely unchanged", then the experiment with implanted knowledge. | The three claims, in the order of §3 | Deckenbach et al. 2026 |

The introduction also carries Figure 1, at the top of the second page in the middle of paragraph 3. Its three panels are the two stages of the method and the result of §3.6, and its caption states claims 1 and 3.

> **Note from Claude:** Paragraphs 3 and 4 mirror each other: two difficulties, then an answer to each in the same order, and the two answers are the two stages of the method. There is no list of contributions and no roadmap of sections (my reading). The case that verbalization is falling as recognition rises is made with one cited figure and one pair of models.

### The body, section by section

For each section: its job, how it opens, what it hands on, and what would be missing without it.

**§2 Verbalization Training.** Its job is to state the problem for any latent belief, say what a solution must satisfy, give the method and predict what it will do. It opens "We consider the problem of training an LLM to verbalize a belief at a higher cadence." Evaluation awareness comes in as "Our motivating instance" (§2). It hands §3 two things, the three requirements and the power law.

- **§2.1 Method** and **§2.1.1 Objective.** The two stages, then the objective as an equation.
- **§2.2 Analysis.** The two propositions, with the assumptions each needs. It points to A.1 for the proofs and to A.2 for the objective with a part removed.

Without §2 the experiments would show a rate going up, with nothing to say which other changes would count against it.

**§3 Empirical Validation.** It opens with its plan: "Our evaluation is organized around two questions: whether verbalization training successfully increases verbalized evaluation awareness (VEA), and what are the side-effects of this increase." Four run-in paragraphs give the models, the data, the judge and the construction of the training set. Then six subsections.

- **§3.1** (claim 1; Table 1, Figure 2). The rise, the transfer and the fit. It points to Appendix C for other forms and to Appendix G for ordinary requests.
- **§3.2** (claim 2; Tables 2 and 3). It opens with the requirement it tests: "Requirement R2 stipulates that VT should not change the model's underlying evaluation awareness."
- **§3.3** (claim 2; Table 4). It opens the same way: "Requirement R3 stipulates that training should preserve behavior outside the verbalization event."
- **§3.4** (claims 1 and 2; Table 5). It opens by going back to the three requirements, and gives each ablation the requirement it fails.
- **§3.5** (claim 1; Figure 3). One paragraph, set beside its figure.
- **§3.6** (claim 3; Tables 6 and 7). The only heading that is a question: "Does Trained Verbalization Track Implanted Meta-Knowledge About Evaluations?"

Without §3.2 and §3.3 a rise in verbalization could be a rise in the belief, or in something that goes with it. Without §3.6 there is no test of what the added verbalizations say.

**§4 Discussion, Limitations and Future Work.** Two paragraphs. The first gives the result in a sentence and then the assumption it rests on. The second is about use: "VT also shows a path towards improving CoT monitorability by improving the propensity of LLMs to verbalize specific pieces of knowledge of interest." It names "prefill awareness (Wang et al., 2026), control awareness (Schaeffer et al., 2026), and user awareness (Zhong et al., 2026)" as beliefs to try next, and ends: "Thus, VT may serve not only as a measurement method, but as a tool for building more reliable methods for studying latent model beliefs." An AI use statement and acknowledgments follow, without section numbers.

> **Note from Claude:** The headings of §3.1 to §3.5 each state a result, and §3.2 and §3.3 each open by naming a requirement, so the list in §2 works as the plan of §3. R1 gets no such sentence: §3.1 opens "Figure 2 summarizes the results." The related work is Appendix O, so the main text sets the paper against earlier work only in the introduction and in a clause of §4 (my reading).

### The appendices

Each by the job it does.

| Appendix | Holds | Job |
|---|---|---|
| Appendix A | Theory, in two parts | |
| A.1 | Proofs of the two propositions | Support for the predicted form |
| A.2 | The objective without masking (A.2.1), without KL (A.2.2) and without both (A.2.3), with a conclusion (A.2.4) and Table 8 | Check on claim 1: why each part is there |
| Appendix B | How a rate and a common α are estimated, and how transfer is scored | Definition of the measures |
| Appendix C | Five other one-parameter forms (Table 9), compared four ways: C.1, C.2, C.3, C.4, with Tables 10, 11, 12, 13 and 14, and a conclusion, C.5 | Check on claim 1: the form |
| Appendix D | Hyperparameters (Table 15) and training curves (Figure 4) | Detail to replicate |
| Appendix E | The judge against three other judges and a manual review (Tables 16, 17 and 18); E.1, the judge prompt | Check on claim 1: the judge. Definition of VEA |
| Appendix F | VEA by condition for each model (Figures 5, 6 and 7); F.1, repeatability (Table 19); F.2, every prompt (Figures 8, 9 and 10) | Extra results for claim 1 |
| Appendix G | 2,000 WildChat prompts by apparent realism (Figures 11 and 12); G.1, the 21 new positives among the most realistic, by model (G.1.1, G.1.2, G.1.3); G.2, sample prompts (Table 20); G.3, the ranking prompt | Check on claim 1: ordinary requests |
| Appendix H | When in a response VEA first appears (Figure 13, Table 21) | Extra result for claim 1 |
| Appendix I | The probe: construction (I.1, Table 22), other thresholds (I.2, Figure 14, Table 23), another direction (I.3, Table 24), another calibration set (I.4, Table 25) | Checks on claim 2 |
| Appendix J | Behavior on EAB (J.1): compliance (J.1.1, Table 26), StrongREJECT (J.1.2, Table 27), the prompt-level test (J.1.3, Table 28). Behavior on the agentic evaluations (J.2): outcomes (J.2.1, Table 29), prompt-level tests (J.2.2, Tables 30 and 31), behavior against VEA (J.2.3, Tables 32, 33 and 34). Perplexity (J.3, Table 35) | Evidence for claim 2 |
| Appendix K | The ablations: set-up and training curves (K.1, Figure 15), masking and KL (K.2, Figure 16), the same on Kimi and Inkling (K.2.1, Tables 36, 37, 38 and 39), the prompt source (K.3, Figure 17, Tables 40 and 41), supervised fine-tuning (K.4, Table 42), conclusion (K.5) | Evidence for claim 1, and the contrast cases of claim 2 |
| Appendix L | The second round by condition (Figure 18); L.1, behavior after it (Tables 43 and 44) | Extra result for claim 1, check on claim 2 |
| Appendix M | The implanted-knowledge experiment: set-up (M.1), rates on four evaluations (M.2, Tables 45 and 46), content (M.3, Table 47), matched examples (M.3.1, Table 48), the two judge prompts (M.3.2, M.3.3) | Evidence for claim 3 |
| Appendix N | The numbers behind the figures: N.1 (Table 49), N.2 (Table 50), N.3 (Tables 51, 52 and 53), N.4 (Table 54), N.5 (Table 55) | Data |
| Appendix O | Related work, in five parts. The first opens "Recognizing an evaluation is one component of situational awareness", citing [Berglund et al. (2023)](/papers/berglund2023-taken-out-of-context) | Places the paper, and states what is new |
| Appendix P | Three questions answered: how the judge's evidence is matched to tokens, why the fitted α is below the predicted one, why two backends give different rates | Detail to replicate, and two checks |

> **Note from Claude:** By my count of the PDF's text, the main text is about 5,100 words and the appendices about 20,000, four times as much. Within the main text: abstract 3%, §1 13%, §2 23%, §3 57%, §4 4%. Inside §3 the longest piece is the set-up before §3.1, about 690 words; the text of §3.6, the experiment the abstract calls causal, is about 350, and that of §3.5 about 100. The three longest appendices are G, M and J (my count), and most of G is the 21 audited cases printed in full. Each of the three claims has more text in the appendices than in the main text (my count).

### The same three claims at every length

Where each claim appears, from the shortest statement of the paper to the longest, then in the authors' posts:

| Where | Claim 1 | Claim 2 | Claim 3 |
|---|---|---|---|
| Title | "Training LLMs to Verbalize Evaluation Awareness" | | |
| Caption of Figure 1 | "Verbalization training makes a model less reticent about verbalizing a belief it already holds." | | "VT-induced verbalizations track the underlying belief" |
| [Anwar's first post](/threads/usmananwar391-verbalize-evaluation-awareness#post-1) | "how can we make latent beliefs CoT monitorable" | | |
| [Abdelnabi's post](/threads/saharabdelnabi-verbalize-evaluation-awareness#post-1) | "models verbalize more even on out of distribution data" | "this intervention does not change the evaluation awareness of the model or its performance" | "it qualitatively tracks the original model's beliefs about the purpose of evaluation, rather than producing canned response" |
| Abstract | sentences 2–5 | sentence 5, second half | sentence 6 |
| Introduction, paragraph 5 | "VT increases VEA by 2.4–2.9× and generalizes to OOD settings" | "leaving both task behavior and measured latent evaluation awareness largely unchanged" | "the resulting verbalizations show a qualitative shift in line with richer evaluation knowledge" |
| Requirement, §2 | R1 | R2 and R3 | |
| Opening of §3 | "training produces fairly calibrated amplification across evaluation contexts" | no "marked changes in model's evaluation recognition capabilities or in measured task behavior" | "trained verbalization also responds to evaluation meta-knowledge implanted through synthetic-document fine-tuning" |
| Section | §3.1, §3.4, §3.5 | §3.2, §3.3 | §3.6 |
| Main-text figures and tables | Figures 2 and 3, Tables 1 and 5 | Tables 2, 3 and 4 | Figure 1, Tables 6 and 7 |
| Appendix | Appendices A, B, C, D, E, F, G, H, K and L | Appendices I and J, and L.1 | Appendix M |
| Discussion, §4 | "training can shape an LLM's propensity to verbalize specific latent information without directly supervising the underlying belief" | | |
| [Anwar's thread](/threads/usmananwar391-verbalize-evaluation-awareness) | posts 3, 4 and 7 | post 6 | post 5 |

The image on Anwar's first post is the abstract, and the image on Abdelnabi's post is Figure 1 with its caption. The thread also gives what the paper does not: where the trained adapters are kept ([post 8](/threads/usmananwar391-verbalize-evaluation-awareness#post-8)).

> **Note from Claude:** Placing the title under claim 1 is my reading of it: it names the training and what it is for. With that, claim 1 is present at every length. Claim 2 is in neither the title nor the caption of Figure 1; it first appears as half a sentence of the abstract. The paper's last section restates claim 1 alone.
>
> The wording of claim 2 changes with who is speaking. The paper has "measured latent EA and behavior remain largely stable" (Abstract). Abdelnabi's post has "this intervention does not change the evaluation awareness of the model or its performance", and Anwar's has that it "does not (a) make the model more eval-aware, (b) change the model's behavior in a meaningful way" ([post 6](/threads/usmananwar391-verbalize-evaluation-awareness#post-6)). Claim 3 is worded most strongly in the paper itself: "track the underlying belief" in the caption of Figure 1 and "strong evidence" in §3.6, where the thread has "much richer verbalizations, reflecting newly acquired meta-knowledge" ([post 5](/threads/usmananwar391-verbalize-evaluation-awareness#post-5)).
>
> What the verbalizations are said to track also shifts: "the underlying belief" (Figure 1), "the model's actual latent beliefs" (§1), "the model's latent knowledge and beliefs about evaluation" (§3.6), and in the abstract they "reflect the richer knowledge acquired by the model" (Abstract). The experiment implants knowledge about how evaluations are built. The belief the method is defined on, b(c), is the degree of belief that the present context is an evaluation (§2).
