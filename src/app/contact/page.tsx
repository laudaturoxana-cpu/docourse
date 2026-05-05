import type { Metadata } from "next";
import Contact from "@/views/Contact";
export const metadata: Metadata = {
  title: "Contact | DoCourse",
  description: "Contactează echipa DoCourse. Suntem aici să te ajutăm cu orice întrebare despre platformă, facturare sau suport tehnic.",
  alternates: { canonical: "https://docourse.ro/contact" },
};
export default function Page() { return <Contact />; }
