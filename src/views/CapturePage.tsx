"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CaptureData {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  requires_login: boolean;
  capture_headline: string | null;
  capture_subheadline: string | null;
  capture_bullets: string[];
  capture_cta: string | null;
  thankyou_headline: string | null;
  thankyou_message: string | null;
  creator_full_name: string | null;
  creator_avatar: string | null;
}

export default function CapturePage() {
  const _params = useParams<{ slug: string }>();
  const slug = _params?.slug;
  const router = useRouter();

  const [data, setData] = useState<CaptureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (!slug) return;
    supabase.rpc("get_capture_page", { _slug: slug })
      .then(({ data: rows, error }) => {
        if (error) {
          console.error("get_capture_page error:", error);
          setNotFound(true);
        } else if (!rows || rows.length === 0) {
          setNotFound(true);
        } else {
          setData({ ...rows[0], capture_bullets: (rows[0].capture_bullets as unknown as string[]) || [] });
        }
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!email.includes("@")) { setEmailError("Email invalid"); return; }
    if (!data) return;

    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("submit-lead-capture", {
        body: { course_id: data.id, email: email.trim(), full_name: name.trim() || null },
      });

      const result = res.data as {
        success: boolean;
        email_sent: boolean;
        course_url: string;
        requires_login: boolean;
        thankyou_headline: string;
        thankyou_message: string;
      };

      if (result?.success) {
        // Store thank you data + course URL for the next page
        sessionStorage.setItem(`capture_${slug}`, JSON.stringify({
          course_url: result.course_url,
          requires_login: result.requires_login,
          email_sent: result.email_sent ?? false,
          thankyou_headline: result.thankyou_headline || data.thankyou_headline,
          thankyou_message: result.thankyou_message || data.thankyou_message,
          course_title: data.title,
          creator_name: data.creator_full_name,
        }));
        router.push(`/capture/${slug}/multumesc`);
      } else {
        setEmailError("A apărut o eroare. Încearcă din nou.");
      }
    } catch {
      setEmailError("A apărut o eroare. Încearcă din nou.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4a017]" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0a192f] mb-2">Pagina nu a fost găsită</h1>
          <p className="text-[#5a6a7a]">Această pagină nu există sau nu mai este disponibilă.</p>
        </div>
      </div>
    );
  }

  const headline = data.capture_headline || `Accesează gratuit: ${data.title}`;
  const subheadline = data.capture_subheadline || data.description || "";
  const bullets = data.capture_bullets || [];
  const cta = data.capture_cta || "Vreau acces gratuit";

  return (
    <>
      


        {data.image_url && <meta property="og:image" content={data.image_url} />}
      

      <div className="min-h-screen bg-[#fafaf8] font-sans">
        {/* Hero */}
        <div
          className="bg-[#0a192f] text-white px-4 py-16 md:py-24"
          style={data.image_url ? {
            backgroundImage: `linear-gradient(rgba(10,25,47,0.88), rgba(10,25,47,0.94)), url(${data.image_url})`,
            backgroundSize: "cover", backgroundPosition: "center",
          } : {}}
        >
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Left: content */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4a017] mb-4">Curs gratuit</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5 text-white">
                {headline}
              </h1>
              {subheadline && (
                <p className="text-lg text-white/75 mb-8 leading-relaxed">{subheadline}</p>
              )}
              {bullets.length > 0 && (
                <ul className="space-y-3">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/85">
                      <CheckCircle2 className="w-5 h-5 text-[#d4a017] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-[#0a192f] mb-2">Înscrie-te gratuit</h2>
              <p className="text-sm text-[#5a6a7a] mb-6">Completează formularul și primești acces imediat.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Numele tău"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg text-sm text-[#0a192f] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4a017]/40"
                />
                <div>
                  <input
                    type="email"
                    placeholder="Adresa ta de email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg text-sm text-[#0a192f] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4a017]/40"
                  />
                  {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="w-full h-12 bg-[#d4a017] hover:bg-[#c4911a] text-[#0a192f] font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>{cta} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
                <p className="text-xs text-center text-[#9ca3af]">
                  Fără spam. Te poți dezabona oricând.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Creator */}
        {data.creator_full_name && (
          <div className="bg-[#f3f1ec] border-t border-[#e8e4dc] px-4 py-10">
            <div className="max-w-5xl mx-auto flex items-center gap-5">
              {data.creator_avatar && (
                <img src={data.creator_avatar} alt={data.creator_full_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#d4a017]" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#d4a017] mb-0.5">Creat de</p>
                <p className="font-bold text-[#0a192f] text-lg">{data.creator_full_name}</p>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center py-5 text-xs text-[#5a6a7a] border-t border-[#e8e4dc] bg-[#fafaf8]">
          Curs creat cu{" "}
          <a href="https://www.docourse.ro" className="hover:underline text-[#0a192f]">DoCourse</a>
        </footer>
      </div>
    </>
  );
}
