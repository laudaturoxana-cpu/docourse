"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PartyPopper, ArrowRight, Mail } from "lucide-react";

interface ThankYouData {
  course_url: string;
  requires_login: boolean;
  email_sent: boolean;
  thankyou_headline: string | null;
  thankyou_message: string | null;
  course_title: string;
  creator_name: string | null;
}

export default function CaptureThankYou() {
  const _params = useParams<{ slug: string }>();
  const slug = _params?.slug;
  const [data, setData] = useState<ThankYouData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`capture_${slug}`);
    if (stored) {
      try { setData(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [slug]);

  const headline = data?.thankyou_headline || "Felicitări! Ești înscris 🎉";
  const message = data?.thankyou_message || "Verifică-ți emailul — ți-am trimis linkul de acces la curs.";
  const buttonLabel = data?.requires_login ? "Creează cont și accesează cursul" : "Accesează cursul acum";

  return (
    <>
      

      

      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4 font-sans">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#d4a017]/10 flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-10 h-10 text-[#d4a017]" />
          </div>

          <h1 className="text-3xl font-bold text-[#0a192f] mb-4">{headline}</h1>
          <p className="text-[#5a6a7a] text-lg leading-relaxed mb-8">{message}</p>

          {data?.course_url && (
            <a
              href={data.course_url}
              className="inline-flex items-center gap-2 bg-[#d4a017] hover:bg-[#c4911a] text-[#0a192f] font-bold px-8 py-4 rounded-xl transition-colors text-lg mb-4"
            >
              {buttonLabel} <ArrowRight className="w-5 h-5" />
            </a>
          )}

          {data?.email_sent && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#5a6a7a]">
              <Mail className="w-4 h-4 text-[#d4a017]" />
              <span>Am trimis și un email cu linkul de acces</span>
            </div>
          )}

          {data?.creator_name && (
            <p className="mt-8 text-sm text-[#9ca3af]">
              Cu drag, <strong className="text-[#5a6a7a]">{data.creator_name}</strong>
            </p>
          )}

          <footer className="mt-12 text-xs text-[#9ca3af]">
            Curs creat cu{" "}
            <a href="https://www.docourse.ro" className="hover:underline text-[#5a6a7a]">DoCourse</a>
          </footer>
        </div>
      </div>
    </>
  );
}
