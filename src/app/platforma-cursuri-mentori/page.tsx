import type { Metadata } from "next";
import PlatformaCursuriMentori from "@/views/PlatformaCursuriMentori";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Mentori | DoCourse",
  description: "Platforma ideală pentru mentori care vor să monetizeze expertiza. Vinde cursuri, creează comunități private și gestionează mentoratul online. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-mentori" },
  openGraph: { title: "Platformă Cursuri Online pentru Mentori | DoCourse", description: "Monetizează-ți expertiza ca mentor cu DoCourse.", url: "https://docourse.ro/platforma-cursuri-mentori" },
};
export default function Page() { return <PlatformaCursuriMentori />; }
