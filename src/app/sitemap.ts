import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://docourse.ro";

const NOW = new Date("2025-02-23");
const YEAR_START = new Date("2025-01-01");

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: NOW, priority: 1.0, changeFrequency: "weekly" },
  { url: `${BASE}/platforma-cursuri-online`, lastModified: YEAR_START, priority: 0.9, changeFrequency: "monthly" },
  { url: `${BASE}/pricing`, lastModified: NOW, priority: 0.9, changeFrequency: "weekly" },
  { url: `${BASE}/platforma-cursuri-mentori`, lastModified: YEAR_START, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-coaching`, lastModified: YEAR_START, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-educatori`, lastModified: YEAR_START, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-psihologi`, lastModified: YEAR_START, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-traineri`, lastModified: YEAR_START, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-domeniu-propriu`, lastModified: YEAR_START, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-white-label-romania`, lastModified: YEAR_START, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-simpla-cursuri-online`, lastModified: YEAR_START, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-cu-comunitate`, lastModified: YEAR_START, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-online-ieftina`, lastModified: YEAR_START, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/hosting-cursuri-online-romania`, lastModified: YEAR_START, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/alternativa-kajabi-ieftina`, lastModified: YEAR_START, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/alternativa-teachable-romania`, lastModified: YEAR_START, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/cum-sa-creezi-un-curs-online`, lastModified: YEAR_START, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/blog`, lastModified: NOW, priority: 0.8, changeFrequency: "weekly" },
  { url: `${BASE}/contact`, lastModified: YEAR_START, priority: 0.5, changeFrequency: "yearly" },
  { url: `${BASE}/resurse`, lastModified: YEAR_START, priority: 0.5, changeFrequency: "monthly" },
  { url: `${BASE}/termeni-si-conditii`, lastModified: YEAR_START, priority: 0.2, changeFrequency: "yearly" },
  { url: `${BASE}/politica-de-confidentialitate`, lastModified: YEAR_START, priority: 0.2, changeFrequency: "yearly" },
  { url: `${BASE}/politica-cookies`, lastModified: YEAR_START, priority: 0.2, changeFrequency: "yearly" },
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
