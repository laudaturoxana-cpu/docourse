import type { Metadata } from "next";
import PlatformaCursuriOnline from "@/views/PlatformaCursuriOnline";

export const metadata: Metadata = {
  title: "Platformă Cursuri Online România | DoCourse",
  description: "Cea mai simplă platformă de cursuri online din România. Creează, publică și vinde cursuri profesionale fără comisioane. Încearcă 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-online" },
  openGraph: {
    title: "Platformă Cursuri Online România | DoCourse",
    description: "Creează și vinde cursuri online profesionale fără comisioane.",
    url: "https://docourse.ro/platforma-cursuri-online",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri Online România | DoCourse",
  description: "Cea mai simplă platformă de cursuri online din România. Creează, publică și vinde cursuri profesionale fără comisioane.",
  url: "https://docourse.ro/platforma-cursuri-online",
  inLanguage: "ro",
  about: {
    "@type": "SoftwareApplication",
    name: "DoCourse",
    applicationCategory: "BusinessApplication",
    offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" },
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriOnline />
    </>
  );
}
