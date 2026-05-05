import type { Metadata } from "next";
import PlatformaCursuriCoaching from "@/views/PlatformaCursuriCoaching";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Coaches | DoCourse",
  description: "Platforma perfectă pentru coaches. Vinde programe online, organizează comunități și automatizează înrolările. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-coaching" },
  openGraph: { title: "Platformă Cursuri Online pentru Coaches | DoCourse", description: "Creează programe de coaching online și vinde-le simplu.", url: "https://docourse.ro/platforma-cursuri-coaching" },
};
export default function Page() { return <PlatformaCursuriCoaching />; }
