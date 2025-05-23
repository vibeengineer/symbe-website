import type { AssetStoryblok } from "@storyblok/types";

export type AssetPart = "src" | "alt";
export type ParsedAsset = {
  src: string;
  alt: string | null;
};

const coalesce = <T>(...values: (T | undefined | null)[]): T | undefined =>
  values.find((v) => v != null);

export function parseAsset<Part extends AssetPart | undefined = undefined>(
  asset: AssetStoryblok,
  part?: Part,
): Part extends "src"
  ? string
  : Part extends "alt"
    ? string | null
    : ParsedAsset {
  if (!asset) throw new Error("Asset object is null or undefined");

  const src = coalesce(asset.filename, asset.src);
  if (!src) throw new Error("Asset missing both 'filename' and 'src'");

  const alt = asset.alt ?? null;
  const result = { src, alt } as const;

  return (part ? result[part] : result) as unknown as Part extends "src"
    ? string
    : Part extends "alt"
      ? string | null
      : ParsedAsset;
}
