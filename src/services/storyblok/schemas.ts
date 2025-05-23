import { z } from "zod";

export const storyblokStoryBaseSchema = z.object({
  name: z.string(),
  created_at: z.string().datetime(),
  published_at: z.string().datetime().nullable(),
  id: z.number(),
  uuid: z.string().uuid(),
  content: z.unknown(),
  slug: z.string(),
  full_slug: z.string(),
  sort_by_date: z.unknown(),
  position: z.number(),
  tag_list: z.array(z.unknown()),
  is_startpage: z.boolean(),
  parent_id: z.number(),
  meta_data: z.unknown(),
  group_id: z.string(),
  first_published_at: z.string().datetime().nullable(),
  release_id: z.unknown(),
  lang: z.string(),
  path: z.unknown(),
  alternates: z.array(z.unknown()),
  default_full_slug: z.unknown(),
  translated_slugs: z.unknown(),
});

export type StoryblokStory<T> = Omit<
  z.infer<typeof storyblokStoryBaseSchema>,
  "content"
> & { content: T };

export const getStoryResponseSchema = z.object({
  data: z.object({
    story: storyblokStoryBaseSchema,
    cv: z.number(),
    rels: z.array(z.unknown()),
    links: z.array(z.unknown()),
  }),
  headers: z.record(z.string()),
});

export const getStoriesResponseSchema = z.object({
  data: z.object({
    stories: z.array(storyblokStoryBaseSchema),
    cv: z.number(),
    rels: z.array(z.unknown()),
    links: z.array(z.unknown()),
  }),
  headers: z.record(z.string()),
  perPage: z.number(),
  total: z.number(),
});
