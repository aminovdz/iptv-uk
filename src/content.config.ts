import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    modDate: z.coerce.date().optional(),
    author: z.string().default('British IPTV Editorial Team'),
    category: z.string().default('Streaming Guide'),
    image: z.string().optional(),
    readingTime: z.string().default('6'),
    quickSummary: z.string().optional(),
    toc: z.array(z.object({
      title: z.string(),
      anchor: z.string()
    })).optional(),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional()
  })
});

export const collections = { guides };
