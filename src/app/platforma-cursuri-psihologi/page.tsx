import type { Metadata } from "next";
import PlatformaCursuriPsihologi from "@/views/PlatformaCursuriPsihologi";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Psihologi | DoCourse",
  description: "Psihologi: transformați expertiza în cursuri online. Platformă profesională pentru cursuri de psihologie, workshopuri și programe terapeutice.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-psihologi" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Psihologi | DoCourse",
    description: "Creează cursuri de psihologie online cu DoCourse.",
    url: "https://docourse.ro/platforma-cursuri-psihologi",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Cursuri Online pentru Psihologi | DoCourse",
    description: "Creează cursuri de psihologie online cu DoCourse.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Platformă Cursuri Online pentru Psihologi | DoCourse",
  "description": "Psihologi: transformați expertiza în cursuri online. Platformă profesională pentru cursuri de psihologie.",
  "url": "https://docourse.ro/platforma-cursuri-psihologi",
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
      "name": "Este potrivită pentru psihologi și terapeuți?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Poți crea cursuri structurate și oferi suport clar cursanților."
      }
    },
    {
      "@type": "Question",
      "name": "Pot livra programe de grup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Comunitatea ajută la întrebări între sesiuni."
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
      <PlatformaCursuriPsihologi />
    </>
  );
}
