import type { Metadata } from "next";
import PlatformaCursuriEducatori from "@/views/PlatformaCursuriEducatori";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Educatori | DoCourse",
  description: "Platforma DoCourse pentru educatori și profesori. Creează cursuri educaționale, gestionează studenți și monetizează cunoștințele tale.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-educatori" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Educatori | DoCourse",
    description: "Educatori: creați cursuri online profesionale cu DoCourse.",
    url: "https://docourse.ro/platforma-cursuri-educatori",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online pentru Educatori | DoCourse",
  description: "Platforma DoCourse pentru educatori și profesori. Creează cursuri educaționale și monetizează cunoștințele tale.",
  url: "https://docourse.ro/platforma-cursuri-educatori",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriEducatori />
    </>
  );
}
