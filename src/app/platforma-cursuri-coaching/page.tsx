import type { Metadata } from "next";
import PlatformaCursuriCoaching from "@/views/PlatformaCursuriCoaching";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Coaches | DoCourse",
  description: "Platforma perfectă pentru coaches. Vinde programe online, organizează comunități și automatizează înrolările. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-coaching" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Coaches | DoCourse",
    description: "Creează programe de coaching online și vinde-le simplu.",
    url: "https://docourse.ro/platforma-cursuri-coaching",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online pentru Coaches | DoCourse",
  description: "Platforma perfectă pentru coaches. Vinde programe online, organizează comunități și automatizează înrolările.",
  url: "https://docourse.ro/platforma-cursuri-coaching",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriCoaching />
    </>
  );
}
