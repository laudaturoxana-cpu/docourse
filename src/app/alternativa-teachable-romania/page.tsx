import type { Metadata } from "next";
import AlternativaTeachableRomania from "@/views/AlternativaTeachableRomania";
export const metadata: Metadata = {
  title: "Alternativă Teachable în România | DoCourse",
  description: "Alternativă românească la Teachable fără comisioane pe vânzări. Platformă de cursuri cu suport în română și prețuri în euro.",
  alternates: { canonical: "https://docourse.ro/alternativa-teachable-romania" },
  openGraph: { title: "Alternativă Teachable România | DoCourse", description: "Alternativă la Teachable fără comisioane — platformă românească.", url: "https://docourse.ro/alternativa-teachable-romania" },
};
export default function Page() { return <AlternativaTeachableRomania />; }
