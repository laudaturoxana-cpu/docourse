export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PublicCoursePage from "@/views/PublicCoursePage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("courses")
      .select("title, description, image_url")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return { title: "Curs Online | DoCourse" };

    const title = data.title || "Curs Online";
    const description = data.description || `Înscrie-te la ${title} pe DoCourse.ro`;

    return {
      title: `${title} | DoCourse`,
      description,
      alternates: { canonical: `https://docourse.ro/c/${slug}` },
      openGraph: {
        title,
        description,
        url: `https://docourse.ro/c/${slug}`,
        type: "website",
        ...(data.image_url && {
          images: [{ url: data.image_url, width: 1200, height: 630 }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(data.image_url && { images: [data.image_url] }),
      },
    };
  } catch {
    return { title: "Curs Online | DoCourse" };
  }
}

export default function Page() { return <PublicCoursePage />; }
