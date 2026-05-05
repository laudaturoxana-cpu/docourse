import type { Metadata } from "next";
import PlatformaCursuriComunitate from "@/views/PlatformaCursuriComunitate";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online cu Comunitate Privată | DoCourse",
  description: "Cursuri online cu comunitate privată inclusă. Studenți mai angajați, retenție mai mare, venituri recurente. DoCourse — cursuri plus comunitate.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-cu-comunitate" },
  openGraph: { title: "Platformă Cursuri cu Comunitate Privată | DoCourse", description: "Cursuri online cu comunitate — studenți mai angajați, venituri mai mari.", url: "https://docourse.ro/platforma-cursuri-cu-comunitate" },
};
export default function Page() { return <PlatformaCursuriComunitate />; }
