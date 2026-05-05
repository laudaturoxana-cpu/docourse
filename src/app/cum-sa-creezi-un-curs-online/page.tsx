import type { Metadata } from "next";
import CreeazaCursOnline from "@/views/CreeazaCursOnline";
export const metadata: Metadata = {
  title: "Cum să Creezi un Curs Online în 2025 | DoCourse",
  description: "Ghid complet: cum să creezi și să vinzi un curs online în România în 2025. De la idee la primii studenți — pași clari, fără jargon tehnic.",
  alternates: { canonical: "https://docourse.ro/cum-sa-creezi-un-curs-online" },
  openGraph: { title: "Cum să Creezi un Curs Online în 2025 | DoCourse", description: "Ghid complet pentru crearea unui curs online în România.", url: "https://docourse.ro/cum-sa-creezi-un-curs-online" },
};
export default function Page() { return <CreeazaCursOnline />; }
