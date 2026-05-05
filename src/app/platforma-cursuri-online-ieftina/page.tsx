import type { Metadata } from "next";
import PlatformaCursuriIeftina from "@/views/PlatformaCursuriIeftina";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online Ieftină | DoCourse — 9€/lună",
  description: "Cea mai accesibilă platformă de cursuri online din România. De la 9 euro pe lună, fără comisioane pe vânzări, fără costuri ascunse. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-online-ieftina" },
  openGraph: { title: "Platformă Cursuri Online Ieftină | DoCourse", description: "Platformă de cursuri online accesibilă — 9€/lună fără comisioane.", url: "https://docourse.ro/platforma-cursuri-online-ieftina" },
};
export default function Page() { return <PlatformaCursuriIeftina />; }
