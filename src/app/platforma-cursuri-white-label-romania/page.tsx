import type { Metadata } from "next";
import PlatformaCursuriWhiteLabel from "@/views/PlatformaCursuriWhiteLabel";
export const metadata: Metadata = {
  title: "Platformă Cursuri White Label România | DoCourse",
  description: "Platformă de cursuri white label pentru România. Brandul tău, domeniul tău, clienții tăi. DoCourse în culise, tu în față.",
  alternates: { canonical: "https://docourse.ro/platforma-cursuri-white-label-romania" },
  openGraph: { title: "Platformă Cursuri White Label România | DoCourse", description: "Soluție white label pentru cursuri online — brandul tău complet.", url: "https://docourse.ro/platforma-cursuri-white-label-romania" },
};
export default function Page() { return <PlatformaCursuriWhiteLabel />; }
