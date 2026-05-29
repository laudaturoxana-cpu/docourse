import type { Metadata } from "next";
import Index from "@/views/Index";

export const metadata: Metadata = {
  title: "DoCourse — Cursuri online, Comunitate și Email Marketing în România",
  description:
    "Platformă românească pentru creatori de cursuri. Cursuri nelimitate, comunitate inclusă, email marketing în Pro. De la 9€/lună, 0% comision din vânzări.",
  alternates: { canonical: "https://docourse.ro" },
  openGraph: {
    title: "DoCourse — Cursuri online, Comunitate și Email Marketing în România",
    description:
      "Platformă românească pentru creatori de cursuri. Cursuri nelimitate, comunitate inclusă, email marketing în Pro. De la 9€/lună, 0% comision din vânzări.",
    url: "https://docourse.ro",
    type: "website",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoCourse — Cursuri online, Comunitate și Email Marketing în România",
    description: "Platformă românească pentru creatori de cursuri. Cursuri nelimitate, comunitate inclusă, email marketing în Pro. De la 9€/lună, 0% comision din vânzări.",
    images: ["https://docourse.ro/og-image.png"],
  },
};

const softwareAppLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DoCourse",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://docourse.ro",
  description:
    "Platformă română pentru crearea și vânzarea de cursuri online. Fără comision ascuns, cu comunitate inclusă.",
  offers: {
    "@type": "Offer",
    price: "9",
    priceCurrency: "EUR",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      billingDuration: "P1M",
    },
  },
  provider: {
    "@type": "Organization",
    name: "DoCourse",
    url: "https://docourse.ro",
    logo: "https://docourse.ro/logo.svg",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "contact@docourse.ro",
    },
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "DoCourse ia comision din vânzările mele?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nu. DoCourse nu ia niciun comision din vânzările tale, indiferent de plan. Plătești doar abonamentul lunar fix.",
      },
    },
    {
      "@type": "Question",
      name: "Comunitatea este inclusă în planul de bază?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da. Comunitatea este inclusă în planul Starter de 9€/lună. Membrii care se înscriu în comunitate sunt adăugați automat în lista ta de email.",
      },
    },
    {
      "@type": "Question",
      name: "Ce include planul Pro față de Starter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Planul Pro (29€/lună) adaugă email marketing complet, sales page generat cu AI, funnel cu pagină de captură și lead magnet, plus statistici avansate și suport prioritar.",
      },
    },
    {
      "@type": "Question",
      name: "Pot crea un curs online fără experiență tehnică?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da. DoCourse este gândită pentru creatori fără experiență tehnică. Setup simplu, totul e în română.",
      },
    },
    {
      "@type": "Question",
      name: "Cât durează să public un curs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "După ce ai materialele, publicarea durează câteva minute.",
      },
    },
  ],
};

const organizationLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "DoCourse",
      url: "https://docourse.ro",
      logo: "https://docourse.ro/logo.svg",
    },
    {
      "@type": "WebSite",
      name: "DoCourse",
      url: "https://docourse.ro",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <Index />
    </>
  );
}
