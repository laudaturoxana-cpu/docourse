import type { Metadata } from "next";
import PlatformaCursuriWhiteLabel from "@/views/PlatformaCursuriWhiteLabel";

export const metadata: Metadata = {
  title: "Platformă Cursuri White Label România | DoCourse",
  description: "Platformă de cursuri white label pentru România. Brandul tău, domeniul tău, clienții tăi. DoCourse în culise, tu în față.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-white-label-romania" },
  openGraph: {
    title: "Platformă Cursuri White Label România | DoCourse",
    description: "Soluție white label pentru cursuri online — brandul tău complet.",
    url: "https://docourse.ro/platforma-cursuri-white-label-romania",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Cursuri White Label România | DoCourse",
    description: "Soluție white label pentru cursuri online — brandul tău complet.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Platformă Cursuri White Label România | DoCourse",
  "description": "Platformă de cursuri white label pentru România. Brandul tău, domeniul tău, clienții tăi.",
  "url": "https://docourse.ro/platforma-cursuri-white-label-romania",
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
      "name": "Ce înseamnă white label?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Platforma apare sub brandul tău, cu identitatea ta vizuală."
      }
    },
    {
      "@type": "Question",
      "name": "Pot folosi domeniul meu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Platforma poate rula pe domeniul tău."
      }
    },
    {
      "@type": "Question",
      "name": "Este complicat de setat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nu. Totul este gândit simplu, fără integrări grele."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PlatformaCursuriWhiteLabel />
    </>
  );
}
