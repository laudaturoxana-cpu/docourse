import type { Metadata } from "next";
import PlatformaSimplaCursuriOnline from "@/views/PlatformaSimplaCursuriOnline";
export const metadata: Metadata = {
  title: "Cea Mai Simplă Platformă Cursuri Online | DoCourse",
  description: "Fără tehnic, fără complicații. Creezi contul, încarci cursul, primești banii. DoCourse — cea mai simplă platformă de cursuri online din România.",
  alternates: { canonical: "https://docourse.ro/platforma-simpla-cursuri-online" },
  openGraph: { title: "Cea Mai Simplă Platformă Cursuri Online | DoCourse", description: "Fără tehnic, fără complicații — cea mai simplă platformă de cursuri online.", url: "https://docourse.ro/platforma-simpla-cursuri-online" },
};
export default function Page() { return <PlatformaSimplaCursuriOnline />; }
