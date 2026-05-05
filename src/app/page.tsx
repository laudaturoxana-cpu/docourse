export const dynamic = "force-dynamic";
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
  },
};

const jsonLd = {
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
    price: "49",
    priceCurrency: "RON",
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Index />
    </>
  );
}
