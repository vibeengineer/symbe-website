import { useStoryblokApi, type ISbStoriesParams } from "@storyblok/astro";
import { z } from "zod";
import type { AssetStoryblok, MultilinkStoryblok } from "@storyblok/types";

export const storyblokStoryBaseSchema = z.object({
  name: z.string(),
  created_at: z.string().datetime(),
  published_at: z.string().datetime().nullable(),
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
  first_published_at: z.string().datetime().nullable(),
  release_id: z.any(),
  lang: z.string(),
  path: z.any(),
  alternates: z.array(z.any()),
  default_full_slug: z.any(),
  translated_slugs: z.any(),
});

export type StoryblokStory<T> = Omit<
  z.infer<typeof storyblokStoryBaseSchema>,
  "content"
> & {
  content: T;
};

export const getStoryResponseSchema = z.object({
  data: z.object({
    story: storyblokStoryBaseSchema,
    cv: z.number(),
    rels: z.array(z.any()),
    links: z.array(z.any()),
  }),
  headers: z.record(z.string()),
});

export const getStoriesResponseSchema = z.object({
  data: z.object({
    stories: z.array(storyblokStoryBaseSchema),
    cv: z.number(),
    rels: z.array(z.any()),
    links: z.array(z.any()),
  }),
  headers: z.record(z.string()),
  perPage: z.number(),
  total: z.number(),
});

export async function getStory<T>({
  slug,
  options,
}: {
  slug: string;
  options?: ISbStoriesParams;
}) {
  const storyblok = useStoryblokApi();

  const response = await storyblok.getStory(`${slug}`, {
    version: import.meta.env.CONTENT_VERSION
      ? import.meta.env.CONTENT_VERSION
      : "published",
    ...options,
  });

  const parsedResponse = getStoryResponseSchema.parse(response);

  return {
    ...parsedResponse.data.story,
    content: parsedResponse.data.story.content as T,
  };
}

export async function getStories<T>({
  contentType,
  page,
  per_page,
  options,
}: {
  contentType?: string;
  page?: number;
  per_page?: number;
  options?: ISbStoriesParams;
}) {
  const storyblok = useStoryblokApi();

  const response = await storyblok.getStories({
    version: import.meta.env.CONTENT_VERSION
      ? import.meta.env.CONTENT_VERSION
      : "published",
    page: page ?? 1,
    per_page: per_page ?? 100,
    ...(contentType ? { content_type: contentType } : {}),
    ...options,
  });

  const parsedResponse = getStoriesResponseSchema.parse(response);

  return parsedResponse.data.stories as StoryblokStory<T>[];
}

export type ParseLinkInput =
  | MultilinkStoryblok
  | Exclude<
      MultilinkStoryblok,
      { linktype?: "email" } | { linktype?: "asset" }
    >;

// Overload signatures for parseLink
export function parseLink(link: ParseLinkInput, part: "href"): string;
export function parseLink(link: ParseLinkInput, part: "target"): string;
export function parseLink(link: ParseLinkInput): {
  href: string;
  target: string;
};

// Implementation for parseLink
export function parseLink(
  link: ParseLinkInput,
  part?: "href" | "target",
): { href: string; target: string } | string {
  let calculatedHref: string;
  let calculatedTarget: "_blank" | "_self" = link.target ?? "_self";

  switch (link.linktype) {
    case "story":
      if (link.story && typeof link.story.full_slug === "string") {
        let rawSlug = link.story.full_slug;
        if (rawSlug === "") {
          rawSlug = "/";
        }

        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(rawSlug)) {
          calculatedHref = rawSlug;
          if (link.anchor) {
            try {
              const urlObj = new URL(calculatedHref);
              urlObj.hash = link.anchor;
              calculatedHref = urlObj.toString();
            } catch (e) {
              console.warn(
                `Could not parse URL "${rawSlug}" to append anchor. Appending manually. Error: ${e instanceof Error ? e.message : String(e)}`,
              );
              calculatedHref += `#${link.anchor}`;
            }
          }
        } else {
          calculatedHref = rawSlug.startsWith("/") ? rawSlug : `/${rawSlug}`;
          if (link.anchor) {
            calculatedHref += `#${link.anchor}`;
          }
          calculatedHref = calculatedHref.replace(/\/{2,}/g, "/");
        }
      } else {
        console.warn(
          `Invalid story link: 'story' object or 'story.full_slug' is missing or not a string for link ID ${link.id}. Received story: ${JSON.stringify(link.story)}. Defaulting to '#'.`,
        );
        calculatedHref = "#";
      }
      break;

    case "url":
    case "asset":
      calculatedHref = link.url;
      if (calculatedHref === "") {
        calculatedHref = "#";
      }
      break;

    case "email": {
      const emailAddress = link.email ?? link.url;
      if (!emailAddress) {
        throw new Error(
          `Email address is missing or empty in email link object (ID: ${link.id}). Provided email: '${link.email}', Provided URL: '${link.url}'`,
        );
      }
      calculatedHref = `mailto:${emailAddress}`;
      calculatedTarget = "_blank";
      break;
    }
    default: {
      const unknownLinkProperties = link as {
        linktype?: string;
        id?: string;
        [key: string]: unknown;
      };
      console.warn(
        `Unknown linktype encountered: '${unknownLinkProperties.linktype ?? "unknown"}' for link ID ${unknownLinkProperties.id ?? "unknown"}. Full link object:`,
        link,
      );
      throw new Error(
        `Invalid link object: Unhandled linktype '${unknownLinkProperties.linktype ?? "unknown"}' for link ID ${unknownLinkProperties.id ?? "unknown"}`,
      );
    }
  }

  // Ensure calculatedHref has been assigned a value
  // This check is mainly for type safety if the switch statement had a logical flaw
  // (though in this structure, it should always be assigned or throw)
  if (typeof calculatedHref === "undefined") {
    console.error(
      "parseLink internal error: calculatedHref was not assigned.",
      link,
    );
    throw new Error(
      "Internal error in parseLink: href could not be determined.",
    );
  }

  if (part) {
    if (part === "href") return calculatedHref;
    if (part === "target") return calculatedTarget;
    // Should not be reached due to TypeScript's type checking for 'part'
    const exhaustiveCheck: never = part;
    throw new Error(
      `Invalid part "${exhaustiveCheck}" requested from parseLink.`,
    );
  }

  return { href: calculatedHref, target: calculatedTarget };
}

// Overload signatures for parseAsset
export function parseAsset(asset: AssetStoryblok, part: "src"): string;
export function parseAsset(asset: AssetStoryblok, part: "alt"): string | null;
export function parseAsset(asset: AssetStoryblok): {
  src: string;
  alt: string | null;
};

// Implementation for parseAsset
export function parseAsset(
  asset: AssetStoryblok,
  part?: "src" | "alt",
): { src: string; alt: string | null } | string | null {
  if (!asset) {
    // This case should ideally be caught by TypeScript if the input type allows null/undefined.
    // AssetStoryblok type itself implies it's an object. Adding a guard for unexpected falsy input.
    if (part === "src")
      throw new Error("Asset is null or undefined. Cannot determine 'src'.");
    if (part === "alt") return null; // Or throw consistently
    throw new Error("Asset is null or undefined.");
  }

  const resolvedSrc = asset.filename ?? asset.src;

  if (!resolvedSrc) {
    // If src cannot be determined, the asset data is considered fundamentally incomplete.
    // Throw an error regardless of which part is requested, or if the whole object is.
    throw new Error(
      "Asset object is invalid: 'filename' and 'src' are both missing, cannot determine src.",
    );
  }

  // If execution reaches here, resolvedSrc is a valid string.
  if (part) {
    if (part === "src") {
      return resolvedSrc;
    }
    if (part === "alt") {
      return asset.alt;
    }
    // This path should ideally not be reachable if `part`'s type is correct.
    const exhaustiveCheck: never = part;
    throw new Error(
      `Invalid part "${exhaustiveCheck}" requested from parseAsset.`,
    );
  }

  return {
    src: resolvedSrc,
    alt: asset.alt,
  };
}
