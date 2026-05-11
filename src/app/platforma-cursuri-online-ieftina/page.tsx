import type { Metadata } from "next";
import PlatformaCursuriIeftina from "@/views/PlatformaCursuriIeftina";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online Ieftină | DoCourse — 9€/lună",
  description: "Cea mai accesibilă platformă de cursuri online din România. De la 9 euro pe lună, fără comisioane pe vânzări, fără costuri ascunse. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-online-ieftina" },
  openGraph: {
    title: "Platformă Cursuri Online Ieftină | DoCourse",
    description: "Platformă de cursuri online accesibilă — 9€/lună fără comisioane.",
    url: "https://docourse.ro/platforma-cursuri-online-ieftina",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online Ieftină | DoCourse — 9€/lună",
  description: "Cea mai accesibilă platformă de cursuri online din România. De la 9 euro pe lună, fără comisioane pe vânzări.",
  url: "https://docourse.ro/platforma-cursuri-online-ieftina",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriIeftina />
    </>
  );
}
