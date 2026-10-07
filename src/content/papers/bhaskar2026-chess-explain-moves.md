---
title: "Language Models that Play Chess and Explain Their Moves"
authors: ["Adithya Bhaskar", "Jeffrey Cheng", "Danqi Chen"]
year: 2026
date: 2026-10-02
venue: "arXiv"
tier: adjacent
status: full
reviewed: false
format: outline
summary: "A general language model joined to a chess engine's network, taught to read that network with question-answer pairs and then improved by seven rounds of distilling its own search, becomes QUEEN, a 4B-parameter model that plays near the level of a median Grandmaster and explains its moves. Its explanations are more accurate and better substantiated than those of frontier models and approach them in coherence, and the authors present the recipe as one for any domain that has a strong expert network which cannot explain itself."
links:
  arxiv: "2610.03695"
  pdf: "https://arxiv.org/pdf/2610.03695v1"
  project: "https://queen-project.github.io/"
  code: "https://github.com/queen-project/queen"
cites: []
concepts: []
threads: [adithyanlp-chess-explain-moves, danqichen-chess-explain-moves]
setup:
  reports_on: "Its own chess moves: the move it recommends in a position, the line of play it predicts will follow, and prose that gives the reasons for both"
  methods: [fine-tuning, behavioral]
  models: ["QUEEN (Lc0 BT5 encoder, SmolLM3-3B decoder)", "GPT-5.6-Sol", "GPT-5.6-Luna", "Gemini-3.1-Pro", "C1-4B"]
sources:
  - "full text (arXiv v1), appendices included"
  - "the lead author's thread"
  - "the senior author's post"
added: 2026-10-07
updated: 2026-10-07
---

## The paper in brief

- **Problem.** "Modern chess engines are silent experts: they play at a superhuman level, but do not offer explanations for their play. On the other hand, language models (LMs) can generate plausible-sounding explanations, but their weak playing strength limits the utility of their explanations." (Abstract.)
- **Why it matters.** "Good explanations are an accessible way for chess players to understand and learn from expert predictions; they can also serve as valuable post-training data for language models." (§1.)
- **Question.** The paper sets a goal and poses no question: "Our goal is to generate natural language explanations of chess positions." (§3.) The difficulty it names is doing that from strong play: "Giving explanations grounded in strong play presents a greater challenge." (§3.)
- **Answer.** "We introduce QUEEN, a 4B-parameter chess-language model that can explain its moves and plans while playing at the level of a typical Grandmaster." (Abstract.) By the end: "QUEEN generates higher-quality explanations than prior methods and frontier language models." (§6.)

The first claim is the method, the second is what the method produces, and the third is how far the authors take the method to reach.

1. A general language model becomes one that plays and explains chess through two components: a bridge that lets it read a chess engine's network, and repeated distillation of its own search.
2. The model this gives, QUEEN, plays near the level of a median Grandmaster, and its explanations are more accurate and better substantiated than those of frontier models and approach them in coherence.
3. The recipe is not specific to chess.

## What the paper starts from

**Terms.**

- *Silent expert*: a chess engine. "Transformer-based chess engines achieved superhuman playing strength but don't communicate their reasoning in natural language" (§1).
- *Explanation*: "A high-quality explanation should consist of three components (Fig. 3): a best move recommendation, a predicted principal variation (PV), and natural-language prose explaining the two." (§3.) It differs from commentary, which is written about a move already given: in an explanation "the model must first predict a move and then provide the reasoning behind its choice" (§2).
- *Principal variation*: "a sequence of best moves from both sides, known as a principal variation (PV)" (§2).
- *Mistake*: "a move that incurs a 10% or greater drop in expected win rate compared to Stockfish oracle" (footnote 4). Stockfish is the reference: "At sufficiently high search budgets, modern engine evaluations and PVs can be treated as oracle." (§2.)

![An example explanation in two boxes. The first, in green, is prose: 'Black to move in a sharply unbalanced endgame... The best move is d1Q+, promoting immediately. White's best reply is Kxd1, capturing the black queen and eliminating black's most dangerous piece. Black's decisive follow-up is Kxe3, capturing the white rook...' The second, in blue, has four labeled fields. BEST_MOVE: d1Q+. PRINCIPAL_VARIATION: d1Q+, Kxd1, Kxe3, Kc2. PROMISING_MOVES: d1Q+, Kxc5, Rxb7. EVALUATION: 'Decisively winning for black by approximately 5.22 pawns, as the promotion followed by the capture of the white rook and systematic elimination of both white passed pawns leaves a winning black rook-and-black pawn versus bare white king.'](/figures/bhaskar2026-chess-explain-moves/fig3-explanation.png "Figure 3 of the paper: an example explanation generated by QUEEN, cut short by the authors. Prose, then the best move and the predicted line.")

**The inference it rests on** (§2). "The quality of an explanation depends on the quality of the move it explains, making chess-playing ability an important prerequisite for useful explanations." Playing strength is accordingly taken as "a proxy for the accuracy of its recommendations" (§1).

**Three things asked of an explanation, and the measure of each** (§4).

- *Accuracy*: "the recommended move should be near-optimal; an explanation is not useful if it recommends a blunder". It is measured by playing whole games. Each model plays 4 games against each of eight engines, 32 in all (Appendix C, Table 14), and gets an Elo rating "anchored with the known strength of the Leela networks to the Lichess Elo scale" (§4.1).
- *Substantiation*: "an explanation should substantiate its recommended move by analyzing alternate variations", since "an accurate PV provides evidence that the model can reason about the consequences that distinguish similar candidate moves". It has two measures (§4.2). The no-mistake rate (NMR) is "the fraction of predicted PVs containing no mistakes". The first-move no-mistake rate (FNMR) is "the fraction of positions in which the model's first move is not a mistake". Both are taken on 1,000 tactical puzzles and on 1,000 general positions.
- *Coherence*: "containing fluent prose, referencing high-level strategic and tactical motifs, and having few hallucinations". It is scored on three axes "through annotation by a GPT-5.6-Sol (high) judge on a Likert scale (from 1 to 5)" (§4.3). Structural coherence is "whether reasonable alternatives and critical variations are considered, independent of how they are described". Conceptual coherence is "whether the language appropriately uses high-level concepts and motifs (e.g. forks, pins, outposts), is free of hallucinations, and accurately captures each move's intentions and consequences". Fluency is "the linguistic quality of the explanation, including grammaticality, clarity, and readability".

**What QUEEN is compared with** (§4). "three frontier language models, GPT-5.6-Sol (SOL), GPT-5.6-Luna (LUNA), and Gemini-3.1-Pro (GEMINI), under high reasoning budgets", and "C1-4B (Tang et al., 2026), a similarly sized model from prior work trained through chess-specific master distillation".

**What the design rules out:**

- Strength that shows only on chosen positions. Playing full games "offers greater robustness compared to just measuring best move accuracy on a static evaluation set" (§4.1).
- A good first move with nothing behind it. NMR counts every move of the predicted line, and the puzzles "present positions where a unique sequence of moves leads to an advantage" (§4.2).
- Test positions met in training. "we always deduplicate against our two benchmark positions to avoid contamination" (B.1).

**Tools taken from earlier work.** Leela, the BT5 network of the Lc0 family (Monroe et al., 2026), and the finding that it "encodes aspects of chess positions such as piece arrangement, available legal moves, and tactical continuations" (Jenner et al., 2024, as cited in §3.2). SmolLM3-3B (Bakouch et al., 2025). Gated cross-attention from Flamingo (Alayrac et al., 2022). The loop of search and distillation of AlphaZero (Silver et al., 2017), in the form of Bellman value iteration (Bellman, 1957) used by Schultz et al. (2025). Stockfish, and the Lichess database of games and puzzles. Two more language models work inside the pipeline: GPT-5.6-Sol writes the first training explanations and is the judge, and Qwen3.8-27B merges explanations.

> **Note from Claude:** The paper does not use the words introspection or self-report (my search of its text). Its terms nearest to this wiki's subject are "verbalization debt" (§4.1), its name for the gap in rating between QUEEN and the encoder inside it, and "post-hoc explanation" (§5), for an explanation attached to a move after the move was chosen some other way.

## The argument, claim by claim

### Claim 1: two components make a general language model play and explain chess

A general language model becomes one that plays and explains chess through "complementary components: an encoder-decoder architecture and an iterative distillation algorithm" (Abstract). The first lets it read a position out of a chess engine's network. The second improves what it says by distilling its own search back into it.

The reason for the design is given in §3: "Our insight is that the LM must reason over chess concepts like positional features and tactical motifs, and how these concepts change under candidate moves to produce good explanations." Records of expert play "typically consist of state-action pairs without natural language explanations", so "we instead bridge the LM directly to a model whose representations encode these concepts" (§3). The lead author's thread puts the decision this way: "rather than teach an LM to play chess, we should give a chess-playing network ('Leela', Lc0) a mouth (SmolLM3-3B)" ([post 3](/threads/adithyanlp-chess-explain-moves#post-3)).

**Evidence.** First the bridge. The encoder is Leela, "a 240M parameter encoder-only model, consisting of 15 layers with a hidden dimension of 1024", which reads a position as 64 tokens, one for each square, and "plays at a near-superhuman level without search" (§3.1). The decoder is SmolLM3-3B, "a general-purpose language model with little to no chess-specific training" (§3.1). Gated cross-attention layers are put between the decoder's layers, with one change to the design they come from: "Unlike the original Flamingo architecture where only the last encoder hidden state is used, we pair e_i with d_2i", so that the decoder can "access representations from earlier stages of the encoder" (§3.1). The bridge has about 470M parameters, and each of its gates starts shut, "so cross-attention starts as a no-op and opens gradually" (A.3).

![A diagram in three parts. Left: a chess position goes into Lc0, marked with a snowflake, which gives a stack of board-shaped representations labeled 'Layer k'. Middle: a box labeled SmolLM3-3B and repeated N times, in which a 'gated xattn block' takes K and V from Lc0 and Q and a residual from the text tokens 'Analyze this chess position .', and feeds a 'transformer block' labeled 'Layer 2k' and marked with a snowflake; the tokens that come out at the top read 'Black has weakened their king ...'. Right: the two blocks opened up. The transformer block is self-attention then feed-forward, each with a residual connection and a snowflake. The gated cross-attention block is cross-attention then feed-forward, each followed by a 'tanh gate' and a residual connection.](/figures/bhaskar2026-chess-explain-moves/fig2-architecture.png "Figure 2 of the paper: the architecture, a chess network joined to a language model by gated cross-attention blocks.")

The bridge is trained on questions whose answers a program can compute. Each example is a position, given to the encoder, and a query "about the current encoded position p or a future position p′ reached by a provided sequence of 1 to 8 moves" (§3.2). The questions come in four kinds, taken in this order: static questions about the current position, such as "identifying the piece on a queried square"; dynamic ones about it, such as "finding all possible legal moves for a queried piece"; then the same two kinds about the position after a given sequence of moves. "all answers are generated and verified programmatically" (§3.2). Earlier kinds are "replayed at low proportions in subsequent stages to prevent forgetting", and throughout "the encoder and decoder are both frozen; only the cross-attention bridge parameters and new token embeddings are trained" (§3.2). The checkpoint this gives is called PAWN. On held-out questions its accuracy is 0.9997 on both static kinds, 0.9897 on dynamic questions about the current position and 0.9607 on dynamic questions about a future one (Table 10).

![Two chess boards and four example questions with their answers. Static current (L): 'List all pieces on the g- file.' A: 'White pawn on g2, white bishop on g5, black pawn on g7, and black king on g8.' Static future (L): 'After white bishop to h4, list all pieces on the 4-th rank,' A: 'White pawn on d4 and white bishop on h4.' Dynamic current (R): 'What pieces can deliver a check to the black king?' A: 'The white bishop on d3 via bishop d3 to h7 with check.' Dynamic future (R): 'After white pawn e3 to e4, list all pieces that attack or defend d5.' A: 'The white knight on c3 and white pawn on e4 attack it, while the black queen on d8, the black knight on f6 and the black pawn on c6 defend it.' On the left board the g-file and the fourth rank are highlighted. On the right board arrows mark the bishop's path from d3 to h7 and the pieces bearing on d5.](/figures/bhaskar2026-chess-explain-moves/fig4-curriculum.png "Figure 4 of the paper: one question and answer for each of the four stages of domain adaptation, the static ones drawn on the left board and the dynamic ones on the right.")

Then a start in the format wanted. PAWN "can answer structured chess questions, but has not seen examples of our desired explanation format" (§3.3). GPT-5.6-Sol (low) is prompted on 15,000 positions to write explanations with a best move, a PV and prose, "together with three promising moves and a position evaluation" (§3.3). Once responses with illegal moves or mistakes are removed, 8,402 examples are left to train on and 200 to validate with (B.2, Table 12), and fine-tuning on them gives PAWN-1. "Though fluent, PAWN-1's explanations recommend low-quality and illegal moves, likely due to the limited strength of the teacher and the small size of the seed dataset." (§3.3.)

It is on PAWN-1 that the two parts of the bridge are tested, "Because iterative search distillation requires costly data generation" (§5). In one run Leela is replaced "with a dictionary-form representation of the complete board state (e.g., 'White King: e1, ...'), containing the same information as the FEN", which goes to the language model as text, and the curriculum is kept. In the other the curriculum is skipped and the encoder kept. Table 4 gives each model's Elo and its FNMR on the 1,000 tactical positions:

| | Elo | Tactics |
|---|---|---|
| PAWN-1 | 1782 | 73.9 |
| without the encoder | 514* | 9.7 |
| without the curriculum | 514* | 1.3 |

"As shown in Table 4, removing either component substantially degrades the model, indicating that both are important for producing a strong initialization for iterative search-distillation." (§5.)

Then the search. The pattern is AlphaZero, whose "paradigm repeatedly uses MCTS to produce improved evaluations, which are distilled into the network so that it can reproduce them without search" (§3.3). The authors carry it from numbers over to prose: "We extend this idea to natural language, proposing an analogue of the Bellman update where improved explanations are distilled back to the model" (§3.3). One round trains PAWN-(k + 1) from PAWN-k in five steps (§3.3, with the detail in B.1):

1. *Sample.* A pool of "roughly 400K root positions" is drawn from games between the current checkpoint and Stockfish, from human games and from puzzles.
2. *Generate.* For each root the model writes an explanation that names three promising moves, and then, separately, an explanation of each of the three positions those moves lead to. If all three moves are mistakes, "we replace the worst move with the Stockfish oracle move".
3. *Recurse.* "If any child predicts a mistake, we discard the current root and its other children, and repeat the prior step from the selected child." The stated reason: "we recursively descend into model mistakes until the root is beyond the capability of the model but the children are not" (B.1).
4. *Consolidate.* Qwen3.8-27B, "instructed not to introduce any new content", merges the three child explanations into one explanation of the root. Which move it must call best is fixed by the children's evaluations: "Choose the root candidate with the LOWEST signed numerical evaluation for the opponent." (Appendix F.)
5. *Train.* The merged explanation is set against the model's first one at the point where their PVs part, and dropped "if its move has a worse Stockfish evaluation or is illegal". What is left, "usually around 250K examples" (B.1), is the fine-tuning data for the next checkpoint.

![A root chess position on the left and, to its right under the word 'Consolidate', the three positions reached from it by Rh2, Qh2+ and Qxf3, with an arrow from the three back to the root. Each of the three has a short explanation. After Rh2: 'White is up a pawn and an exchange, but faces unavoidable mate... Best move: Qe6+ // Eval: -100.0'. After Qh2+: 'White is facing a scary check, but the king can escape via f1-e2... Best move: Kf1 // Eval: -0.1'. After Qxf3: 'White is down a bishop for just a pawn, but can force a repetition of moves... Best move: Qe6+ // Eval: 0.0'. Under the root: 'Consolidated explanation: White's king is exposed. The tempting check Qh2+ lets the king escape.... though Qxf3 wins a whole rook, white can force a repetition.... finally, the quiet move Rh2! sets up unavoidable mate on g2... Best move: Rh2. Bellman update: Eval = min(-100.0, -0.1, 0.0) = -100.0'.](/figures/bhaskar2026-chess-explain-moves/fig5-search-distillation.png "Figure 5 of the paper: one consolidation. The explanations of three child positions are merged into an explanation of the root.")

Seven rounds are run, "with PAWN-8 promoted to the name QUEEN" (§3.3), and the rating rises by 915 points: "across seven iterations, QUEEN gains 915 Elo points, (1782 → 2024 → 2187 → 2346 → 2539 → 2434 → 2559 → 2697)" (§4.1). The paper has no table or figure of the whole sequence; the lead author's thread charts it ([post 7](/threads/adithyanlp-chess-explain-moves#post-7)).

Last, the same search from a start that no frontier model wrote. In a variant, QUEEN (HCE), the first round's explanations are built from engine search and from templates over the features of Stockfish's hand-crafted evaluation, and the rest of training is unchanged (§5, Appendix D). Table 6 gives the Elo of both under the headings P1 to P4:

| | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| QUEEN | 1782 | 2024 | 2187 | 2346 |
| QUEEN (HCE) | 2115 | 2432 | 2476 | 2497 |

"the HCE variant shows a similar trajectory of Elo improvement to QUEEN, suggesting that frontier-model distillation is not strictly necessary for QUEEN to learn to generate high-quality explanations" (§5). In the thread: "Here is that model going from 2115 to 2497 in three iterations." ([post 8](/threads/adithyanlp-chess-explain-moves#post-8).)

- **Objections it expects.**
  - That another bridge or another decoder would have done as well. A.3 tries three bridges and three decoders on the curriculum's questions (Table 11). A bridge that projects into each layer's key-value cache "trailed both Flamingo and LLaVA by roughly 5–10 percentage points" and was dropped. Of the other two, "Clearly, our Flamingo architecture outperforms LLaVA." SmolLM3 is kept over Qwen3 because "it is smaller and is more accurate on three of the four tasks that we evaluated".
  - That the language model needs the position and not the encoder. The first ablation gives it the whole board as text, with the same curriculum (Table 4).
  - That the encoder, once attached, needs no curriculum. The second ablation is the answer (Table 4).
  - That the usual words for pieces and squares would mislead the decoder. "we add dedicated tokens for all 64 squares and 12 piece types" (§3.2).
  - That the model which merges explanations adds chess of its own. It was "chosen for its ability to strictly adhere to provided instructions" (B.1), and its prompt opens: "You are a faithful editor and synthesizer, not an independent chess analyst." It goes on: "Do not add chess knowledge or repair their analysis yourself." (Appendix F.)
  - That a round could teach analysis worse than the model already had. The fifth step drops any merged explanation whose line is worse than the original, and each child's line is "mechanically truncated immediately before its first illegal move or its first move with a Stockfish-100k win-rate drop of at least 10 percentage points" (Appendix F) before it is merged.
  - That the gain belongs to the frontier teacher and not to the search. In the HCE variant, "No frontier LM is used to write these seed explanations." (Appendix D.) And QUEEN ends ahead of "the model it was seeded from (SOL)" (§4.2).
- **How strongly it is made.** The gain is attributed outright: "We attribute this strong performance to our iterative search distillation procedure" (§4.1). What the procedure does to the model is stated without a hedge in the introduction: "This procedure increases the quality of our model's explanations by improving its implicit search and look-ahead capabilities." (§1.) The ablation's wording is "indicating that both are important" in §5 and "Both the encoder and curriculum are essential for a good initialization." in the caption of Table 4. The variant without a frontier teacher is put as a suggestion: "not strictly necessary" (§5).
- **What it hands on.** PAWN-8, renamed QUEEN: the model whose explanations claim 2 scores.

> **Note from Claude:** One check on a claim is to ask how its evidence could hold and the claim still be false. The evidence for the search is one sequence of eight ratings. The last rests on 32 games (Table 1); the paper does not say how many the others rest on, gives no interval for any, and the sequence is not monotone: 2539 is followed by 2434. No run takes a step out of the loop, so what is shown is that the loop as a whole raises strength. Stockfish is inside that loop at five points (my count from §3.3, B.1 and Appendix F): it supplies a move when all three candidates are poor, decides when to recurse, cuts each child's line before its first bad move, replaces the number in the evaluation ("we overwrite just the numerical component of the evaluation section with the true Stockfish evaluation (100K nodes)", B.1), and filters what is trained on. How much of the gain is the model's own search and how much the oracle's corrections is not separated (my reading). That the procedure works "by improving its implicit search and look-ahead capabilities" (§1) is not put to a test of its own. For the bridge, the paper says itself that the ablations are of the start: both ablated models are scored after seeding, and neither is taken through the rounds of search. Table 4 marks their ratings with an asterisk it does not explain; in Table 1 the same rating with an asterisk belongs to a model that "lost all 32 games". Table 6 does not say what P stands for; the QUEEN row repeats the first four ratings of the sequence in §4.1, so I read P1 to P4 as PAWN-1 to PAWN-4. By P4 the HCE variant has gained 382 points and QUEEN 564 (my arithmetic), which the authors call "a similar trajectory of Elo improvement", and the variant's explanations are not scored on substantiation or coherence: the paper shows one of them (E.2).

### Claim 2: QUEEN's explanations are more accurate and better substantiated than frontier models', and approach them in coherence

QUEEN plays near the level of a median Grandmaster. On the three things asked of an explanation, the authors put it ahead of every model compared on accuracy and substantiation, and near the frontier models on coherence. The caption of the paper's first figure puts it as "QUEEN offers the best of both worlds." (Figure 1.)

![A chart with four axes that run from the center to the corners of a square: playing strength (top left), substantiation (top right), cost-efficiency (bottom left) and coherence (bottom right). Four outlines are drawn, with no numbers. QUEEN, a solid green line, is far out on playing strength, substantiation and cost-efficiency and less far out on coherence. Engine (Lc0), a dashed blue line, is at or beyond the corner on playing strength, substantiation and cost-efficiency and at the center on coherence. Frontier LM, a dash-dotted red line, is about halfway out on playing strength and substantiation, near the center on cost-efficiency and at the corner on coherence. Fine-tuned (prior), a dotted purple line, is near the center on playing strength and substantiation, far out on cost-efficiency and about halfway out on coherence.](/figures/bhaskar2026-chess-explain-moves/fig1-four-axes.png "Figure 1 of the paper: QUEEN, a chess engine, a frontier language model and an earlier fine-tuned model on four axes.")

**Evidence.** First accuracy, as estimated Elo after 32 games (§4.1, Table 1). The last four rows are for reference.

| | Elo |
|---|---|
| QUEEN | 2697 |
| GEMINI | 2201 |
| SOL | 2071 |
| LUNA | 1822 |
| C1-4B | 514* |
| Median Grandmaster | 2730 |
| Median International Master | 2560 |
| Median FIDE Master | 2470 |
| Leela (BT5 Encoder) | 2987 |

The asterisk is the table's: "C1-4B lost all 32 games." The authors read QUEEN's lead as "beating SOL by over 600 rating points and GEMINI by over 450", which is "an expected 97.4% and 94.6% win rate, respectively" (§4.1).

Then substantiation, in percent, on 1,000 tactical puzzles and 1,000 general positions (§4.2, Table 2):

| | Tactical NMR | Tactical FNMR | General NMR | General FNMR |
|---|---|---|---|---|
| QUEEN | 68.8 | 91.6 | 66.6 | 97.1 |
| GEMINI | 66.9 | 82.5 | 63.0 | 89.0 |
| SOL | 65.1 | 81.9 | 61.5 | 86.8 |
| LUNA | 35.6 | 53.5 | 47.1 | 73.6 |
| C1-4B | — | 43.2 | — | 38.8 |

"QUEEN performs the best across all metrics, beating out GEMINI by 2 points on NMR, and 9 points on FNMR." (§4.2.) C1-4B has no NMR: FNMR is there for "comparison with prior work that cannot generate a PV without re-encoding the position at each step" (§4.2).

Then coherence, as the judge's scores from 1 to 5 (§4.3, Table 3):

| | Structural coherence | Conceptual coherence | Fluency |
|---|---|---|---|
| QUEEN | 3.51 | 2.76 | 4.45 |
| GEMINI | 3.55 | 3.30 | 4.98 |
| SOL | 3.51 | 3.61 | 4.99 |
| LUNA | 2.82 | 2.94 | 4.96 |
| C1-4B | 2.48 | 2.16 | 4.94 |

The authors' reading (§4.3): "We find in Table 3 that all models are fluent."; QUEEN's structural score is "tied with SOL and approaching GEMINI, implying that it finds illustrative lines comparably well to the two models"; and "QUEEN obtains a low score of 2.76 on conceptual coherence".

- **Objections it expects.**
  - That QUEEN takes its move from Leela and writes the explanation afterwards. "A shortcut we'd like to guard against is the model learning to reconstruct Leela's policy head and then attaching a post-hoc explanation to its recommended move." (§5.) The test uses 1,000 positions "where at least five moves have expected win rates within 3% of the Stockfish-optimal move", because "The choice among several near-optimal moves more directly reflects the model's preferences." Table 5 gives three outcomes and the rate of each in percent: "Agrees with Lc0" 46.2, "Disagrees, in top-5" 39.1, "Outside top-5" 14.7. "This suggests that QUEEN does not simply reproduce Leela's policy, but instead uses the Lc0 representations to inform its own move selection." (§5.)
  - That puzzles are one narrow kind of position. "Since tactical puzzles only capture a narrow proportion of chess positions", both rates are also taken on positions "drawn from human games" (§4.2).
  - That the structural score sells QUEEN short. "One reason the score is not even higher for QUEEN is that it considers an average of 30.0 ply in the entire analysis, while SOL only considers 23.8 – giving the judge a greater chance to penalize it." (§4.3.)
  - That the judge marks QUEEN down for its notation. The judge is told that QUEEN's piece and square tokens "should not be penalized in any of the above metrics" (Appendix F).
  - That the frontier models were held back. All three run "under high reasoning budgets" (§4), with the prompt that produced the seed explanations, used "also for the evaluation of various GPT and Gemini models across our benchmarks" (Appendix F).
  - That a model built on Leela should play as well as Leela. "The gap between QUEEN and Leela reflects the challenge of expressing latent expert knowledge in language, which we view as a form of verbalization debt (I et al., 2026)." (§4.1.)
- **How strongly it is made.** The level of play is worded differently at different lengths. In the abstract it is "playing at the level of a typical Grandmaster". Where the rating is given it is "approaching the Lichess blitz rating of the median Grandmaster (2730)" (§1), and the caption of Table 1 has "Estimated ratings anchored to Lichess Elos after 32 games." In the thread it is "~GM in playing strength (Lichess blitz ratings)" ([post 7](/threads/adithyanlp-chess-explain-moves#post-7)). On the explanations, the strongest wording is the first sentence of §6, quoted as the answer above. On coherence the abstract has "approach GPT-5.6-Sol (high) in coherence" and §6 has "coherence comparable to that of frontier language models", beside the caption of Table 3: "QUEEN struggles with conceptual coherence". §4.3 closes: "We conclude that QUEEN provides fluent, high-quality explanations."
- **What it hands on.** The one worked case that claim 3 reasons from.

> **Note from Claude:** The same check on claim 2. All three measures set an explanation against the position: the move and the line against Stockfish, the prose by a judge that is handed Stockfish's three best lines and a blunder check of the explanation's line (Appendix F). The one test of where QUEEN's move comes from is the comparison with Leela, and it compares moves; the explanations given on those 1,000 positions are not examined (my reading of §5). Table 5 does not say whose top five its rows mean, and in positions picked for having five or more near-equal moves, a copy of Leela's policy with some noise in it would also often land on a different move (my reasoning). The judge, GPT-5.6-Sol (high), is also the baseline SOL and, at low effort, the writer of the seed explanations. Its prompt names the first two axes "Lack of structural hallucinations" and "Lack of conceptual hallucinations" where §4.3 has structural and conceptual coherence, and neither §4.3 nor Appendix C says how many explanations were judged or on which positions. On conceptual coherence and on fluency QUEEN is below all three frontier models (Table 3), so the abstract's "approach GPT-5.6-Sol (high) in coherence" and the conclusion's "coherence comparable to that of frontier language models" hold for the structural score (my reading). A margin such as 68.8 against 66.9 comes from 1,000 positions, and each rating from 32 games; no interval is given for either. The cost-efficiency axis of Figure 1 has no measurement in the text that I could find; the nearest is the abstract's "three orders of magnitude fewer parameters".

### Claim 3: the recipe is not specific to chess

The framework is offered for other domains: "The generality of our architecture and training procedure suggests a recipe for applying language models to domains where silent expert encoders are available, like games, robotics, and computer use." (Abstract.)

**Evidence.** The experiments are all in chess, as the paper says where it makes the claim: "While our experiments focus on chess" (§1), "Although we develop and evaluate QUEEN in the domain of chess" (§6). What it offers is the form of the two components, each with the condition under which it would carry over. Of the architecture: "our pipeline is general and can be easily extended to settings where a domain-expert Transformer encoder can be trained" (§1). Of the search: "This algorithm is general and can be extended to any domains that benefit from tree-search methods such as MCTS and alpha–beta pruning." (§1.) Of the two together: "Our architecture provides a general mechanism to couple a language model with a pretrained expert encoder, while our training procedure provides an iterative improvement algorithm for any stateful environment." (§6.)

- **Objections it expects.** The paper raises none. The division of labor it has in mind is in its last sentence: "expert models can provide the domain-specific representations and evaluations needed for strong decision-making, while language models can turn these signals into explanations that are accessible to humans and useful for further reasoning" (§6).
- **How strongly it is made.** As a suggestion in the abstract, "suggests a recipe", and in the introduction, "with potential applications in games, robotics, and computer use" (§1). The list of contributions is firmer: "can be easily extended".

> **Note from Claude:** The same check on claim 3. With one domain, nothing in the paper could show the claim false, and the authors word it as a suggestion. The conditions they state are an expert encoder and, for the search, a domain where tree search helps. The chess pipeline also drew on things the statements of generality do not list (my reading of §3.2, §3.3 and B.1): questions whose answers a program can generate and check, an oracle that marks mistakes inside every round, and exact rules for stepping from a position to its children. The reach of the search is worded two ways: "any domains that benefit from tree-search methods" in the contributions and "any stateful environment" in the conclusion.

## What the paper claims as new

In its own words:

- The framework: "Our novel framework enables domain-specific reasoning" (Abstract).
- The search: "we introduce an iterative distillation algorithm inspired by the Bellman value update, serving as a natural-language analogue to its real-valued counterpart" (§1). The thread calls it the "natural-language analogue of the Alphazero algorithm" ([post 1](/threads/adithyanlp-chess-explain-moves#post-1)).
- Against chess engines: "whereas chess engines output only move predictions, QUEEN additionally explains the reasoning behind them in natural language." (§2.)
- Against earlier language models for chess: "Compared to prior methods, QUEEN achieves a substantially greater playing strength, enabling it to generate higher-quality explanations." (§2.)
- The evaluation: "We establish an evaluation framework for assessing the quality of generated explanations along three dimensions: accuracy, substantiation, and coherence." (§1.)

The architecture is not claimed as the paper's alone: "Concurrent work adopted an encoder-decoder architecture that integrated latent representations from a silent chess expert into a language model (I et al., 2026), similar to our approach." (§2.) That work's models "have not been released as of this writing" (footnote 5), so it is not among the baselines.

## Limits the authors state

The paper has no section of limitations. These are stated where the results are reported:

- Conceptual coherence stays low, and the method is given as the reason: "hallucinations of motifs and patterns can potentially propagate through the consolidation and keep conceptual coherence low. This is a limitation of our method and we look to future work to resolve it." (§4.3.) The caption of Table 3 adds that the search "cannot teach it to verbalize and describe motifs it hasn't seen".
- QUEEN is weaker than the encoder inside it, 2697 against 2987 (Table 1), which the authors call "a form of verbalization debt" (§4.1).
- The games are few. "We would like to run even more games, but running games with frontier LMs is quite expensive, often costing north of $15 per game with GPT-5.6-Sol (high)." (Appendix C.)
- The ablations are of the seeded model only, for reasons of cost (§5).
- One model of the same design is not compared: "We would also like to compare against LLAMIA (I et al., 2026), concurrent work that adopts a similar architecture" (footnote 5).
- In the comparison of bridges and decoders, two runs are marked "Undertrained: the training run was aborted early, at step counts matched to Flamingo." (Table 11.)
- The experiments are in chess only (§1, §6).

## How the paper tells it

The paper tells this argument four times, each longer than the last: in its title, "Language Models that Play Chess and Explain Their Moves", in the abstract, in the introduction with its two figures, and in the body. This part takes them in that order.

### The abstract

Nine sentences. The role is the job the sentence does.

| # | Sentence, abbreviated | Role |
|---|---|---|
| 1 | "Modern chess engines are silent experts" | Context, and half of the problem |
| 2 | Language models "can generate plausible-sounding explanations, but their weak playing strength limits the utility of their explanations." | The other half of the problem |
| 3 | "We introduce QUEEN, a 4B-parameter chess-language model that can explain its moves and plans while playing at the level of a typical Grandmaster." | The contribution: claim 2 in a sentence |
| 4 | "Our novel framework enables domain-specific reasoning through complementary components" | Claim 1 announced, and a signpost for the next two sentences |
| 5 | The architecture "integrates a silent expert chess encoder with an instruction-tuned LM through cross-attention", trained "via a question-answering curriculum". | Claim 1, the bridge |
| 6 | "we iteratively improve its explanations with a natural-language analog of the Bellman update" | Claim 1, the search |
| 7 | "Over seven iterations, our model gains over 900 Elo points (1782 → 2697), substantially surpassing all frontier models on both playing strength and puzzle accuracy" | Evidence for claims 1 and 2 |
| 8 | "our explanations are fluent and approach GPT-5.6-Sol (high) in coherence" | Claim 2 on coherence, with its hedge |
| 9 | The generality "suggests a recipe for applying language models to domains where silent expert encoders are available". | Claim 3 |

> **Note from Claude:** The abstract puts the result (sentence 3) before the method and then gives the method before the evidence, as the body does. Its numbers are all about size and playing strength: a parameter count, two ratings, a gain. Sentence 7 has "puzzle accuracy", a term the body does not use (my search); the puzzle results there are the two no-mistake rates of Table 2.

### The introduction

Five paragraphs and a list of contributions, each with the job it does.

| ¶ | What it says | Role | Cites |
|---|---|---|---|
| 1 | Chess has been "a benchmark for machine intelligence" since Shannon's estimate of 1950, most recently for Transformers. | Context | Berliner 1978 |
| 2 | "We present QUEEN", and what explanations are good for. Then "However, existing approaches fall short": engines are silent, language models trained to explain "often struggle to select strong moves", and frontier models are costly. | The contribution first, then why it matters and the gap | Ruoss et al. 2024, Monroe & Chalmers 2024, Cui et al. 2026, Kim et al. 2025, Tang et al. 2026, Kolasani et al. 2025 |
| 3 | "In this work, we address this gap through two complementary components." The architecture and its curriculum, then the search. | The approach: claim 1 | Bellman 1957 |
| 4 | "we establish an evaluation framework along three dimensions: accuracy, substantiation, and coherence." Then the results: a rating of 2697 against 2071 and 2201, a no-mistake rate "higher than all baselines", explanations that "approach GPT-5.6-Sol in coherence". | The measures, and claim 2 with its numbers | none |
| 5 | "Beyond chess, our framework suggests a general recipe". Then the contributions: the architecture and training recipe, the search-distillation algorithm, the evaluation framework. | Claim 3, and the list of contributions | none |

The introduction also carries Figures 1 and 2 and footnote 1. Figure 1 is the summary shown under [claim 2](#claim-2-queens-explanations-are-more-accurate-and-better-substantiated-than-frontier-models-and-approach-them-in-coherence). Figure 2, the architecture, is at the top of the second page, in the middle of paragraph 2. Footnote 1 gives the size of the standard in the title: "As of October 2, 2026, there are 1,899 Grandmasters, fewer than 0.01% of active online players."

> **Note from Claude:** The contribution is in the second paragraph, before the gap it fills, and the results come with their numbers in the fourth. The contributions divide the paper by kind: an architecture, an algorithm, an evaluation framework. The first two each end in a statement of generality, so claim 3 is made three times in the last paragraph and its list (my count). Neither the comparison with Leela's choices nor the variant without a frontier teacher, both in §5, is mentioned in the abstract or the introduction (my reading).

### The body, section by section

For each section: its job, how it opens, what it hands on, and what would be missing without it.

**§2 Related Works.** Its job is to place QUEEN against two lines of work, and it comes before the method. It has two paragraphs, each headed by its subject and each ending on QUEEN. The first, on chess engines, runs from Deep Blue to Lc0 and to engines made to play like humans, and ends with the sentence on engines quoted [above](#what-the-paper-claims-as-new). The second, on language models and chess, runs from benchmarks to commentary to explanation, names the concurrent work, and ends with the inference the paper rests on and the claim of greater playing strength. Footnote 2 defines the centipawn. Without it the statements of novelty have nothing under them.

**§3 QUEEN: Our Approach** (claim 1; Figures 2, 3, 4 and 5). Its job is the method. It opens with the goal and with what an explanation is, sets out "two natural starting points", engines and general language models, says why neither will do alone, and gives the insight and a roadmap: "a natural two-stage training process".

- **§3.1 Architecture** (Figure 2). The encoder, the decoder, the bridge and the flow through the whole model, each under a run-in heading, then a pointer to the ablations of Appendix A. Footnote 3 explains FEN, the notation a position is given in.
- **§3.2 Domain Adaptation** (Figure 4). Opens with what earlier work found in Leela, and states its aim: "to train the decoder to reliably extract these latent features from Leela's representations". It hands on PAWN.
- **§3.3 Iterative Search Distillation** (Figure 5). Opens with what PAWN lacks, seeds it, names the weakness of PAWN-1, and then gives the five steps. Footnote 4 defines a mistake. It hands on QUEEN.

Without §3 there is no model to evaluate.

**§4 Evaluations** (claim 2; Tables 1, 2 and 3). Its job is the comparison. It opens "We identify three desiderata for high-quality explanations.", gives a roadmap and the baselines, and then has one subsection and one table for each: §4.1, §4.2, §4.3. Footnote 5 is on the model not compared. §4.1 also holds the evidence for the second half of claim 1, the sequence of eight ratings, and ends on verbalization debt. §4.3 ends with the stated limitation and its conclusion. Without §4 the title has no evidence.

**§5 Analysis** (claims 1 and 2; Tables 4, 5 and 6). Its job is three checks, one paragraph each, each with a small table set beside it. The first is the ablation of the bridge, done "to quantify their importance". The second, headed "(Dis)agreement with Leela.", opens with the shortcut it guards against. The third, headed "Moving away from frontier LM annotation." (§5), asks "whether QUEEN can achieve strong performance without being seeded with explanations from a frontier model". Without it claim 1 has no test of its parts, and the objection that the explanation is attached to Leela's move has no answer.

**§6 Conclusion.** One paragraph of seven sentences. The first three restate claim 2, and the last four make claim 3.

> **Note from Claude:** The headings name the two components and the three measures, and none states a result. Claim 2's results are in three tables; the only chart of a result is Figure 1, on the first page, and it has no numbers. The evidence for the search, the eight ratings, is a parenthesis in §4.1, in a section about claim 2. §5 holds the two experiments that ask whether a part is needed and the one that asks where the move comes from, and it gets about 9% of the main text (my count, below).

### The appendices

Each by the job it does.

| Appendix | Holds | Job |
|---|---|---|
| Appendix A | A roadmap of its three parts | |
| A.1 | Tables 7 and 8: the question types of the curriculum with a sample of each, and the mix of data at each stage | Detail to replicate |
| A.2 | Table 9: training hyperparameters. Table 10: PAWN's accuracy on held-out questions | Detail to replicate, and a result for claim 1 |
| A.3 | Three bridges and three decoders compared; Table 11 | Check on claim 1: the choice of bridge and decoder |
| Appendix B | Heading for the search | |
| B.1 | The pool of positions, recursive sampling, consolidation and training in full; Algorithm 1 | Detail to replicate |
| B.2 | The seeding from GPT-5.6-Sol (low), which cost $652.35; Tables 12 and 13: fine-tuning hyperparameters | Detail to replicate |
| Appendix C | The eight opponents and their ratings (Table 14), the two openings, the Stockfish budget, the judge | Definition of the measures |
| Appendix D | How the HCE seed explanations are built: the search tree, plausible mistakes taken from a Maia network, judging, refutations, templates, and one example | Detail to replicate, for the variant of claim 1 |
| Appendix E | One position, White to move | |
| E.1 | QUEEN's explanation of it | Example |
| E.2 | QUEEN (HCE)'s explanation of it | Example |
| Appendix F | Five prompts: for the seed explanations and the frontier baselines, for translating into QUEEN's tokens, for QUEEN itself, for consolidation, and for the judge | Detail to replicate, and the definition of the coherence scores |

> **Note from Claude:** By my count of the PDF's text, with the insides of the five figures left out, the main text is about 5,000 words and the appendices about 6,550, of which the prompts of Appendix F are about 2,440. Within the main text: abstract 5%, §1 14%, §2 11%, §3 37%, §4 22%, §5 9%, §6 3%. The method gets more text than the evaluation and the analysis together. The judge's prompt, about 1,020 words, is the longest of the five (my count) and longer than any one sub-section of the main text; it is where the two coherence scores are defined in full.

### The same three claims at every length

Where each claim appears, from the shortest statement of the paper to the longest, then in the authors' posts:

| Where | Claim 1 | Claim 2 | Claim 3 |
|---|---|---|---|
| Title | | "Language Models that Play Chess and Explain Their Moves" | |
| [Chen's post](/threads/danqichen-chess-explain-moves) | | "A 4B chess LM that plays chess at typical grandmaster level and explains its moves" | |
| Caption of Figure 1 | | "QUEEN offers the best of both worlds." | |
| [Bhaskar's first post](/threads/adithyanlp-chess-explain-moves#post-1) | "needing both architectural & algorithmic innovation" | "make LMs play/explain chess" | "applicable to many other domains" |
| Abstract | sentences 4–7 | sentences 3, 7 and 8 | sentence 9 |
| Contributions, §1 | first and second | third | within the first and second |
| Conclusion, §6 | | sentences 1–3 | sentences 4–7 |
| Section | §3, §5 | §4, §5 | |
| Main-text figures and tables | Figures 2, 4 and 5, Tables 4 and 6 | Figure 1, Tables 1, 2, 3 and 5 | |
| Appendix | Appendices A, B and D, and four prompts of Appendix F | Appendices C and E, and the judge's prompt in Appendix F | |
| [Bhaskar's thread](/threads/adithyanlp-chess-explain-moves) | posts 3–6, 8 and 9 | posts 2 and 7 | post 1 |

Figure 3, the example explanation, belongs to no one claim: it shows the format all three are about. The image on Bhaskar's first post is the paper's first page. Chen's post is a quote of that first post.

> **Note from Claude:** Placing the title under claim 2 is my reading of it: it names what the models do and not how they were made. Claim 2 is then present at every length, and the three shortest statements carry nothing else. Claim 3 has the last sentence of the abstract and more than half of the conclusion, and no section, figure, table or appendix of its own. The level of play is "at a Grandmaster level" (§1) and "at the level of a typical Grandmaster" in the short statements, and "approaching the Lichess blitz rating of the median Grandmaster (2730)" in the sentence that gives QUEEN's own rating.
>
> The paper and the thread describe one system from opposite ends. In §3 a language model is bridged to an encoder; in the thread a chess network is given "a mouth". The explaining in the title is measured in §4 by what an explanation says about the position. Whose move it is that gets explained, the language model's or the network's, is the question the comparison with Leela's choices bears on, and that comparison is one paragraph and one table of §5 (my reading).
