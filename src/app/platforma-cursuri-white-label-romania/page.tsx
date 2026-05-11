import type { Metadata } from "next";
import PlatformaCursuriWhiteLabel from "@/views/PlatformaCursuriWhiteLabel";

export const metadata: Metadata = {
  title: "Platformă Cursuri White Label România | DoCourse",
  description: "Platformă de cursuri white label pentru România. Brandul tău, domeniul tău, clienții tăi. DoCourse în culise, tu în față.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-white-label-romania" },
  openGraph: {
    title: "Platformă Cursuri White Label România | DoCourse",
    description: "Soluție white label pentru cursuri online — brandul tău complet.",
    url: "https://docourse.ro/platforma-cursuri-white-label-romania",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Platformă Cursuri White Label România | DoCourse",
  description: "Platformă de cursuri white label pentru România. Brandul tău, domeniul tău, clienții tăi.",
  url: "https://docourse.ro/platforma-cursuri-white-label-romania",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PlatformaCursuriWhiteLabel />
    </>
  );
}
