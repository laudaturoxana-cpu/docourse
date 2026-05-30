import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import WebMCPProvider from "@/components/WebMCPProvider";
import { CookieConsent } from "@/components/CookieConsent";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
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
      "msvalidate.01": "65BAE6956AC6F2846C305A73112D054F",
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
      <head>
        <meta name="msvalidate.01" content="65BAE6956AC6F2846C305A73112D054F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DoCourse" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`antialiased ${poppins.variable}`}>
        <Providers>{children}</Providers>
        <WebMCPProvider />
        <CookieConsent />
      </body>
    </html>
  );
}
