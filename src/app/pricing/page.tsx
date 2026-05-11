import type { Metadata } from "next";
import Pricing from "@/views/Pricing";

export const metadata: Metadata = {
  title: "Prețuri DoCourse — cursuri online de la 9€/lună",
  description: "Planuri simple și transparente. De la 9€/lună, fără comisioane pe vânzări, fără costuri ascunse. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/pricing" },
  openGraph: {
    title: "Prețuri DoCourse — cursuri online de la 9€/lună",
    description: "Planuri accesibile pentru creatori de cursuri. 7 zile gratuit, fără comisioane.",
    url: "https://docourse.ro/pricing",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const pricingLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "DoCourse — Platformă cursuri online",
  description: "Platformă pentru creatori de cursuri online în România. Fără comisioane pe vânzări.",
  url: "https://docourse.ro/pricing",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "9",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "9",
        priceCurrency: "EUR",
        billingDuration: "P1M",
      },
      availability: "https://schema.org/InStock",
      url: "https://docourse.ro/pricing",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "29",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "29",
        priceCurrency: "EUR",
        billingDuration: "P1M",
      },
      availability: "https://schema.org/InStock",
      url: "https://docourse.ro/pricing",
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingLd) }}
      />
      <Pricing />
    </>
  );
}
