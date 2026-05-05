import type { Metadata } from "next";
import PlatformaCursuriDomeniuPropriu from "@/views/PlatformaCursuriDomeniuPropriu";
export const metadata: Metadata = {
  title: "Platformă Cursuri pe Domeniu Propriu | DoCourse",
  description: "Lansează o platformă de cursuri pe domeniul tău propriu. Brand 100% al tău, fără DoCourse în URL. Profesional și complet personalizat.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-domeniu-propriu" },
  openGraph: { title: "Platformă Cursuri pe Domeniu Propriu | DoCourse", description: "Platformă de cursuri online pe domeniu propriu — brand complet al tău.", url: "https://docourse.ro/platforma-cursuri-domeniu-propriu" },
};
export default function Page() { return <PlatformaCursuriDomeniuPropriu />; }
