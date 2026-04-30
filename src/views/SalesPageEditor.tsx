"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Save,
  ExternalLink,
  Copy,
  CheckCheck,
  Zap,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

type CTAType = "stripe" | "calendly" | "whatsapp";

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

interface SalesPage {
  id: string;
  slug: string;
  headline: string | null;
  subheadline: string | null;
  body_html: string | null;
  cta_type: CTAType;
  cta_url: string | null;
  cta_label: string | null;
  price_text: string | null;
  course_image_url: string | null;
  creator_avatar_url: string | null;
  creator_name: string | null;
  is_published: boolean;
  generated_at: string | null;
  brand_colors: Record<string, string> | null;
  font_style: string | null;
  avatar_summary: string | null;
  testimonials: Testimonial[] | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

const CTA_OPTIONS: { value: CTAType; label: string; placeholder: string }[] = [
  {
    value: "stripe",
    label: "Link de plată Stripe",
    placeholder: "https://buy.stripe.com/...",
  },
  {
    value: "calendly",
    label: "Link Calendly",
    placeholder: "https://calendly.com/...",
  },
  {
    value: "whatsapp",
    label: "Număr WhatsApp",
    placeholder: "40712345678",
  },
];

const SalesPageEditor = () => {
  const _params = useParams<{ courseId: string }>();
  const courseId = _params?.courseId;
  const router = useRouter();
  const { user } = useAuth();
  const { isPro, hasActiveSubscription, isLoading: subLoading } = useSubscriptionCheck();

  const [course, setCourse] = useState<Course | null>(null);
  const [salesPage, setSalesPage] = useState<SalesPage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [ctaType, setCtaType] = useState<CTAType>("stripe");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Înscrie-te acum");
  const [priceText, setPriceText] = useState("");
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [creatorAvatarUrl, setCreatorAvatarUrl] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [brandColors, setBrandColors] = useState<Record<string, string> | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !courseId) return;
    loadData();
  }, [user, courseId]);

  const GENERATING_STEPS = [
    "Analizează cursul și identifică avatarul ideal...",
    "Alege psihologia culorilor potrivită pentru public...",
    "Scrie headline-ul și subheadline-ul...",
    "Redactează textul de vânzare (5.000+ cuvinte)...",
    "Structurează obiecțiile și secțiunea de instructor...",
    "Finalizează pagina și salvează...",
  ];

  useEffect(() => {
    if (!isGenerating) {
      setGeneratingStep(0);
      return;
    }
    setGeneratingStep(0);
    const intervals = GENERATING_STEPS.map((_, i) =>
      setTimeout(() => setGeneratingStep(i), i * 8000)
    );
    return () => intervals.forEach(clearTimeout);
  }, [isGenerating]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title, slug")
        .eq("id", courseId ?? "")
        .eq("creator_id", user!.id)
        .single();

      if (!courseData) {
        router.push("/dashboard/courses");
        return;
      }
      setCourse(courseData);

      const { data: spData } = await supabase
        .from("sales_pages")
        .select("*")
        .eq("course_id", courseId ?? "")
        .eq("creator_id", user!.id)
        .maybeSingle();

      if (spData) {
        setSalesPage(spData as unknown as SalesPage);
        setHeadline(spData.headline || "");
        setSubheadline(spData.subheadline || "");
        setBodyHtml(spData.body_html || "");
        setCtaType((spData.cta_type as CTAType) || "stripe");
        setCtaUrl(spData.cta_url || "");
        setCtaLabel(spData.cta_label || "Înscrie-te acum");
        setPriceText(spData.price_text || "");
        setCourseImageUrl(spData.course_image_url || "");
        setCreatorAvatarUrl(spData.creator_avatar_url || "");
        setCreatorName(spData.creator_name || "");
        setIsPublished(spData.is_published || false);
        if (spData.brand_colors) setBrandColors(spData.brand_colors as Record<string, string>);
        if (spData.testimonials) setTestimonials(spData.testimonials as unknown as Testimonial[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!isPro) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sales-page", {
        body: { courseId },
      });

      if (error || data?.error) {
        const raw = data?.error || "";
        const is503 = typeof raw === "string"
          ? raw.includes("503") || raw.includes("UNAVAILABLE") || raw.includes("high demand")
          : false;
        toast({
          title: "Eroare la generare",
          description: is503
            ? "AI-ul este suprasolicitat momentan. Încearcă din nou în câteva secunde."
            : raw || "Nu s-a putut genera pagina. Încearcă din nou.",
          variant: "destructive",
        });
        return;
      }

      const sp = data.salesPage;
      setSalesPage(sp);
      setHeadline(sp.headline || "");
      setSubheadline(sp.subheadline || "");
      setBodyHtml(sp.body_html || "");
      if (sp.course_image_url) setCourseImageUrl(sp.course_image_url);
      if (sp.creator_avatar_url) setCreatorAvatarUrl(sp.creator_avatar_url);
      if (sp.creator_name) setCreatorName(sp.creator_name);
      if (sp.brand_colors) setBrandColors(sp.brand_colors as Record<string, string>);
      toast({
        title: "Pagina a fost generată!",
        description: "Poți edita textul și apoi să o publici.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (publishOverride?: boolean) => {
    if (!course || !user) return;
    setIsSaving(true);
    const publishValue = publishOverride !== undefined ? publishOverride : isPublished;
    try {
      const salesSlug = course.slug + "-sales";
      const payload = {
        course_id: courseId ?? "",
        creator_id: user.id,
        slug: salesSlug,
        headline,
        subheadline,
        body_html: bodyHtml,
        cta_type: ctaType,
        cta_url: ctaUrl,
        cta_label: ctaLabel,
        price_text: priceText || null,
        course_image_url: courseImageUrl || null,
        creator_avatar_url: creatorAvatarUrl || null,
        creator_name: creatorName || null,
        brand_colors: brandColors || null,
        testimonials: testimonials.length > 0 ? testimonials : null,
        is_published: publishValue,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("sales_pages")
        .upsert(payload, { onConflict: "slug" })
        .select()
        .single();

      if (error) throw error;
      setSalesPage(data);
      toast({ title: "Salvat!", description: "Modificările au fost salvate." });
    } catch (err: any) {
      toast({ title: "Eroare", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    const newPublished = !isPublished;
    setIsPublished(newPublished);
    await handleSave(newPublished);
  };

  const publicUrl = salesPage ? `https://www.docourse.ro/sales/${salesPage.slug}` : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (subLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b px-6 py-4">
          <Link href="/dashboard/courses"><Logo /></Link>
        </header>
        <div className="max-w-lg mx-auto mt-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Funcție Pro</h1>
          <p className="text-muted-foreground mb-8">
            Sales page-ul generat cu AI este disponibil doar în planul Pro (29€/lună).
            Treci la Pro și beneficiezi de o pagină de vânzări profesională pentru fiecare curs.
          </p>
          <Link href="/pricing">
            <Button variant="hero" size="lg">
              <Zap className="mr-2 w-4 h-4" />
              Upgrade la Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      

      

      <div className="min-h-screen bg-background">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/courses/${courseId}`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">
              <Zap className="w-3 h-3" />
              Pro
            </span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-navy mb-1">Sales Page</h1>
            <p className="text-muted-foreground text-sm">
              {course?.title} — pagină de vânzări generată cu AI
            </p>
          </div>

          {/* Generate button */}
          <Card className="mb-8 border-gold/30 bg-gold/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-navy mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    Generează cu AI
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI-ul analizează structura cursului tău și scrie texte de vânzare în română.
                    {salesPage?.generated_at && (
                      <span className="ml-1 text-xs">
                        (ultima generare: {new Date(salesPage.generated_at).toLocaleDateString("ro-RO")})
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gold hover:bg-gold/90 text-navy font-semibold whitespace-nowrap"
                >
                  <Sparkles className="mr-2 w-4 h-4" />
                  {salesPage ? "Regenerează" : "Generează acum"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Generating Banner */}
          {isGenerating && (
            <div className="mb-6 bg-navy text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <RefreshCw className="w-8 h-8 animate-spin text-gold" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">AI-ul lucrează la pagina ta...</p>
                <p className="text-beige/80 text-sm">{GENERATING_STEPS[generatingStep]}</p>
                <p className="text-beige/50 text-xs mt-2">Generarea durează 30–90 de secunde. Nu închide pagina.</p>
              </div>
            </div>
          )}

          {/* Brand colors editor */}
          {salesPage && !isGenerating && (
            <Card className="mb-6 border-navy/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Culori brand</CardTitle>
                <CardDescription>
                  {salesPage.avatar_summary
                    ? salesPage.avatar_summary
                    : "Generează pagina cu AI pentru a obține o paletă personalizată."}
                  {brandColors && " Poți modifica orice culoare și salva."}
                </CardDescription>
              </CardHeader>
              {brandColors && (
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { key: "primary", label: "Principală" },
                      { key: "primary_light", label: "Principală deschis" },
                      { key: "accent", label: "Accent / CTA" },
                      { key: "accent_text", label: "Text pe CTA" },
                      { key: "body_bg", label: "Fundal pagină" },
                      { key: "section_alt_bg", label: "Fundal secțiuni" },
                      { key: "text_primary", label: "Text principal" },
                      { key: "text_muted", label: "Text secundar" },
                    ] as { key: string; label: string }[]).map(({ key, label }) => {
                      const val = brandColors[key] || "#ffffff";
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <label className="text-xs text-muted-foreground">{label}</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={val.startsWith("#") && val.length === 7 ? val : "#ffffff"}
                              onChange={(e) => setBrandColors(prev => ({ ...(prev || {}), [key]: e.target.value }))}
                              className="w-8 h-8 rounded cursor-pointer border border-border p-0.5 bg-transparent"
                            />
                            <input
                              type="text"
                              value={val}
                              maxLength={7}
                              onChange={(e) => setBrandColors(prev => ({ ...(prev || {}), [key]: e.target.value }))}
                              className="flex-1 text-xs font-mono border border-border rounded px-2 py-1.5 bg-background"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Modifică culorile și apasă <strong>Salvează</strong> — se aplică instant pe pagina publică.</p>
                </CardContent>
              )}
            </Card>
          )}

          {/* Testimoniale */}
          {salesPage && !isGenerating && (
            <Card className="mb-6 border-navy/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Testimoniale reale</CardTitle>
                <CardDescription>
                  Adaugă testimoniale de la cursanți — apar automat pe pagina de vânzări în locul celor generate de AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testimonials.map((t, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-navy">Testimonial {i + 1}</span>
                      <button
                        onClick={() => setTestimonials(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Șterge
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Nume</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={e => setTestimonials(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                          placeholder="Maria Ionescu"
                          className="w-full mt-1 text-sm border border-border rounded px-3 py-1.5 bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Ocupație</label>
                        <input
                          type="text"
                          value={t.role}
                          onChange={e => setTestimonials(prev => prev.map((x, idx) => idx === i ? { ...x, role: e.target.value } : x))}
                          placeholder="Antreprenor, București"
                          className="w-full mt-1 text-sm border border-border rounded px-3 py-1.5 bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Testimonial</label>
                      <textarea
                        value={t.text}
                        onChange={e => setTestimonials(prev => prev.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))}
                        placeholder="Scrie ce a spus cursantul..."
                        rows={3}
                        className="w-full mt-1 text-sm border border-border rounded px-3 py-1.5 bg-background resize-none"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setTestimonials(prev => [...prev, { name: "", role: "", text: "" }])}
                  className="w-full border-2 border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:border-navy/30 hover:text-navy transition-colors"
                >
                  + Adaugă testimonial
                </button>
                {testimonials.length > 0 && (
                  <Button
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="w-full bg-navy hover:bg-navy/90 text-white"
                  >
                    <Save className="mr-2 w-4 h-4" />
                    {isSaving ? "Se salvează..." : "Salvează testimonialele"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Titlu și subtitlu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Headline (titlu principal)</Label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Titlul care atrage atenția..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Subheadline (subtitlu)</Label>
                  <Input
                    value={subheadline}
                    onChange={(e) => setSubheadline(e.target.value)}
                    placeholder="Beneficiul principal în câteva cuvinte..."
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Corpul paginii</CardTitle>
                <CardDescription>Editează textul direct — bold, titluri, liste, orice.</CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={bodyHtml}
                  onChange={setBodyHtml}
                  placeholder="Textul paginii de vânzări apare aici după generare..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buton de acțiune (CTA)</CardTitle>
                <CardDescription>Ce se întâmplă când un cursant apasă butonul</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tip CTA</Label>
                  <div className="grid grid-cols-3 gap-3 mt-1.5">
                    {CTA_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCtaType(opt.value)}
                        className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          ctaType === opt.value
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-muted-foreground hover:border-gold/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>
                    {ctaType === "whatsapp" ? "Număr de telefon (fără +)" : "URL"}
                  </Label>
                  <Input
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder={CTA_OPTIONS.find((o) => o.value === ctaType)?.placeholder}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Textul butonului</Label>
                  <Input
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Înscrie-te acum"
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Price + Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preț, imagini și instructor</CardTitle>
                <CardDescription>Afișate pe pagina publică. Imaginile sunt preluate automat la generare, le poți modifica oricând.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>Preț afișat</Label>
                  <Input
                    value={priceText}
                    onChange={(e) => setPriceText(e.target.value)}
                    placeholder="ex: 297€, 997 lei, Gratuit"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Text liber — scrie exact ce vrei să apară pe pagină</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Imagine copertă curs</Label>
                    {courseImageUrl && (
                      <img src={courseImageUrl} alt="Cover" className="mt-1.5 w-full h-28 object-cover rounded-lg border border-border mb-2" />
                    )}
                    <Input
                      value={courseImageUrl}
                      onChange={(e) => setCourseImageUrl(e.target.value)}
                      placeholder="URL imagine curs"
                      className="mt-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <Label>Poza instructorului</Label>
                    {creatorAvatarUrl && (
                      <img src={creatorAvatarUrl} alt="Avatar" className="mt-1.5 w-16 h-16 object-cover rounded-full border border-border mb-2" />
                    )}
                    <Input
                      value={creatorAvatarUrl}
                      onChange={(e) => setCreatorAvatarUrl(e.target.value)}
                      placeholder="URL poză instructor"
                      className="mt-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label>Numele instructorului</Label>
                  <Input
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Numele tău complet"
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Publish & URL */}
            {salesPage && (
              <Card className="border-navy/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-navy mb-1">URL public</p>
                      <p className="text-sm text-muted-foreground font-mono break-all">{publicUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyUrl}>
                        {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => handleSave()}
                disabled={isSaving}
                className="flex-1 bg-navy hover:bg-navy/90 text-white"
              >
                <Save className="mr-2 w-4 h-4" />
                {isSaving ? "Se salvează..." : "Salvează"}
              </Button>

              {salesPage && (
                <Button
                  onClick={async () => {
                    const newPublished = !isPublished;
                    setIsPublished(newPublished);
                    await handleSave(newPublished);
                  }}
                  variant="outline"
                  className={`flex-1 ${isPublished ? "border-red-300 text-red-600 hover:bg-red-50" : "border-green-300 text-green-700 hover:bg-green-50"}`}
                >
                  {isPublished ? (
                    <>
                      <EyeOff className="mr-2 w-4 h-4" />
                      Dezpublică
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 w-4 h-4" />
                      Publică pagina
                    </>
                  )}
                </Button>
              )}
            </div>

            {isPublished && salesPage && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
                <CheckCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Pagina este publicată la{" "}
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                    {publicUrl}
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesPageEditor;
