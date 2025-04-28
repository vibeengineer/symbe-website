import { useStoryblokApi } from "@storyblok/astro";
import type { SeoDefaultsStoryblok } from "../../../storyblok/types";
import type { SEOProps } from "astro-seo";

export async function getSeoDefaults(): Promise<SEOProps> {
  const sbApi = useStoryblokApi();
  let story: SeoDefaultsStoryblok | null = null;
  const seoDefaults: SEOProps = {};

  try {
    const { data } = await sbApi.get("cdn/stories/globals/seo-defaults", {
      version: import.meta.env.MODE === "development" ? "draft" : "published",
    });

    story = data?.story?.content as SeoDefaultsStoryblok;

    console.log({ story });
    if (!story) {
      throw new Error("No seo defaults found in storyblok");
    }

    if (story.title) {
      seoDefaults.title = story.title;
    }
    if (story.description) {
      seoDefaults.description = story.description;
    }
    if (story.noIndex) {
      seoDefaults.noindex = story.noIndex;
    }

    // Open Graph
    seoDefaults.openGraph = { basic: { title: "", type: "", image: "" } };
    const ogMeta = [];
    let hasOgData = false;

    if (story.openGraphTitle) {
      seoDefaults.openGraph.basic.title = story.openGraphTitle;
      hasOgData = true;
    }
    if (story.openGraphImage?.filename) {
      seoDefaults.openGraph.basic.image = story.openGraphImage.filename;
      hasOgData = true;
    }
    if (story.openGraphDescription) {
      ogMeta.push({
        property: "og:description",
        content: story.openGraphDescription,
      });
    }

    if (hasOgData) {
      seoDefaults.openGraph.basic.type = "website";
    } else {
      seoDefaults.openGraph = undefined;
    }

    // Extend meta tags if needed
    if (ogMeta.length > 0) {
      seoDefaults.extend = {
        ...(seoDefaults.extend || {}),
        meta: [...(seoDefaults.extend?.meta || []), ...ogMeta],
      };
    }

    // Twitter
    if (story.twitterHandle) {
      seoDefaults.twitter = {
        creator: story.twitterHandle.startsWith("@")
          ? story.twitterHandle
          : `@${story.twitterHandle}`,
      };
    }
  } catch (error) {
    console.error("Error fetching SEO defaults from Storyblok:", error);
    // Return empty defaults on error
  }

  return seoDefaults;
}
