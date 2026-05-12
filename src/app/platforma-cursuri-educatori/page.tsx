import type { Metadata } from "next";
import PlatformaCursuriEducatori from "@/views/PlatformaCursuriEducatori";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Educatori | DoCourse",
  description: "Platforma DoCourse pentru educatori și profesori. Creează cursuri educaționale, gestionează studenți și monetizează cunoștințele tale.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-educatori" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Educatori | DoCourse",
    description: "Educatori: creați cursuri online profesionale cu DoCourse.",
    url: "https://docourse.ro/platforma-cursuri-educatori",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Cursuri Online pentru Educatori | DoCourse",
    description: "Educatori: creați cursuri online profesionale cu DoCourse.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Platformă Cursuri Online pentru Educatori | DoCourse",
  "description": "Platforma DoCourse pentru educatori și profesori. Creează cursuri educaționale și monetizează cunoștințele tale.",
  "url": "https://docourse.ro/platforma-cursuri-educatori",
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
      "name": "Este potrivită pentru educatori?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. DoCourse oferă structură clară și livrare rapidă."
      }
    },
    {
      "@type": "Question",
      "name": "Pot oferi materiale PDF?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Poți atașa resurse la fiecare lecție."
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
      <PlatformaCursuriEducatori />
    </>
  );
}
