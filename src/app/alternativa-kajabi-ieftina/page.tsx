import type { Metadata } from "next";
import AlternativaKajabiIeftina from "@/views/AlternativaKajabiIeftina";
export const metadata: Metadata = {
  title: "Alternativă Kajabi Ieftină pentru România | DoCourse",
  description: "Cauți o alternativă la Kajabi mai ieftină? DoCourse oferă aceleași funcționalități la o fracțiune din preț. Platformă românească, suport în română.",
  alternates: { canonical: "https://docourse.ro/alternativa-kajabi-ieftina" },
  openGraph: { title: "Alternativă Kajabi Ieftină | DoCourse", description: "Alternativă românească la Kajabi — aceleași funcții, preț mult mai mic.", url: "https://docourse.ro/alternativa-kajabi-ieftina" },
};
export default function Page() { return <AlternativaKajabiIeftina />; }
