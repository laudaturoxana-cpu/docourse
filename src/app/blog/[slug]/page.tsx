export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import BlogPost from "@/views/BlogPost";

const blogMeta: Record<string, { title: string; description: string; image: string }> = {
  "cum-sa-creezi-si-sa-vinzi-curs-online-ghid-complet": {
    title: "Cum să creezi și să vinzi un curs online în 2025 – Ghid complet pas cu pas",
    description: "Ghid complet pentru a crea și vinde cursuri online în România. Află cum să alegi tema, să structurezi conținutul, să stabilești prețul și să lansezi cu succes.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop",
  },
  "platforma-simpla-cursuri-online": {
    title: "Platformă simplă pentru cursuri online – Ghid complet pentru începători",
    description: "Caută o platformă simplă pentru cursuri online? Află cum să publici primul curs fără bătăi de cap, în câteva ore, chiar dacă nu te pricepi la tehnologie.",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop",
  },
  "alternativa-teachable-romania": {
    title: "Alternativa Teachable pentru România – Comparație completă 2025",
    description: "Compară Teachable cu alternativele locale din România. Află care platformă e mai potrivită pentru creatorii de cursuri online români în 2025.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630&fit=crop",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = blogMeta[slug];
  if (!meta) return { title: "Blog | DoCourse" };

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://docourse.ro/blog/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://docourse.ro/blog/${slug}`,
      type: "article",
      images: [{ url: meta.image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.image],
    },
  };
}

export default function Page() {
  return <BlogPost />;
}
