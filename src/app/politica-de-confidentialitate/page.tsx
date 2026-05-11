import type { Metadata } from "next";
import PoliticaConfidentialitate from "@/views/PoliticaConfidentialitate";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate | DoCourse",
  description: "Politica de confidențialitate și protecția datelor (GDPR) DoCourse.",
  alternates: { canonical: "https://docourse.ro/politica-de-confidentialitate" },
};

export default function Page() { return <PoliticaConfidentialitate />; }
