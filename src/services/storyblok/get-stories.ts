import { getStoriesResponseSchema, type StoryblokStory } from "./schemas";
import { useStoryblokApi, type ISbStoriesParams } from "@storyblok/astro";

export async function getStories<T>({
  contentType,
  page,
  per_page,
  options,
  version,
}: {
  version: "draft" | "published";
  contentType?: string;
  page?: number;
  per_page?: number;
  options?: ISbStoriesParams;
}): Promise<{
  stories: StoryblokStory<T>[];
  total: number;
  perPage: number;
}> {
  const storyblok = useStoryblokApi();

  const response = await storyblok.getStories({
    version,
    page: page ?? 1,
    per_page: per_page ?? 100,
    resolve_links: "url",
    ...(contentType ? { content_type: contentType } : {}),
    ...options,
  });

  const parsed = getStoriesResponseSchema.parse(response);
  return {
    stories: parsed.data.stories as StoryblokStory<T>[],
    total: parsed.total,
    perPage: parsed.perPage,
  };
}
