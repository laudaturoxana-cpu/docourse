import type { Metadata } from "next";
import PlatformaCursuriPsihologi from "@/views/PlatformaCursuriPsihologi";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Psihologi | DoCourse",
  description: "Psihologi: transformați expertiza în cursuri online. Platformă profesională pentru cursuri de psihologie, workshopuri și programe terapeutice.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-psihologi" },
  openGraph: { title: "Platformă Cursuri Online pentru Psihologi | DoCourse", description: "Creează cursuri de psihologie online cu DoCourse.", url: "https://docourse.ro/platforma-cursuri-psihologi" },
};
export default function Page() { return <PlatformaCursuriPsihologi />; }
