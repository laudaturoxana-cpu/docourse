import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://docourse.ro";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE, priority: 1.0, changeFrequency: "weekly" },
  { url: `${BASE}/platforma-cursuri-online`, priority: 0.9, changeFrequency: "monthly" },
  { url: `${BASE}/pricing`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${BASE}/platforma-cursuri-mentori`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-coaching`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-educatori`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-psihologi`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-traineri`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-domeniu-propriu`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-white-label-romania`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-simpla-cursuri-online`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-cu-comunitate`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-online-ieftina`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/hosting-cursuri-online-romania`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/alternativa-kajabi-ieftina`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/alternativa-teachable-romania`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/cum-sa-creezi-un-curs-online`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/blog`, priority: 0.8, changeFrequency: "weekly" },
  { url: `${BASE}/contact`, priority: 0.5, changeFrequency: "yearly" },
  { url: `${BASE}/resurse`, priority: 0.5, changeFrequency: "monthly" },
  { url: `${BASE}/termeni-si-conditii`, priority: 0.2, changeFrequency: "yearly" },
  { url: `${BASE}/politica-de-confidentialitate`, priority: 0.2, changeFrequency: "yearly" },
  { url: `${BASE}/politica-cookies`, priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [{ data: posts }, { data: salesPages }] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at").eq("is_published", true),
      supabase.from("courses").select("slug, updated_at").eq("is_published", true),
    ]);

    const blogRoutes: MetadataRoute.Sitemap = (posts || []).map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const courseRoutes: MetadataRoute.Sitemap = (salesPages || []).map((c) => ({
      url: `${BASE}/sales/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...blogRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
