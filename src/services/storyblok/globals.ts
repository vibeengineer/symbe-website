import type {
  FooterStoryblok,
  NavigationStoryblok,
  SeoDefaultsStoryblok,
} from "../../../storyblok/types";
import { getStory } from "./helpers";

export async function getNavigation() {
  const { content } = await getStory<NavigationStoryblok>({
    slug: "globals/navigation",
  });
  return content;
}

export async function getFooter() {
  const { content } = await getStory<FooterStoryblok>({
    slug: "globals/footer",
  });

  return content;
}

export async function getSeoDefaults() {
  const { content } = await getStory<SeoDefaultsStoryblok>({
    slug: "globals/seo-defaults",
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

export async function getGlobals() {
  const [navigationData, footerData, seoDefaults] = await Promise.all([
    getNavigation(),
    getFooter(),
    getSeoDefaults(),
  ]);

  return {
    navigationData,
    footerData,
    seoDefaults,
  };
}
