import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://promopiza.online";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/ofertas`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/links`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
