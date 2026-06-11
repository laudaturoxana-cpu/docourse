export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Login from "@/views/Login";

export const metadata: Metadata = {
  title: "Autentificare — DoCourse",
  robots: { index: false, follow: false },
};

export default function Page() { return <Login />; }
