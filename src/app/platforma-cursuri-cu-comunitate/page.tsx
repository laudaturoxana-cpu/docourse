import type { Metadata } from "next";
import PlatformaCursuriComunitate from "@/views/PlatformaCursuriComunitate";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online cu Comunitate Privată | DoCourse",
  description: "Cursuri online cu comunitate privată inclusă. Studenți mai angajați, retenție mai mare, venituri recurente. DoCourse — cursuri plus comunitate.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-cu-comunitate" },
  openGraph: {
    title: "Platformă Cursuri cu Comunitate Privată | DoCourse",
    description: "Cursuri online cu comunitate — studenți mai angajați, venituri mai mari.",
    url: "https://docourse.ro/platforma-cursuri-cu-comunitate",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Cursuri cu Comunitate Privată | DoCourse",
    description: "Cursuri online cu comunitate — studenți mai angajați, venituri mai mari.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Platformă Cursuri Online cu Comunitate Privată | DoCourse",
  "description": "Cursuri online cu comunitate privată inclusă. Studenți mai angajați, retenție mai mare, venituri recurente.",
  "url": "https://docourse.ro/platforma-cursuri-cu-comunitate",
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
      "name": "Comunitatea e obligatorie?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nu. O activezi doar dacă vrei suport și discuții între cursanți."
      }
    },
    {
      "@type": "Question",
      "name": "Pot avea acces fără cont?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Cursanții pot accesa comunitatea prin link, fără cont, dacă alegi."
      }
    },
    {
      "@type": "Question",
      "name": "Ce tip de curs beneficiază cel mai mult?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cursurile avansate, programele de grup și training-urile cu suport continuu."
      }
    },
    {
      "@type": "Question",
      "name": "Pot folosi în paralel un grup Facebook?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Poți, dar comunitatea DoCourse păstrează totul lângă curs și oferă context."
      }
    },
    {
      "@type": "Question",
      "name": "Comunitatea ajută la finalizarea cursului?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Întrebările și răspunsurile cresc claritatea și motivația cursanților."
      }
    },
    {
      "@type": "Question",
      "name": "Se poate dezactiva ulterior?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Comunitatea este opțională și poate fi oprită oricând."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PlatformaCursuriComunitate />
    </>
  );
}
