import type { Metadata } from "next";
import AlternativaKajabiIeftina from "@/views/AlternativaKajabiIeftina";

export const metadata: Metadata = {
  title: "Alternativă Kajabi Ieftină pentru România | DoCourse",
  description: "Cauți o alternativă la Kajabi mai ieftină? DoCourse oferă aceleași funcționalități la o fracțiune din preț. Platformă românească, suport în română.",
  alternates: { canonical: "https://docourse.ro/alternativa-kajabi-ieftina" },
  openGraph: {
    title: "Alternativă Kajabi Ieftină | DoCourse",
    description: "Alternativă românească la Kajabi — aceleași funcții, preț mult mai mic.",
    url: "https://docourse.ro/alternativa-kajabi-ieftina",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Alternativă Kajabi Ieftină pentru România | DoCourse",
  description: "Alternativă românească la Kajabi — aceleași funcții, preț mult mai mic.",
  url: "https://docourse.ro/alternativa-kajabi-ieftina",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <AlternativaKajabiIeftina />
    </>
  );
}
