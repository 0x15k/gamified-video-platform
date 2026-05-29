import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/platform/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalog", "/watch/", "/tag/"],
        disallow: ["/admin", "/api/", "/dashboard", "/settings", "/player"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
