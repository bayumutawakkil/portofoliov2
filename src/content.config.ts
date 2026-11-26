import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    order: z.number().default(99),
    title: z.string(),
    shortTitle: z.string().optional(),
    category: z.string(),
    shortCategory: z.string().optional(),
    year: z.string(),
    status: z.string(),
    accent: z.enum(['blue', 'cyan', 'violet']),
    stack: z.array(z.string()),
    externalUrl: z.string().url(),
    summary: z.string(),
    role: z.string().optional(),
    problem: z.string().optional(),
    decision: z.string().optional(),
    outcome: z.string().optional(),
  }),
});

export const collections = { projects };
