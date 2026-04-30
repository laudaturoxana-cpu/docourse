import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "DoCourse — Platformă cursuri online în România",
    template: "%s — DoCourse",
  },
  description:
    "Platforma românească pentru creatori de cursuri online. Simplu, rapid, profesionist. Cursuri, comunitate și acces controlat — totul la 9€/lună.",
  keywords: [
    "platforma cursuri online",
    "creare cursuri online",
    "platforma cursuri online Romania",
    "cursuri online Romania",
  ],
  metadataBase: new URL("https://docourse.ro"),
  alternates: { canonical: "https://docourse.ro" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://docourse.ro",
    siteName: "DoCourse",
    title: "DoCourse — Platforma românească pentru creatori de cursuri online",
    description:
      "Un singur loc. Toate cursurile tale. Zero bătăi de cap. Platforma ultra-simplă pentru creatorii români.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoCourse — Platforma românească pentru creatori de cursuri",
    description: "Un singur loc. Toate cursurile tale. Zero bătăi de cap.",
    images: ["/og-image.png"],
  },
  verification: {
    other: {
      "msvalidate.01": "74291723EFA920717D6DFFF2A09F1CB7",
      "facebook-domain-verification": "f9sg20pqrljfemhn6nxjkmv6t7u9uw",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
