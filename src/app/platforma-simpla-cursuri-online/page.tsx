import type { Metadata } from "next";
import PlatformaSimplaCursuriOnline from "@/views/PlatformaSimplaCursuriOnline";

export const metadata: Metadata = {
  title: "Cea Mai Simplă Platformă Cursuri Online | DoCourse",
  description: "Fără tehnic, fără complicații. Creezi contul, încarci cursul, primești banii. DoCourse — cea mai simplă platformă de cursuri online din România.",
  alternates: { canonical: "https://docourse.ro/platforma-simpla-cursuri-online" },
  openGraph: {
    title: "Cea Mai Simplă Platformă Cursuri Online | DoCourse",
    description: "Fără tehnic, fără complicații — cea mai simplă platformă de cursuri online.",
    url: "https://docourse.ro/platforma-simpla-cursuri-online",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cea Mai Simplă Platformă Cursuri Online | DoCourse",
    description: "Fără tehnic, fără complicații — cea mai simplă platformă de cursuri online.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Cea Mai Simplă Platformă Cursuri Online | DoCourse",
  "description": "Fără tehnic, fără complicații. Creezi contul, încarci cursul, primești banii.",
  "url": "https://docourse.ro/platforma-simpla-cursuri-online",
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
      "name": "Este potrivită pentru începători?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Interfața este simplă, fără setări tehnice complicate."
      }
    },
    {
      "@type": "Question",
      "name": "Cât de repede pot crea primul curs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "În aceeași zi, dacă ai materialele pregătite."
      }
    },
    {
      "@type": "Question",
      "name": "Pot trimite cursul prin link?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Cursanții pot intra rapid, fără cont dacă vrei."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PlatformaSimplaCursuriOnline />
    </>
  );
}
