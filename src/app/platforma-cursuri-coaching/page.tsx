import type { Metadata } from "next";
import PlatformaCursuriCoaching from "@/views/PlatformaCursuriCoaching";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Coaches | DoCourse",
  description: "Platforma perfectă pentru coaches. Vinde programe online, organizează comunități și automatizează înrolările. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-coaching" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Coaches | DoCourse",
    description: "Creează programe de coaching online și vinde-le simplu.",
    url: "https://docourse.ro/platforma-cursuri-coaching",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Cursuri Online pentru Coaches | DoCourse",
    description: "Creează programe de coaching online și vinde-le simplu.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Platformă Cursuri Online pentru Coaches | DoCourse",
  "description": "Platforma perfectă pentru coaches. Vinde programe online, organizează comunități și automatizează înrolările.",
  "url": "https://docourse.ro/platforma-cursuri-coaching",
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
      "name": "Este potrivită pentru coachi și terapeuți?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Poți crea cursuri structurate și oferi suport prin comunitate."
      }
    },
    {
      "@type": "Question",
      "name": "Pot livra programe de grup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Comunitatea ajută la întrebări și suport între sesiuni."
      }
    },
    {
      "@type": "Question",
      "name": "Cursanții au nevoie de cont?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nu obligatoriu. Poți permite acces prin link."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PlatformaCursuriCoaching />
    </>
  );
}
