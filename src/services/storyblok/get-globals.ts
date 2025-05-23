import type {
  FooterStoryblok,
  NavigationStoryblok,
  SeoDefaultsStoryblok,
} from "@storyblok/types";
import { getStory } from "./get-story";

const NAV_SLUG = "globals/navigation";
const FOOTER_SLUG = "globals/footer";
const SEO_SLUG = "globals/seo-defaults";

const DEFAULT_VERSION = import.meta.env.CONTENT_VERSION ?? "published";

export const getNavigation = async (version: typeof DEFAULT_VERSION) => {
  const { content } = await getStory<NavigationStoryblok>({
    slug: NAV_SLUG,
    version,
  });
  return content;
};

export const getFooter = async (version: typeof DEFAULT_VERSION) => {
  const { content } = await getStory<FooterStoryblok>({
    slug: FOOTER_SLUG,
    version,
  });
  return content;
};

export async function getSeoDefaults(version: typeof DEFAULT_VERSION) {
  const { content } = await getStory<SeoDefaultsStoryblok>({
    slug: SEO_SLUG,
    version,
  });

  return {
    title: content.title,
    description: content.description,
    noIndex: content.noIndex,
    ...(content.openGraphImage && { openGraphImage: content.openGraphImage }),
    ...(content.twitterHandle && { twitter: content.twitterHandle }),
    ...(content.openGraphTitle && { openGraphTitle: content.openGraphTitle }),
  } as const;
}

export async function getGlobals(version?: typeof DEFAULT_VERSION) {
  const versionToUse = version ?? DEFAULT_VERSION;
  const [navigationData, footerData, seoDefaults] = await Promise.all([
    getNavigation(versionToUse),
    getFooter(versionToUse),
    getSeoDefaults(versionToUse),
  ]);

  return { navigationData, footerData, seoDefaults } as const;
}
