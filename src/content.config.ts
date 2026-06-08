import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    tools: z.array(z.string()).optional(),
    medium: z.string().optional(),
    type: z.string().optional(),
    date: z.coerce.date().optional(),
    featured: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    type: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

const visuals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/visuals' }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    series: z.string().optional(),
    date: z.coerce.date().optional(),
    tools: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }),
});

export const collections = { projects, writing, visuals };
