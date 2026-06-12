"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Save, ExternalLink, Copy, CheckCheck, ArrowLeft, Lock, Unlock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

interface Community {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
}

interface Course {
  id: string;
  title: string;
  is_published: boolean;
}

interface CourseSetting {
  course_id: string;
  access_type: "free" | "paid";
  enabled: boolean;
}

export default function CreatorCommunityDashboard() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseSettings, setCourseSettings] = useState<Record<string, CourseSetting>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    if (!profile?.id) return;

    const load = async () => {
      const [{ data: comm }, { data: myCoursesData }, { data: settingsData }] = await Promise.all([
        supabase.from("creator_communities").select("*").eq("creator_id", user.id).maybeSingle(),
        supabase.from("courses").select("id, title, is_published").eq("creator_id", profile.id).eq("is_published", true).order("title"),
        supabase.from("community_course_settings").select("*"),
      ]);

      if (comm) {
        setCommunity(comm as Community);
        setName(comm.name);
        setDescription(comm.description || "");
        setSlug(comm.slug);

        const settingsMap: Record<string, CourseSetting> = {};
        (myCoursesData || []).forEach((c) => {
          const existing = (settingsData || []).find((s: { community_id: string; course_id: string; access_type?: string }) => s.community_id === comm.id && s.course_id === c.id);
          settingsMap[c.id] = {
            course_id: c.id,
            access_type: (existing?.access_type ?? "free") as "free" | "paid",
            enabled: !!existing,
          };
        });
        setCourseSettings(settingsMap);
      }

      setCourses((myCoursesData || []).map(c => ({ ...c, is_published: c.is_published ?? false })));
      setIsLoading(false);
    };

    load();
  }, [user, profile?.id]);

  const generateSlug = (n: string) =>
    n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim() || !user) return;
    setIsCreating(true);
    const { data, error } = await supabase.from("creator_communities").insert({
      creator_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      slug: slug.trim(),
    }).select().single();

    if (error) {
      toast({ title: "Eroare", description: error.message.includes("unique") ? "Acest slug e deja folosit. Alege altul." : error.message, variant: "destructive" });
    } else {
      setCommunity(data as Community);
      toast({ title: "Comunitate creată!" });
    }
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!community || !user) return;
    setIsSaving(true);

    const { error } = await supabase.from("creator_communities").update({
      name: name.trim(),
      description: description.trim() || null,
      slug: slug.trim(),
    }).eq("id", community.id);

    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
      setIsSaving(false);
      return;
    }

    // Sync course settings
    const enabledCourses = Object.values(courseSettings).filter((s) => s.enabled);
    const disabledCourseIds = Object.values(courseSettings).filter((s) => !s.enabled).map((s) => s.course_id);

    if (disabledCourseIds.length > 0) {
      await supabase.from("community_course_settings")
        .delete()
        .eq("community_id", community.id)
        .in("course_id", disabledCourseIds);
    }

    for (const s of enabledCourses) {
      await supabase.from("community_course_settings").upsert({
        community_id: community.id,
        course_id: s.course_id,
        access_type: s.access_type,
      }, { onConflict: "community_id,course_id" });

      // Cursanții care au cumpărat deja acest curs primesc acces instant la comunitate
      if (s.access_type === "paid") {
        // Supabase generic mismatch — RPC nu e încă în tipurile generate
        await (supabase.rpc as unknown as (fn: string, args: Record<string, string>) => Promise<unknown>)(
          "grant_community_access_for_paid_course",
          { _community_id: community.id, _course_id: s.course_id }
        );
      }
    }

    setCommunity((c) => c ? { ...c, name: name.trim(), description: description.trim() || null, slug: slug.trim() } : c);
    toast({ title: "Salvat!" });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!community) return;
    const confirmed = window.confirm(
      `Sigur vrei să ștergi comunitatea „${community.name}"? Postările, comentariile și membrii vor fi șterse definitiv. Nu se poate anula.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    const { error } = await supabase.from("creator_communities").delete().eq("id", community.id);

    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
      setIsDeleting(false);
      return;
    }

    setCommunity(null);
    setName("");
    setDescription("");
    setSlug("");
    setCourseSettings({});
    toast({ title: "Comunitate ștearsă" });
    setIsDeleting(false);
  };

  const toggleCourse = (courseId: string) => {
    setCourseSettings((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], enabled: !prev[courseId]?.enabled },
    }));
  };

  const toggleAccessType = (courseId: string) => {
    setCourseSettings((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        access_type: prev[courseId]?.access_type === "free" ? "paid" : "free",
      },
    }));
  };

  const communityUrl = community ? `${window.location.origin}/community/${community.slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(communityUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-beige/20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-beige/20">
        <header className="bg-white border-b border-border/60 shadow-sm px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
          <Link href="/dashboard" className="text-muted-foreground hover:text-navy transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Logo size="sm" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-gold" />
            <span className="text-navy font-medium">Comunitate</span>
          </div>
        </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-navy">Comunitate</h1>
        </div>

        {!community ? (
          /* ── Create community ── */
          <div className="bg-white rounded-2xl border border-border p-8 space-y-5">
            <div>
              <h2 className="font-semibold text-navy text-lg mb-1">Creează comunitatea ta</h2>
              <p className="text-sm text-muted-foreground">O singură comunitate per cont. Membrii vor vedea feed-ul și cursurile tale.</p>
            </div>

            <div>
              <Label>Numele comunității</Label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); if (!slug) setSlug(generateSlug(e.target.value)); }}
                placeholder="ex: Comunitatea Roxana Lăudatu"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Descriere (opțional)</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ce vor găsi membrii în această comunitate..."
                className="w-full mt-1.5 px-3 py-2 border border-input rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
                rows={3}
              />
            </div>
            <div>
              <Label>URL comunitate</Label>
              <div className="flex items-center mt-1.5">
                <span className="text-sm text-muted-foreground bg-muted px-3 h-9 flex items-center rounded-l-lg border border-r-0 border-input">
                  docourse.ro/community/
                </span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="slug-uri"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <Button onClick={handleCreate} disabled={isCreating || !name.trim() || !slug.trim()} className="w-full bg-navy hover:bg-navy/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              {isCreating ? "Se creează..." : "Creează comunitatea"}
            </Button>
          </div>
        ) : (
          <>
            {/* ── Community link bar ── */}
            <div className="bg-gold/5 border border-gold/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Link comunitate</p>
                <p className="text-sm font-mono text-navy truncate">{communityUrl}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={copyLink} className="flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 py-2 hover:bg-beige/50 transition-colors">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a href={`/community/${community.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-gold text-navy font-semibold rounded-lg px-3 py-2 hover:bg-gold/90 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Deschide
                </a>
              </div>
            </div>

            {/* ── Settings ── */}
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-5">
              <h2 className="font-semibold text-navy">Setări comunitate</h2>

              <div>
                <Label>Numele comunității</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Descriere</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 border border-input rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
                  rows={3}
                />
              </div>
              <div>
                <Label>URL (slug)</Label>
                <div className="flex items-center mt-1.5">
                  <span className="text-sm text-muted-foreground bg-muted px-3 h-9 flex items-center rounded-l-lg border border-r-0 border-input">
                    docourse.ro/community/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>

            {/* ── Courses ── */}
            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6">
              <h2 className="font-semibold text-navy mb-1">Cursuri în comunitate</h2>
              <p className="text-sm text-muted-foreground mb-5">Bifează cursurile pe care vrei să le afișezi. Alege dacă accesul e gratuit sau cu plată.</p>

              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nu ai cursuri publicate încă. <Link href="/dashboard/courses" className="text-gold hover:underline">Creează un curs.</Link></p>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => {
                    const s = courseSettings[course.id] ?? { course_id: course.id, access_type: "free", enabled: false };
                    return (
                      <div key={course.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${s.enabled ? "border-gold/40 bg-gold/5" : "border-border bg-background"}`}>
                        <input
                          type="checkbox"
                          checked={s.enabled}
                          onChange={() => toggleCourse(course.id)}
                          className="w-4 h-4 accent-gold"
                        />
                        <span className="flex-1 text-sm font-medium text-navy">{course.title}</span>
                        {s.enabled && (
                          <button
                            onClick={() => toggleAccessType(course.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              s.access_type === "free"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            {s.access_type === "free" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {s.access_type === "free" ? "Gratuit" : "Cu plată"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pb-8">
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Se șterge..." : "Șterge comunitatea"}
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-gold hover:bg-gold/90 text-navy font-semibold gap-2 px-8">
                <Save className="w-4 h-4" />
                {isSaving ? "Se salvează..." : "Salvează"}
              </Button>
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}
