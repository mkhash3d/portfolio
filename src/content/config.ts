import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    type: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

export const collections = { projects, writing };
