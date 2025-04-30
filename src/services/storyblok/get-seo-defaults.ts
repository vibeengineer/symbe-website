import { useStoryblokApi } from "@storyblok/astro";
import type { SeoDefaultsStoryblok } from "../../../storyblok/types";

export async function getSeoDefaults() {
  const sbApi = useStoryblokApi();
  let story: SeoDefaultsStoryblok | null = null;

  const { data } = await sbApi.get("cdn/stories/globals/seo-defaults", {
    version: import.meta.env.MODE === "development" ? "draft" : "published",
  });

  story = data?.story?.content as SeoDefaultsStoryblok;

  if (!story) {
    console.error("No seo defaults found in storyblok");
    throw new Error("No seo defaults found in storyblok");
  }

  return {
    title: story.title,
    description: story.description,
    noIndex: story.noIndex,
    ...(story.openGraphImage && {
      openGraphImage: story.openGraphImage,
    }),
    ...(story.twitterHandle && { twitter: story.twitterHandle }),
    ...(story.openGraphTitle && { openGraphTitle: story.openGraphTitle }),
  };
}
