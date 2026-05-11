import type { Metadata } from "next";
import PlatformaCursuriTraineri from "@/views/PlatformaCursuriTraineri";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Traineri | DoCourse",
  description: "Traineri: creați și vindeți cursuri online pe propria platformă. DoCourse — simplu, rapid, fără comisioane. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-traineri" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Traineri | DoCourse",
    description: "Traineri: vindeți cursuri online fără comisioane.",
    url: "https://docourse.ro/platforma-cursuri-traineri",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online pentru Traineri | DoCourse",
  description: "Traineri: creați și vindeți cursuri online pe propria platformă. DoCourse — simplu, rapid, fără comisioane.",
  url: "https://docourse.ro/platforma-cursuri-traineri",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriTraineri />
    </>
  );
}
