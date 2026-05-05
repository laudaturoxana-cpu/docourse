import type { Metadata } from "next";
import Pricing from "@/views/Pricing";
export const metadata: Metadata = {
  title: "Prețuri Platformă Cursuri Online | DoCourse — de la 9€/lună",
  description: "Planuri simple și transparente. De la 9€/lună, fără comisioane pe vânzări, fără costuri ascunse. 7 zile gratuit, fără card.",
  alternates: { canonical: "https://docourse.ro/pricing" },
  openGraph: { title: "Prețuri DoCourse — de la 9€/lună", description: "Planuri accesibile pentru creatori de cursuri. 7 zile gratuit.", url: "https://docourse.ro/pricing" },
};
export const dynamic = "force-dynamic";
export default function Page() { return <Pricing />; }
