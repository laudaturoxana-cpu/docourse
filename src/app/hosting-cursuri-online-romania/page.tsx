import type { Metadata } from "next";
import HostingCursuriOnlineRomania from "@/views/HostingCursuriOnlineRomania";
export const metadata: Metadata = {
  title: "Hosting Cursuri Online România | DoCourse",
  description: "Hosting profesional pentru cursuri online în România. Servere rapide, stocare pentru video, domeniu propriu inclus. Totul într-un singur loc.",
  alternates: { canonical: "https://docourse.ro/hosting-cursuri-online-romania" },
  openGraph: { title: "Hosting Cursuri Online România | DoCourse", description: "Hosting profesional pentru cursuri online — rapid, sigur, accesibil.", url: "https://docourse.ro/hosting-cursuri-online-romania" },
};
export default function Page() { return <HostingCursuriOnlineRomania />; }
