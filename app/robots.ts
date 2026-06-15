import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/", "/api/", "/metrics"],
    },
    sitemap: "https://promopiza.online/sitemap.xml",
    host: "https://promopiza.online",
  };
}
