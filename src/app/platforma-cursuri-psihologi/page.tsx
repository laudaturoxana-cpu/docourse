import type { Metadata } from "next";
import PlatformaCursuriPsihologi from "@/views/PlatformaCursuriPsihologi";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Psihologi | DoCourse",
  description: "Psihologi: transformați expertiza în cursuri online. Platformă profesională pentru cursuri de psihologie, workshopuri și programe terapeutice.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-psihologi" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Psihologi | DoCourse",
    description: "Creează cursuri de psihologie online cu DoCourse.",
    url: "https://docourse.ro/platforma-cursuri-psihologi",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online pentru Psihologi | DoCourse",
  description: "Psihologi: transformați expertiza în cursuri online. Platformă profesională pentru cursuri de psihologie.",
  url: "https://docourse.ro/platforma-cursuri-psihologi",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriPsihologi />
    </>
  );
}
