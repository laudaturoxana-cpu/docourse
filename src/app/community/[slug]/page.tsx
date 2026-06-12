export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CreatorCommunityPage from "@/views/CreatorCommunityPage";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const manifest = `/community/${slug}/manifest.json`;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("creator_communities")
      .select("name, description, cover_image_url")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return { title: "Comunitate | DoCourse", manifest };

    const title = data.name || "Comunitate";
    const description = data.description || `Alătură-te comunității ${title} pe DoCourse.ro`;

    return {
      title: `${title} | DoCourse`,
      description,
      manifest,
      alternates: { canonical: `https://docourse.ro/community/${slug}` },
      openGraph: {
        title,
        description,
        url: `https://docourse.ro/community/${slug}`,
        type: "website",
        ...(data.cover_image_url && {
          images: [{ url: data.cover_image_url, width: 1200, height: 630 }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(data.cover_image_url && { images: [data.cover_image_url] }),
      },
    };
  } catch {
    return { title: "Comunitate | DoCourse", manifest };
  }
}

export default function Page() { return <CreatorCommunityPage />; }
