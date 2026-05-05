import type { Metadata } from "next";
import Blog from "@/views/Blog";
export const metadata: Metadata = {
  title: "Blog — Cursuri Online & Marketing Digital | DoCourse",
  description: "Articole practice pentru creatorii de cursuri online din România. Strategii de marketing, ghiduri de creare cursuri și povești de succes.",
  alternates: { canonical: "https://docourse.ro/blog" },
  openGraph: { title: "Blog DoCourse — Cursuri Online & Marketing", description: "Articole practice pentru creatorii de cursuri online din România.", url: "https://docourse.ro/blog" },
};
export const dynamic = "force-dynamic";
export default function Page() { return <Blog />; }
