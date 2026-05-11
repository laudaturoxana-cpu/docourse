import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://docourse.ro";

const NOW = new Date();
const BLOG_DATE = new Date("2025-02-23");

// Blog posts hardcodate în cod (nu în DB) — incluse explicit
const STATIC_BLOG_POSTS: MetadataRoute.Sitemap = [
  { url: `${BASE}/blog/cum-sa-creezi-si-sa-vinzi-curs-online-ghid-complet`, lastModified: BLOG_DATE, changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/blog/platforma-simpla-cursuri-online`, lastModified: BLOG_DATE, changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/blog/alternativa-teachable-romania`, lastModified: BLOG_DATE, changeFrequency: "monthly", priority: 0.7 },
];

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: NOW, priority: 1.0, changeFrequency: "weekly" },
  { url: `${BASE}/platforma-cursuri-online`, lastModified: NOW, priority: 0.9, changeFrequency: "monthly" },
  { url: `${BASE}/pricing`, lastModified: NOW, priority: 0.9, changeFrequency: "weekly" },
  { url: `${BASE}/platforma-cursuri-mentori`, lastModified: NOW, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-coaching`, lastModified: NOW, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-educatori`, lastModified: NOW, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-psihologi`, lastModified: NOW, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-traineri`, lastModified: NOW, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-domeniu-propriu`, lastModified: NOW, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-white-label-romania`, lastModified: NOW, priority: 0.8, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-simpla-cursuri-online`, lastModified: NOW, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-cu-comunitate`, lastModified: NOW, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/platforma-cursuri-online-ieftina`, lastModified: NOW, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/hosting-cursuri-online-romania`, lastModified: NOW, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/alternativa-kajabi-ieftina`, lastModified: NOW, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/alternativa-teachable-romania`, lastModified: NOW, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/cum-sa-creezi-un-curs-online`, lastModified: NOW, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/blog`, lastModified: NOW, priority: 0.8, changeFrequency: "weekly" },
  { url: `${BASE}/contact`, lastModified: NOW, priority: 0.5, changeFrequency: "yearly" },
  { url: `${BASE}/resurse`, lastModified: NOW, priority: 0.5, changeFrequency: "monthly" },
  { url: `${BASE}/termeni-si-conditii`, lastModified: NOW, priority: 0.2, changeFrequency: "yearly" },
  { url: `${BASE}/politica-de-confidentialitate`, lastModified: NOW, priority: 0.2, changeFrequency: "yearly" },
  { url: `${BASE}/politica-cookies`, lastModified: NOW, priority: 0.2, changeFrequency: "yearly" },
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

    // Blog posts din DB (excluzând slugurile deja în STATIC_BLOG_POSTS)
    const staticSlugs = new Set(STATIC_BLOG_POSTS.map((r) => r.url.split("/blog/")[1]));
    const dbBlogRoutes: MetadataRoute.Sitemap = (posts || [])
      .filter((p) => !staticSlugs.has(p.slug))
      .map((p) => ({
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

    return [...staticRoutes, ...STATIC_BLOG_POSTS, ...dbBlogRoutes, ...courseRoutes];
  } catch {
    return [...staticRoutes, ...STATIC_BLOG_POSTS];
  }
}
