import type {
  FooterStoryblok,
  NavigationStoryblok,
  SeoDefaultsStoryblok,
} from "@storyblok/types";
import { getStory } from "./helpers";

export async function getNavigation(version: "draft" | "published") {
  const { content } = await getStory<NavigationStoryblok>({
    slug: "globals/navigation",
    version,
  });
  return content;
}

export async function getFooter(version: "draft" | "published") {
  const { content } = await getStory<FooterStoryblok>({
    slug: "globals/footer",
    version,
  });

  return content;
}

export async function getSeoDefaults(version: "draft" | "published") {
  const { content } = await getStory<SeoDefaultsStoryblok>({
    slug: "globals/seo-defaults",
    version,
  });

  return {
    title: content.title,
    description: content.description,
    noIndex: content.noIndex,
    ...(content.openGraphImage && {
      openGraphImage: content.openGraphImage,
    }),
    ...(content.twitterHandle && { twitter: content.twitterHandle }),
    ...(content.openGraphTitle && { openGraphTitle: content.openGraphTitle }),
  };
}

export async function getGlobals(version: "draft" | "published") {
  const [navigationData, footerData, seoDefaults] = await Promise.all([
    getNavigation(version),
    getFooter(version),
    getSeoDefaults(version),
  ]);

  return {
    navigationData,
    footerData,
    seoDefaults,
  };
}
