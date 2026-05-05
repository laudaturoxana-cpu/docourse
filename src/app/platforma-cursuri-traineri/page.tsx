import type { Metadata } from "next";
import PlatformaCursuriTraineri from "@/views/PlatformaCursuriTraineri";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Traineri | DoCourse",
  description: "Traineri: creați și vindeți cursuri online pe propria platformă. DoCourse — simplu, rapid, fără comisioane. 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-traineri" },
  openGraph: { title: "Platformă Cursuri Online pentru Traineri | DoCourse", description: "Traineri: vindeți cursuri online fără comisioane.", url: "https://docourse.ro/platforma-cursuri-traineri" },
};
export default function Page() { return <PlatformaCursuriTraineri />; }
