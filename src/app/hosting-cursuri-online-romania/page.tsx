import type { Metadata } from "next";
import HostingCursuriOnlineRomania from "@/views/HostingCursuriOnlineRomania";

export const metadata: Metadata = {
  title: "Hosting Cursuri Online România | DoCourse",
  description: "Hosting profesional pentru cursuri online în România. Servere rapide, stocare pentru video, domeniu propriu inclus. Totul într-un singur loc.",
  alternates: { canonical: "https://docourse.ro/hosting-cursuri-online-romania" },
  openGraph: {
    title: "Hosting Cursuri Online România | DoCourse",
    description: "Hosting profesional pentru cursuri online — rapid, sigur, accesibil.",
    url: "https://docourse.ro/hosting-cursuri-online-romania",
    images: [{ url: "https://docourse.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const ld = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Hosting Cursuri Online România | DoCourse",
  description: "Hosting profesional pentru cursuri online în România. Servere rapide, stocare pentru video, domeniu propriu inclus.",
  url: "https://docourse.ro/hosting-cursuri-online-romania",
  inLanguage: "ro",
  about: { "@type": "SoftwareApplication", name: "DoCourse", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "9", priceCurrency: "EUR" } },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <HostingCursuriOnlineRomania />
    </>
  );
}
