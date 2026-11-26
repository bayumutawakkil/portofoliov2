import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    year: z.string(),
    status: z.string(),
    accent: z.enum(['blue', 'cyan', 'violet']),
    stack: z.array(z.string()),
    externalUrl: z.string().url(),
    summary: z.string(),
  }),
});

export const collections = { projects };
