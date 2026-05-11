import type { Metadata } from "next";
import PlatformaCursuriMentori from "@/views/PlatformaCursuriMentori";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Mentori | DoCourse",
  description: "Platforma ideală pentru mentori care vor să monetizeze expertiza. Vinde cursuri, creează comunități private și gestionează mentoratul online. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-mentori" },
  openGraph: {
    title: "Platformă Cursuri Online pentru Mentori | DoCourse",
    description: "Monetizează-ți expertiza ca mentor cu DoCourse.",
    url: "https://docourse.ro/platforma-cursuri-mentori",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online pentru Mentori | DoCourse",
  description: "Platforma ideală pentru mentori care vor să monetizeze expertiza.",
  url: "https://docourse.ro/platforma-cursuri-mentori",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriMentori />
    </>
  );
}
