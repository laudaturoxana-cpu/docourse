import type { Metadata } from "next";
import AlternativaTeachableRomania from "@/views/AlternativaTeachableRomania";

export const metadata: Metadata = {
  title: "Alternativă Teachable în România | DoCourse",
  description: "Alternativă românească la Teachable fără comisioane pe vânzări. Platformă de cursuri cu suport în română și prețuri în euro.",
  alternates: { canonical: "https://docourse.ro/alternativa-teachable-romania" },
  openGraph: {
    title: "Alternativă Teachable România | DoCourse",
    description: "Alternativă la Teachable fără comisioane — platformă românească.",
    url: "https://docourse.ro/alternativa-teachable-romania",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Alternativă Teachable în România | DoCourse",
  description: "Alternativă românească la Teachable fără comisioane pe vânzări.",
  url: "https://docourse.ro/alternativa-teachable-romania",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <AlternativaTeachableRomania />
    </>
  );
}
