import type { Metadata } from "next";
import CreeazaCursOnline from "@/views/CreeazaCursOnline";

export const metadata: Metadata = {
  title: "Cum să Creezi un Curs Online în 2025 | DoCourse",
  description: "Ghid complet: cum să creezi și să vinzi un curs online în România în 2025. De la idee la primii studenți — pași clari, fără jargon tehnic.",
  alternates: { canonical: "https://docourse.ro/cum-sa-creezi-un-curs-online" },
  openGraph: {
    title: "Cum să Creezi un Curs Online în 2025 | DoCourse",
    description: "Ghid complet pentru crearea unui curs online în România.",
    url: "https://docourse.ro/cum-sa-creezi-un-curs-online",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cum să Creezi un Curs Online în 2025 | DoCourse",
    description: "Ghid complet pentru crearea unui curs online în România.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Cum să Creezi un Curs Online în 2025 | DoCourse",
  "description": "Ghid complet: cum să creezi și să vinzi un curs online în România în 2025.",
  "url": "https://docourse.ro/cum-sa-creezi-un-curs-online",
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
      "name": "Cât de lung trebuie să fie un curs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Depinde de rezultat. Pentru început, 60–120 de minute de conținut sunt suficiente."
      }
    },
    {
      "@type": "Question",
      "name": "Pot începe cu un curs gratuit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da. Mulți creatori folosesc un curs scurt gratuit pentru validare și audiență."
      }
    },
    {
      "@type": "Question",
      "name": "Am nevoie de echipament profesional?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nu. Un telefon și un microfon decent sunt suficiente pentru primele lecții."
      }
    },
    {
      "@type": "Question",
      "name": "Cum structurez modulele?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fiecare modul are un obiectiv clar și 2–5 lecții scurte, ușor de parcurs."
      }
    },
    {
      "@type": "Question",
      "name": "Cât durează să public?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "După ce ai materialele, publicarea durează câteva minute."
      }
    },
    {
      "@type": "Question",
      "name": "Cum aleg prețul?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pornește de la rezultatul promis și nivelul de transformare, nu de la numărul de lecții."
      }
    },
    {
      "@type": "Question",
      "name": "Cât durează să filmez?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Dacă ai outline-ul clar, poți filma 3–5 lecții într-o singură sesiune."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <CreeazaCursOnline />
    </>
  );
}
