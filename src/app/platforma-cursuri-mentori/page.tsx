import type { Metadata } from "next";
import PlatformaCursuriMentori from "@/views/PlatformaCursuriMentori";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Mentori | DoCourse",
  description: "Platforma ideală pentru mentori care vor să monetizeze expertiza. Vinde cursuri, creează comunități private și gestionează mentoratul online. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-mentori" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Mentori | DoCourse",
    description: "Monetizează-ți expertiza ca mentor cu DoCourse.",
    url: "https://docourse.ro/platforma-cursuri-mentori",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Cursuri Online pentru Mentori | DoCourse",
    description: "Monetizează-ți expertiza ca mentor cu DoCourse.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Platformă Cursuri Online pentru Mentori | DoCourse",
  "description": "Platforma ideală pentru mentori care vor să monetizeze expertiza.",
  "url": "https://docourse.ro/platforma-cursuri-mentori",
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
      "name": "Este potrivită pentru mentori?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Poți livra programe clare și oferi suport prin comunitate."
      }
    },
    {
      "@type": "Question",
      "name": "Pot crea programe de grup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Comunitatea ajută la întrebări și feedback continuu."
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
      <PlatformaCursuriMentori />
    </>
  );
}
