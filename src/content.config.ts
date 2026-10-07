import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { METHOD_VALUES, STATUS_VALUES, TIER_VALUES } from './lib/vocab.mjs';

// A question the paper asked and the answer it got. `see` links the experiment
// that answered it. The tree is deliberately shallow: the leading question, the
// questions it breaks into, and one more level under those.
const answered = z.object({ q: z.string(), a: z.string(), see: z.string().optional() });
const questions = answered.extend({ sub: z.array(answered.extend({ sub: z.array(answered).default([]) })).default([]) });

const papers = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/papers' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    year: z.number().int(),
    date: z.coerce.date().optional(),
    venue: z.string().optional(),
    // seed: the paper the wiki grew from. core: about introspection itself.
    // adjacent: a neighboring question the core work leans on.
    tier: z.enum(TIER_VALUES),
    // stub: metadata and a one-line description. full: written from the full text.
    status: z.enum(STATUS_VALUES),
    // Summaries are drafted by an AI model. This flips once a person has
    // checked the page against the paper.
    reviewed: z.boolean().default(false),
    summary: z.string(),
    links: z
      .object({
        arxiv: z.string(),
        doi: z.string(),
        url: z.string().url(),
        pdf: z.string().url(),
        code: z.string().url(),
        project: z.string().url(),
        s2: z.string(),
      })
      .partial()
      .default({}),
    // Ids of other pages. Citation edges found by the crawler are merged in at
    // build time, so `cites` only needs what the crawler cannot see.
    cites: z.array(z.string()).default([]),
    concepts: z.array(z.string()).default([]),
    threads: z.array(z.string()).default([]),
    // "At a glance", the block at the top of a page: the takeaways (a new
    // method is marked as one), the questions the paper asked with their answers, the terms its argument turns on as the paper
    // itself defines them, and the bare facts of the setup.
    takeaways: z
      .array(z.object({ title: z.string(), text: z.string(), kind: z.enum(['finding', 'method']).default('finding'), see: z.string().optional() }))
      .default([]),
    questions: questions.optional(),
    terms: z
      .array(z.object({ term: z.string(), means: z.string(), where: z.string().optional(), concept: z.string().optional() }))
      .default([]),
    setup: z
      .object({
        reports_on: z.string(),
        methods: z.array(z.enum(METHOD_VALUES)),
        models: z.array(z.string()).default([]),
      })
      .optional(),
    // What the page was written from: "full text (arXiv v2)", "author thread".
    sources: z.array(z.string()).default([]),
    added: z.coerce.date(),
    updated: z.coerce.date(),
  }),
});

const concepts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/concepts' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    aliases: z.array(z.string()).default([]),
    reviewed: z.boolean().default(false),
    added: z.coerce.date(),
    updated: z.coerce.date(),
  }),
});

const person = z.object({ name: z.string(), handle: z.string() });

// Written by scripts/thread.mjs. `title`, `summary`, `papers` and each image's
// `alt` are edited by hand afterwards and survive a re-import.
const threads = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/threads' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    platform: z.literal('x'),
    author: person,
    url: z.string().url(),
    date: z.coerce.date(),
    papers: z.array(z.string()).default([]),
    tweets: z.array(
      z.object({
        id: z.string(),
        url: z.string().url(),
        date: z.coerce.date(),
        text: z.string(),
        // The official embed markup from X's oEmbed endpoint.
        html: z.string(),
        // One entry per attached image. The image itself is shown by the embed;
        // `alt` is our description of it, for readers who only get the text.
        images: z.array(z.object({ alt: z.string() })).default([]),
        quote: z.object({ url: z.string().url(), author: person, date: z.coerce.date(), text: z.string() }).optional(),
      }),
    ),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), summary: z.string(), updated: z.coerce.date() }),
});

export const collections = { papers, concepts, threads, pages };
