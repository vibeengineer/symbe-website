import { useStoryblokApi, type ISbStoriesParams } from "@storyblok/astro";
import { getStoryResponseSchema, type StoryblokStory } from "./schemas";

export async function getStory<T>({
  slug,
  options,
  version,
}: {
  version: "draft" | "published";
  slug: string;
  options?: ISbStoriesParams;
}): Promise<StoryblokStory<T>> {
  const storyblok = useStoryblokApi();

  const response = await storyblok.getStory(`${slug}`, {
    version,
    resolve_links: "url",
    ...options,
  });

  const parsed = getStoryResponseSchema.parse(response);
  return {
    ...parsed.data.story,
    content: parsed.data.story.content as T,
  };
}
