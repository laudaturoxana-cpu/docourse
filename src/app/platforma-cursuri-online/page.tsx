import type { Metadata } from "next";
import PlatformaCursuriOnline from "@/views/PlatformaCursuriOnline";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online România | DoCourse",
  description: "Cea mai simplă platformă de cursuri online din România. Creează, publică și vinde cursuri profesionale fără comisioane. Încearcă 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-online" },
  openGraph: {
    title: "Platformă Cursuri Online România | DoCourse",
    description: "Creează și vinde cursuri online profesionale fără comisioane.",
    url: "https://docourse.ro/platforma-cursuri-online",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platformă Cursuri Online România | DoCourse",
    description: "Creează și vinde cursuri online profesionale fără comisioane.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Platformă Cursuri Online România | DoCourse",
  "description": "Cea mai simplă platformă de cursuri online din România. Creează, publică și vinde cursuri profesionale fără comisioane.",
  "url": "https://docourse.ro/platforma-cursuri-online",
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
      "name": "Cât de repede pot lansa un curs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "În aceeași zi. Încarci lecțiile, publici și trimiți linkul. Nu ai nevoie de setări tehnice complicate."
      }
    },
    {
      "@type": "Question",
      "name": "Pot oferi acces fără cont?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Poți trimite linkul direct cursantului, iar el poate începe imediat."
      }
    },
    {
      "@type": "Question",
      "name": "E potrivită pentru începători?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. DoCourse e gândită pentru creatori fără experiență tehnică."
      }
    },
    {
      "@type": "Question",
      "name": "Pot avea curs gratuit și curs cu plată?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Poți începe cu un curs gratuit și adăuga ulterior cursuri cu plată unică."
      }
    },
    {
      "@type": "Question",
      "name": "Am nevoie de site separat?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nu. Cursurile au pagini proprii, iar linkul poate fi distribuit direct."
      }
    },
    {
      "@type": "Question",
      "name": "Pot activa comunitatea doar pentru anumite cursuri?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Comunitatea se activează pentru cursul pe care îl alegi."
      }
    },
    {
      "@type": "Question",
      "name": "Cursantul poate vedea cursul pe mobil?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Interfața este optimizată pentru mobil și desktop."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PlatformaCursuriOnline />
    </>
  );
}
