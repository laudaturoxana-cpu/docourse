import type { Metadata } from "next";
import PlatformaCursuriDomeniuPropriu from "@/views/PlatformaCursuriDomeniuPropriu";

export const metadata: Metadata = {
  title: "Platformă Cursuri pe Domeniu Propriu | DoCourse",
  description: "Lansează o platformă de cursuri pe domeniul tău propriu. Brand 100% al tău, fără DoCourse în URL. Profesional și complet personalizat.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-domeniu-propriu" },
  openGraph: {
    title: "Platformă Cursuri pe Domeniu Propriu | DoCourse",
    description: "Platformă de cursuri online pe domeniu propriu — brand complet al tău.",
    url: "https://docourse.ro/platforma-cursuri-domeniu-propriu",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri pe Domeniu Propriu | DoCourse",
  description: "Lansează o platformă de cursuri pe domeniul tău propriu. Brand 100% al tău, fără DoCourse în URL.",
  url: "https://docourse.ro/platforma-cursuri-domeniu-propriu",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriDomeniuPropriu />
    </>
  );
}
