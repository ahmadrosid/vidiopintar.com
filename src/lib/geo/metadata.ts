import type { Metadata } from "next";
import {
  absoluteUrl,
  markdownUrlFor,
  OG_IMAGE,
  SITE_LAST_MODIFIED,
  SITE_NAME,
  SITE_URL,
  truncateDescription,
} from "@/lib/geo/site";

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  image = OG_IMAGE,
  publishedTime,
  modifiedTime,
  keywords,
  noIndex,
}: BuildPageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const desc = truncateDescription(description);
  const modified = modifiedTime || SITE_LAST_MODIFIED.toISOString();
  const mdUrl = markdownUrlFor(path);

  return {
    title,
    description: desc,
    keywords,
    alternates: {
      canonical: path === "/" ? SITE_URL : url,
      types: {
        "text/markdown": mdUrl,
      },
    },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime: modified,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
    },
    other: {
      "article:modified_time": modified,
      "og:updated_time": modified,
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}
