import type { Metadata } from "next";
import BlogPost from "@/views/BlogPost";

export function generateStaticParams() {
  return [
    { slug: "cum-sa-creezi-si-sa-vinzi-curs-online-ghid-complet" },
    { slug: "platforma-simpla-cursuri-online" },
    { slug: "alternativa-teachable-romania" },
  ];
}

const blogMeta: Record<string, { title: string; description: string; image: string; isoDate: string }> = {
  "cum-sa-creezi-si-sa-vinzi-curs-online-ghid-complet": {
    title: "Cum să creezi și să vinzi un curs online în 2025 – Ghid complet pas cu pas",
    description: "Ghid complet pentru a crea și vinde cursuri online în România. Află cum să alegi tema, să structurezi conținutul, să stabilești prețul și să lansezi cu succes.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop",
    isoDate: "2025-02-23",
  },
  "platforma-simpla-cursuri-online": {
    title: "Platformă simplă pentru cursuri online – Ghid complet pentru începători",
    description: "Caută o platformă simplă pentru cursuri online? Află cum să publici primul curs fără bătăi de cap, în câteva ore, chiar dacă nu te pricepi la tehnologie.",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop",
    isoDate: "2025-02-22",
  },
  "alternativa-teachable-romania": {
    title: "Alternativa Teachable pentru România – Comparație completă 2025",
    description: "Compară Teachable cu alternativele locale din România. Află care platformă e mai potrivită pentru creatorii de cursuri online români în 2025.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630&fit=crop",
    isoDate: "2025-02-21",
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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = blogMeta[slug];

  const articleLd = meta
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: meta.title,
        description: meta.description,
        image: meta.image,
        datePublished: meta.isoDate,
        dateModified: meta.isoDate,
        author: { "@type": "Organization", name: "DoCourse" },
        publisher: { "@type": "Organization", name: "DoCourse", url: "https://docourse.ro" },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://docourse.ro/blog/${slug}` },
      }
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: "https://docourse.ro" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://docourse.ro/blog" },
      { "@type": "ListItem", position: 3, name: meta?.title ?? slug, item: `https://docourse.ro/blog/${slug}` },
    ],
  };

  return (
    <>
      {articleLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BlogPost slug={slug} />
    </>
  );
}
