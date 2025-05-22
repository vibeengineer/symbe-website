import type { MultilinkStoryblok } from "@storyblok/types";

type LinkTarget = "_blank" | "_self";
export type ParsedLink = {
  href: string;
  target: LinkTarget;
};
export type LinkPart = "href" | "target";

export type ParseLinkInput =
  | MultilinkStoryblok
  | Exclude<
      MultilinkStoryblok,
      { linktype?: "email" } | { linktype?: "asset" }
    >;

/**
 * Returns `true` if `url` starts with a URI scheme (e.g. "http://", "mailto:").
 */
const isAbsoluteUrl = (url: string): boolean =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(url);

/**
 * Ensures the path starts with exactly one leading slash and collapses any
 * duplicate slashes (`//` → `/`).
 */
const normalizePath = (path: string): string => `/${path}`.replace(/\/+/g, "/");

/**
 * Removes any existing `#fragment` and appends the provided `anchor`.
 */
const appendAnchor = (url: string, anchor?: string): string =>
  anchor ? `${url.replace(/#.*/, "")}#${anchor}` : url;

const assertNever = (v: never): never => {
  throw new Error("Unhandled linktype in Storyblok link object");
};

/**
 * Parses a Storyblok link object. Note for this to work you must utilise resolve_links when fetching the story.
 * @param link - The link object to parse.
 * @param part - The part of the link to return.
 * @returns The parsed link.
 */
export function parseLink<Part extends LinkPart | undefined = undefined>(
  link: ParseLinkInput,
  part?: Part,
): Part extends "href"
  ? string
  : Part extends "target"
    ? LinkTarget
    : ParsedLink {
  const targetDefault: LinkTarget = link.target ?? "_self";
  let href: string;
  let target: LinkTarget = targetDefault;

  switch (link.linktype) {
    case "url":
      href = link.url || "#";
      target = "_blank";
      break;

    case "asset":
      href = link.url || "#";
      break;

    case "email": {
      const email = link.email ?? link.url;
      if (!email) throw new Error(`Email link ${link.id} missing address`);
      href = `mailto:${email}`;
      target = "_blank";
      break;
    }

    case "story": {
      const slug = link.story?.full_slug ?? link.cached_url ?? "";
      if (!slug) {
        href = "#";
        break;
      }
      const base = isAbsoluteUrl(slug) ? slug : normalizePath(slug);
      href = appendAnchor(base, link.anchor);
      break;
    }

    default:
      return assertNever(link as never);
  }

  const result = { href, target } as const;
  return (part ? result[part] : result) as unknown as Part extends "href"
    ? string
    : Part extends "target"
      ? LinkTarget
      : ParsedLink;
}
