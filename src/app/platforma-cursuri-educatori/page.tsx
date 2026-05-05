import type { Metadata } from "next";
import PlatformaCursuriEducatori from "@/views/PlatformaCursuriEducatori";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online pentru Educatori | DoCourse",
  description: "Platforma DoCourse pentru educatori și profesori. Creează cursuri educaționale, gestionează studenți și monetizează cunoștințele tale.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-educatori" },
  openGraph: { title: "Platformă Cursuri Online pentru Educatori | DoCourse", description: "Educatori: creați cursuri online profesionale cu DoCourse.", url: "https://docourse.ro/platforma-cursuri-educatori" },
};
export default function Page() { return <PlatformaCursuriEducatori />; }
