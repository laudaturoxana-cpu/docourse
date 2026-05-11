import type { Metadata } from "next";
import Blog from "@/views/Blog";

export const metadata: Metadata = {
  title: "Blog — Cursuri Online & Marketing Digital | DoCourse",
  description: "Articole practice pentru creatorii de cursuri online din România. Strategii de marketing, ghiduri de creare cursuri și povești de succes.",
  alternates: { canonical: "https://docourse.ro/blog" },
  openGraph: {
    title: "Blog DoCourse — Cursuri Online & Marketing",
    description: "Articole practice pentru creatorii de cursuri online din România.",
    url: "https://docourse.ro/blog",
  },
};

const blogLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog DoCourse",
  description: "Ghiduri și articole pentru creatori de cursuri online",
  url: "https://docourse.ro/blog",
  publisher: {
    "@type": "Organization",
    name: "DoCourse",
    url: "https://docourse.ro",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <Blog />
    </>
  );
}
