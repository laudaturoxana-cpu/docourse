import type { Metadata } from "next";
import PlatformaCursuriComunitate from "@/views/PlatformaCursuriComunitate";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online cu Comunitate Privată | DoCourse",
  description: "Cursuri online cu comunitate privată inclusă. Studenți mai angajați, retenție mai mare, venituri recurente. DoCourse — cursuri plus comunitate.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-cu-comunitate" },
  openGraph: {
    title: "Platformă Cursuri cu Comunitate Privată | DoCourse",
    description: "Cursuri online cu comunitate — studenți mai angajați, venituri mai mari.",
    url: "https://docourse.ro/platforma-cursuri-cu-comunitate",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online cu Comunitate Privată | DoCourse",
  description: "Cursuri online cu comunitate privată inclusă. Studenți mai angajați, retenție mai mare, venituri recurente.",
  url: "https://docourse.ro/platforma-cursuri-cu-comunitate",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriComunitate />
    </>
  );
}
