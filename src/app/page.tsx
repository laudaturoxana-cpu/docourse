import type { Metadata } from "next";
import Index from "@/views/Index";

export const metadata: Metadata = {
  title: "DoCourse — Platformă cursuri online în România",
  description:
    "Platforma românească pentru creatori de cursuri online. Simplu, rapid, profesionist. Cursuri, comunitate și acces controlat — totul la 9€/lună.",
  alternates: { canonical: "https://docourse.ro" },
  openGraph: {
    title: "DoCourse — Platformă cursuri online în România",
    description:
      "Platforma românească pentru creatori de cursuri online. Simplu, rapid, profesionist. Cursuri, comunitate și acces controlat — totul la 9€/lună.",
    url: "https://docourse.ro",
    type: "website",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
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
      name: "Pot crea un curs online fără experiență tehnică?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da. DoCourse este gândită pentru începători, cu setup simplu și rapid.",
      },
    },
    {
      "@type": "Question",
      name: "Cursanții pot accesa fără cont?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da. Poți trimite linkul direct cursantului, iar el intră imediat.",
      },
    },
    {
      "@type": "Question",
      name: "Pot activa comunitatea pentru cursuri?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da. Comunitatea este opțională și se activează când vrei.",
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
    {
      "@type": "Question",
      name: "Pot folosi domeniul meu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Da. Cursurile pot fi livrate pe domeniul tău.",
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
