import { useStoryblokApi, type ISbStoriesParams } from "@storyblok/astro";
import { z } from "zod";
import type {
  AssetStoryblok,
  MultilinkStoryblok,
} from "../../../storyblok/types";

export const storyblokBaseSchema = z.object({
  data: z.object({
    story: z.object({
      name: z.string(),
      created_at: z.string().datetime(),
      published_at: z.string().datetime(),
      id: z.number(),
      uuid: z.string().uuid(),
      content: z.any(),
      slug: z.string(),
      full_slug: z.string(),
      sort_by_date: z.any(),
      position: z.number(),
      tag_list: z.array(z.any()),
      is_startpage: z.boolean(),
      parent_id: z.number(),
      meta_data: z.any(),
      group_id: z.string(),
      first_published_at: z.string().datetime(),
      release_id: z.any(),
      lang: z.string(),
      path: z.any(),
      alternates: z.array(z.any()),
      default_full_slug: z.any(),
      translated_slugs: z.any(),
    }),
    cv: z.number(),
    rels: z.array(z.any()),
    links: z.array(z.any()),
  }),
  headers: z.record(z.string()),
});

export async function getStory<T>({
  slug,
  options,
}: {
  slug: string;
  options?: ISbStoriesParams;
}) {
  const storyblok = useStoryblokApi();

  const response = await storyblok.get(`cdn/stories/${slug}`, {
    version: import.meta.env.MODE === "development" ? "draft" : "published",
    ...options,
  });

  const parsedResponse = storyblokBaseSchema.parse(response);

  return {
    ...parsedResponse.data.story,
    content: parsedResponse.data.story.content as T,
  };
}

export function parseLink(link: MultilinkStoryblok) {
  if (link.linktype === "url" || link.linktype === "asset")
    return {
      href: link.url,
      target: link.target ?? "_self",
    };
  if (link.linktype === "email")
    return {
      href: `mailto:${link.url}`,
      target: "_blank",
    };
  if (link.linktype === "story" && link.story)
    return {
      href: link.story.full_slug,
      target: link.target ?? "_self",
    };

  throw new Error("Invalid link object state");
}

export function parseAsset(asset: AssetStoryblok) {
  if (!asset.filename && !asset.src) throw new Error("No filename found");
  return {
    src: asset.filename ?? asset.src,
    alt: asset.alt,
  };
}
