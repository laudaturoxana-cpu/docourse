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
  twitter: {
    card: "summary_large_image",
    title: "Alternativă Teachable România | DoCourse",
    description: "Alternativă la Teachable fără comisioane — platformă românească.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Alternativă Teachable în România | DoCourse",
  "description": "Alternativă românească la Teachable fără comisioane pe vânzări.",
  "url": "https://docourse.ro/alternativa-teachable-romania",
  "inLanguage": "ro",
  "about": {
    "@type": "SoftwareApplication",
    "name": "DoCourse",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "9",
      "priceCurrency": "EUR"
    }
  }
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "De ce să aleg DoCourse în loc de Teachable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DoCourse e în română, are setup simplu și e gândit pentru piața locală."
      }
    },
    {
      "@type": "Question",
      "name": "Pot migra cursurile existente?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Poți urca lecțiile și resursele direct și trimiți linkul nou cursanților."
      }
    },
    {
      "@type": "Question",
      "name": "Am nevoie de integrare complexă?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nu. Cursul poate fi livrat prin link, fără setări tehnice avansate."
      }
    },
    {
      "@type": "Question",
      "name": "Pot păstra comunitatea?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Comunitatea e inclusă și se activează simplu, lângă curs."
      }
    },
    {
      "@type": "Question",
      "name": "Am nevoie de echipă tehnică?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nu. Poți publica singur cursul și îl livrezi prin link."
      }
    },
    {
      "@type": "Question",
      "name": "Pot începe cu un curs gratuit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. E o metodă bună pentru validare și primele înscrieri."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <AlternativaTeachableRomania />
    </>
  );
}
