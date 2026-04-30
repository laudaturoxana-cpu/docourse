"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Save, ExternalLink, Copy, CheckCheck, RefreshCw, Plus, Trash2, Magnet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

interface FunnelData {
  is_lead_magnet: boolean;
  lead_list_id: string | null;
  capture_headline: string | null;
  capture_subheadline: string | null;
  capture_bullets: string[];
  capture_cta: string | null;
  thankyou_headline: string | null;
  thankyou_message: string | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
}

export default function FunnelEditor() {
  const _params = useParams<{ courseId: string }>();
  const courseId = _params?.courseId;
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [funnel, setFunnel] = useState<FunnelData>({
    is_lead_magnet: false,
    lead_list_id: null,
    capture_headline: "",
    capture_subheadline: "",
    capture_bullets: ["", "", "", ""],
    capture_cta: "Vreau acces gratuit",
    thankyou_headline: "",
    thankyou_message: "",
  });
  const [emailLists, setEmailLists] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profile?.id || !courseId) return;

    Promise.all([
      supabase.from("courses")
        .select("id, title, slug, is_published, is_lead_magnet, lead_list_id, capture_headline, capture_subheadline, capture_bullets, capture_cta, thankyou_headline, thankyou_message")
        .eq("id", courseId)
        .eq("creator_id", profile.id)
        .single(),
      supabase.from("email_lists").select("id, name").eq("creator_id", profile.id).order("name"),
    ]).then(([{ data: courseData }, { data: lists }]) => {
      if (!courseData) { router.push("/dashboard/courses"); return; }
      setCourse({ id: courseData.id, title: courseData.title, slug: courseData.slug, is_published: courseData.is_published ?? false });
      setFunnel({
        is_lead_magnet: courseData.is_lead_magnet ?? false,
        lead_list_id: courseData.lead_list_id ?? null,
        capture_headline: courseData.capture_headline ?? "",
        capture_subheadline: courseData.capture_subheadline ?? "",
        capture_bullets: (courseData.capture_bullets as unknown as string[]) || ["", "", "", ""],
        capture_cta: courseData.capture_cta ?? "Vreau acces gratuit",
        thankyou_headline: courseData.thankyou_headline ?? "",
        thankyou_message: courseData.thankyou_message ?? "",
      });
      setEmailLists(lists || []);
      setIsLoading(false);
    });
  }, [profile?.id, courseId, router]);

  const handleGenerate = async () => {
    if (!course || !courseId) return;
    setIsGenerating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("generate-capture-page", {
      body: { course_id: course.id, lead_list_id: funnel.lead_list_id },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.data?.success) {
      const generated = {
        is_lead_magnet: true,
        lead_list_id: funnel.lead_list_id || null,
        capture_headline: res.data.capture_headline ?? funnel.capture_headline,
        capture_subheadline: res.data.capture_subheadline ?? funnel.capture_subheadline,
        capture_bullets: res.data.capture_bullets ?? funnel.capture_bullets,
        capture_cta: res.data.capture_cta ?? funnel.capture_cta ?? "Vreau acces gratuit",
        thankyou_headline: res.data.thankyou_headline ?? funnel.thankyou_headline,
        thankyou_message: res.data.thankyou_message ?? funnel.thankyou_message,
      };

      // Auto-save to DB immediately so the capture page is live.
      // Also set is_published=true — the RPC requires it, and a lead magnet must be accessible.
      const { error: saveError } = await supabase.from("courses").update({
        is_published: true,
        is_lead_magnet: true,
        lead_list_id: generated.lead_list_id,
        capture_headline: generated.capture_headline || null,
        capture_subheadline: generated.capture_subheadline || null,
        capture_bullets: (generated.capture_bullets as string[]).filter((b: string) => b.trim()),
        capture_cta: generated.capture_cta,
        thankyou_headline: generated.thankyou_headline || null,
        thankyou_message: generated.thankyou_message || null,
      }).eq("id", courseId);

      setCourse(c => c ? { ...c, is_published: true } : c);
      setFunnel(f => ({ ...f, ...generated }));

      if (saveError) {
        toast({ title: "Funnel generat!", description: "Salvarea automată a eșuat — apasă Salvează manual.", variant: "destructive" });
      } else {
        toast({ title: "Funnel generat și salvat!", description: "Pagina de captură este activă. Editează dacă vrei și salvează din nou." });
      }
    } else {
      toast({ title: "Eroare la generare", description: res.data?.error || "Încearcă din nou.", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const handleSave = async () => {
    if (!courseId) return;
    setIsSaving(true);
    const { error } = await supabase.from("courses").update({
      // If lead magnet is active, also publish the course so the capture page RPC finds it
      ...(funnel.is_lead_magnet && { is_published: true }),
      is_lead_magnet: funnel.is_lead_magnet,
      lead_list_id: funnel.lead_list_id || null,
      capture_headline: funnel.capture_headline || null,
      capture_subheadline: funnel.capture_subheadline || null,
      capture_bullets: funnel.capture_bullets.filter(b => b.trim()),
      capture_cta: funnel.capture_cta || "Vreau acces gratuit",
      thankyou_headline: funnel.thankyou_headline || null,
      thankyou_message: funnel.thankyou_message || null,
    }).eq("id", courseId);

    if (error) {
      toast({ title: "Eroare la salvare", description: error.message, variant: "destructive" });
    } else {
      if (funnel.is_lead_magnet) setCourse(c => c ? { ...c, is_published: true } : c);
      toast({ title: "Salvat!" });
    }
    setIsSaving(false);
  };

  const captureUrl = course ? `${window.location.origin}/capture/${course.slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(captureUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateBullet = (i: number, val: string) => {
    const b = [...funnel.capture_bullets];
    b[i] = val;
    setFunnel(f => ({ ...f, capture_bullets: b }));
  };

  const addBullet = () => setFunnel(f => ({ ...f, capture_bullets: [...f.capture_bullets, ""] }));
  const removeBullet = (i: number) => setFunnel(f => ({ ...f, capture_bullets: f.capture_bullets.filter((_, idx) => idx !== i) }));

  if (isLoading || authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <>


      <div className="min-h-screen bg-beige/20">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/courses/${courseId}`} className="text-muted-foreground hover:text-navy transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo size="sm" />
            <div className="hidden sm:block text-sm text-muted-foreground">
              <span className="text-navy font-medium">{course?.title}</span>
              <span className="mx-2">›</span>
              <span>Funnel Lead Magnet</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {funnel.is_lead_magnet && course && (
              <>
                <button onClick={copyLink} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy transition-colors border border-border rounded-lg px-3 py-2">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiat!" : "Copiază link"}
                </button>
                <a href={`/capture/${course.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy transition-colors border border-border rounded-lg px-3 py-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </a>
              </>
            )}
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-gold hover:bg-gold/90 text-navy font-semibold gap-1.5">
              <Save className="w-4 h-4" />
              {isSaving ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

          {/* Warning: course must be published */}
          {course && !course.is_published && funnel.is_lead_magnet && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Cursul nu este publicat</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Pagina de captură nu va fi accesibilă până când publici cursul.{" "}
                  <Link href={`/dashboard/courses/${courseId}`} className="underline font-medium">
                    Publică cursul din pagina de editare.
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Generate button */}
          <div className="bg-background rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Magnet className="w-5 h-5 text-gold" />
              <h2 className="font-semibold text-navy">Generează funnel cu AI</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-ul analizează cursul tău și creează automat textele pentru pagina de captură și pagina de mulțumire. Poți edita orice după generare.
            </p>

            {/* List selector */}
            <div className="mb-4">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">Listă de abonați</Label>
              <select
                className="w-full h-9 px-3 border border-input rounded-lg bg-background text-sm"
                value={funnel.lead_list_id || ""}
                onChange={e => setFunnel(f => ({ ...f, lead_list_id: e.target.value || null }))}
              >
                <option value="">Fără listă (lead-urile nu se salvează)</option>
                {emailLists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {emailLists.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  <Link href="/dashboard/email" className="text-gold hover:underline">Creează o listă în Email Marketing</Link> pentru a salva abonații.
                </p>
              )}
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-navy hover:bg-navy/90 text-white gap-2">
              {isGenerating
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Se generează (15-30 sec)...</>
                : <><Sparkles className="w-4 h-4" /> Generează funnel cu AI</>}
            </Button>
          </div>

          {/* Activate toggle */}
          <div className="bg-background rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-navy text-sm">Curs gratuit (lead magnet) activ</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pagina de captură este {funnel.is_lead_magnet ? "accesibilă public" : "inactivă"}</p>
              </div>
              <button
                onClick={() => setFunnel(f => ({ ...f, is_lead_magnet: !f.is_lead_magnet }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${funnel.is_lead_magnet ? "bg-gold" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${funnel.is_lead_magnet ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Capture page fields */}
          <div className="bg-background rounded-2xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-navy">Pagina de captură</h2>

            <div>
              <Label>Titlu principal (headline)</Label>
              <Input value={funnel.capture_headline || ""} onChange={e => setFunnel(f => ({ ...f, capture_headline: e.target.value }))}
                placeholder="ex: Descoperă secretul afacerilor de succes cu AI" className="mt-1.5" />
            </div>

            <div>
              <Label>Subtitlu</Label>
              <Input value={funnel.capture_subheadline || ""} onChange={e => setFunnel(f => ({ ...f, capture_subheadline: e.target.value }))}
                placeholder="ex: Cursul gratuit pentru antreprenori care vor să crească cu AI" className="mt-1.5" />
            </div>

            <div>
              <Label className="mb-2 block">Beneficii (bullets)</Label>
              <div className="space-y-2">
                {funnel.capture_bullets.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={b} onChange={e => updateBullet(i, e.target.value)}
                      placeholder={`Beneficiu ${i + 1}`} />
                    <button onClick={() => removeBullet(i)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addBullet} className="mt-2 flex items-center gap-1.5 text-sm text-gold hover:underline">
                <Plus className="w-3.5 h-3.5" /> Adaugă beneficiu
              </button>
            </div>

            <div>
              <Label>Text buton (CTA)</Label>
              <Input value={funnel.capture_cta || ""} onChange={e => setFunnel(f => ({ ...f, capture_cta: e.target.value }))}
                placeholder="ex: Vreau acces gratuit" className="mt-1.5" />
            </div>
          </div>

          {/* Thank you page fields */}
          <div className="bg-background rounded-2xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-navy">Pagina de mulțumire</h2>

            <div>
              <Label>Titlu pagina de mulțumire</Label>
              <Input value={funnel.thankyou_headline || ""} onChange={e => setFunnel(f => ({ ...f, thankyou_headline: e.target.value }))}
                placeholder="ex: Felicitări! Ești înscris!" className="mt-1.5" />
            </div>

            <div>
              <Label>Mesaj de mulțumire</Label>
              <textarea
                value={funnel.thankyou_message || ""}
                onChange={e => setFunnel(f => ({ ...f, thankyou_message: e.target.value }))}
                placeholder="ex: Mulțumim că te-ai înscris! Accesul tău la curs este gata..."
                className="w-full mt-1.5 px-3 py-2 border border-input rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
                rows={4}
              />
            </div>
          </div>

          {/* Preview link */}
          {funnel.is_lead_magnet && course && (
            <div className="bg-gold/5 border border-gold/30 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-navy mb-1">Link pagina de captură</p>
                <p className="text-xs text-muted-foreground font-mono break-all">{captureUrl}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={copyLink} className="flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 py-2 hover:bg-beige/50 transition-colors">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a href={`/capture/${course.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-gold text-navy font-semibold rounded-lg px-3 py-2 hover:bg-gold/90 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Deschide
                </a>
              </div>
            </div>
          )}

          <div className="pb-8 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="bg-gold hover:bg-gold/90 text-navy font-semibold gap-2 px-8">
              <Save className="w-4 h-4" />
              {isSaving ? "Se salvează..." : "Salvează tot"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
