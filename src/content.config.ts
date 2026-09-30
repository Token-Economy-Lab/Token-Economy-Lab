import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { resolve } from 'node:path';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: resolve(process.env.CONTENT_DIR || './examples/notes') }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.string(),
    minutes: z.number(),
    status: z.enum(['基础笔记', '专题框架', '已核验', '待核验']),
    updated: z.string(),
  }),
});

export const collections = { notes };
