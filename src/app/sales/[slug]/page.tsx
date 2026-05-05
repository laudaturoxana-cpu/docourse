export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PublicSalesPage from "@/views/PublicSalesPage";

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
      .from("sales_pages")
      .select("headline, subheadline, course_image_url, courses(title)")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return { title: "Curs Online | DoCourse" };

    const courseTitle = (data.courses as unknown as { title: string } | null)?.title ?? "";
    const title = data.headline || courseTitle || "Curs Online";
    const description = data.subheadline || `Înscrie-te la ${title} pe DoCourse.ro`;

    return {
      title: `${title} | DoCourse`,
      description,
      alternates: { canonical: `https://docourse.ro/sales/${slug}` },
      openGraph: {
        title,
        description,
        url: `https://docourse.ro/sales/${slug}`,
        type: "website",
        ...(data.course_image_url && {
          images: [{ url: data.course_image_url, width: 1200, height: 630 }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(data.course_image_url && { images: [data.course_image_url] }),
      },
    };
  } catch {
    return { title: "Curs Online | DoCourse" };
  }
}

export default function Page() {
  return <PublicSalesPage />;
}
