import type { Metadata } from "next";
import Resurse from "@/views/Resurse";
export const metadata: Metadata = {
  title: "Resurse Gratuite pentru Creatori de Cursuri | DoCourse",
  description: "Resurse gratuite pentru creatorii de cursuri online: template-uri, ghiduri, checklist-uri și instrumente care îți economisesc timp.",
  alternates: { canonical: "https://docourse.ro/resurse" },
};
export default function Page() { return <Resurse />; }
