import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://hamidreza-ahmadi.sbs";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/feed`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic posts — fetch from your API
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${base}/api/posts/feed?limit=100&page=1`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    postPages = (data.items ?? []).map((p: { id: string }) => ({
      url: `${base}/post/${p.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // fail silently — still ship static pages
  }

  return [...staticPages, ...postPages];
}
