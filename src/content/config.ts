import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
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
