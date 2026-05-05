import type { Metadata } from "next";
import PlatformaCursuriOnline from "@/views/PlatformaCursuriOnline";
export const metadata: Metadata = {
  title: "Platformă Cursuri Online România | DoCourse",
  description: "Cea mai simplă platformă de cursuri online din România. Creează, publică și vinde cursuri profesionale fără comisioane. Încearcă 7 zile gratuit.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-online" },
  openGraph: { title: "Platformă Cursuri Online România | DoCourse", description: "Creează și vinde cursuri online profesionale fără comisioane.", url: "https://docourse.ro/platforma-cursuri-online" },
};
export default function Page() { return <PlatformaCursuriOnline />; }
