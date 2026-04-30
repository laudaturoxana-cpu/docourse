"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  LogOut,
  Key,
  Mail,
  CheckCircle2,
  Loader2,
  ChevronRight,
  LayoutDashboard,
  Play,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface EnrolledCourse {
  course_id: string;
  course_title: string;
  course_slug: string;
  course_image: string | null;
  requires_login: boolean;
  enrolled_at: string;
  last_accessed_at: string | null;
  // progres calculat local
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface CreatorCommunity {
  id: string;
  name: string;
  slug: string;
}

const StudentDashboard = () => {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [communities, setCommunities] = useState<CreatorCommunity[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Email change state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailChangeSent, setEmailChangeSent] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/student-login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoadingCourses(true);
      try {
        // Cursuri înscrise (via enrollments) + progres calculat
        const { data: enrolledData } = await (supabase as any)
          .rpc("get_my_enrolled_courses");

        if (enrolledData && Array.isArray(enrolledData) && enrolledData.length > 0) {
          const coursesWithProgress = await Promise.all(
            (enrolledData as Array<{ course_id: string; course_title: string; course_slug: string; course_image: string | null; requires_login: boolean; enrolled_at: string; last_accessed_at: string | null }>).map(async (ec) => {
              // Calculăm progresul via RPC (bypass RLS pe modules/lessons)
              const { data: progressData } = await (supabase as any)
                .rpc('get_course_progress_for_student', {
                  _user_id: user.id,
                  _course_id: ec.course_id,
                });

              const progressRow = progressData?.[0] as { total_lessons: number; completed_lessons: number } | undefined;
              const totalLessons = Number(progressRow?.total_lessons) || 0;
              const completed = Number(progressRow?.completed_lessons) || 0;
              const progress = totalLessons > 0
                ? Math.round((completed / totalLessons) * 100)
                : 0;

              return {
                course_id: ec.course_id,
                course_title: ec.course_title,
                course_slug: ec.course_slug,
                course_image: ec.course_image,
                requires_login: ec.requires_login,
                enrolled_at: ec.enrolled_at,
                last_accessed_at: ec.last_accessed_at,
                progress,
                completedLessons: completed,
                totalLessons,
              };
            })
          );
          setCourses(coursesWithProgress);
        } else {
          // Fallback: arată cursuri din lesson_progress (pentru utilizatori fără enrollments)
          const { data: progressData } = await supabase
            .from("lesson_progress")
            .select("course_id")
            .eq("user_id", user.id);

          if (progressData && progressData.length > 0) {
            const courseIds = [...new Set(progressData.map((p) => p.course_id).filter((id): id is string => id !== null))];
            const { data: coursesData } = await supabase
              .from("courses")
              .select("id, title, slug, image_url")
              .in("id", courseIds)
              .eq("is_published", true);

            if (coursesData) {
              const coursesWithProgress = await Promise.all(
                coursesData.map(async (course) => {
                  const { data: modulesData } = await supabase
                    .from("modules").select("id").eq("course_id", course.id);
                  const moduleIds = modulesData?.map((m) => m.id) || [];
                  let totalLessons = 0;
                  if (moduleIds.length > 0) {
                    const { count } = await supabase
                      .from("lessons").select("id", { count: "exact", head: true }).in("module_id", moduleIds);
                    totalLessons = count || 0;
                  }
                  const { count: completedLessons } = await supabase
                    .from("lesson_progress").select("id", { count: "exact", head: true })
                    .eq("user_id", user.id).eq("course_id", course.id).eq("status", "completed");
                  const completed = completedLessons || 0;
                  return {
                    course_id: course.id,
                    course_title: course.title,
                    course_slug: course.slug,
                    course_image: course.image_url,
                    requires_login: false,
                    enrolled_at: new Date().toISOString(),
                    last_accessed_at: null,
                    progress: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
                    completedLessons: completed,
                    totalLessons,
                  };
                })
              );
              setCourses(coursesWithProgress);
            }
          }
        }

        // Verifică dacă utilizatorul are cont de creator (role = 'creator')
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .eq("role", "creator")
          .maybeSingle();
        if (profileData) setIsCreator(true);

        // Comunități din noul sistem (creator_communities unde user e membru)
        const { data: membershipData } = await supabase
          .from("community_memberships")
          .select("community_id, creator_communities(id, name, slug)")
          .eq("user_id", user.id);

        if (membershipData) {
          const comms: CreatorCommunity[] = membershipData
            .map((m: any) => m.creator_communities)
            .filter(Boolean)
            .map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));
          setCommunities(comms);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Introdu o adresă de email validă.");
      return;
    }
    if (newEmail === user?.email) {
      toast.error("Acesta este deja emailul tău curent.");
      return;
    }

    setIsSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailChangeSent(true);
      setShowEmailForm(false);
      setNewEmail("");
      toast.success("Email de confirmare trimis! Verifică noul email și apasă linkul de confirmare.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error(`Eroare: ${msg}`);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Parolele nu coincid.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success("Parola a fost schimbată cu succes!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error(`Eroare: ${msg}`);
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      

      

      <div className="min-h-screen bg-beige/20">
        {/* Header */}
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <Logo size="sm" />
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Ieși din cont</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Welcome */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <LayoutDashboard className="w-5 h-5 text-gold" />
              <h1 className="text-2xl font-bold text-navy">Contul meu</h1>
            </div>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          {/* Banner creator */}
          {isCreator && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gold/10 border border-gold/30 rounded-xl px-4 py-3">
              <p className="text-sm text-navy">
                Ai și un cont de creator pe această platformă.
              </p>
              <Link href="/dashboard"
                className="text-sm font-medium text-gold hover:underline sm:ml-4 flex-shrink-0"
              >
                Mergi la Dashboard creator →
              </Link>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Courses + Communities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Courses */}
              <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-5 h-5 text-gold" />
                  <h2 className="text-lg font-semibold text-navy">Cursurile mele</h2>
                </div>

                {loadingCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-navy mb-2">Niciun curs accesat încă</p>
                    <p className="text-sm text-muted-foreground">
                      Folosește link-ul primit de la creator pentru a accesa primul tău curs.
                      Cursul va apărea automat aici după prima vizită.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => {
                      const hasLastLesson = !!localStorage.getItem(`docourse_last_lesson_${course.course_id}`);
                      return (
                        <Link key={course.course_id}
                          href={`/course/${course.course_slug}`}
                          className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-gold/40 hover:bg-beige/20 transition-all group"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-lg bg-beige flex-shrink-0 overflow-hidden">
                            {course.course_image ? (
                              <img
                                src={course.course_image}
                                alt={course.course_title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-navy truncate group-hover:text-gold transition-colors">
                              {course.course_title}
                            </p>
                            {hasLastLesson && course.progress < 100 && (
                              <p className="text-xs text-gold flex items-center gap-1 mt-0.5">
                                <Play className="w-3 h-3" />
                                Continuă de unde ai rămas
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={course.progress} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {course.progress}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {course.completedLessons} din {course.totalLessons} lecții completate
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-gold transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Communities */}
              {communities.length > 0 && (
                <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Users className="w-5 h-5 text-gold" />
                    <h2 className="text-lg font-semibold text-navy">Comunitățile mele</h2>
                  </div>
                  <div className="space-y-3">
                    {communities.map((community) => (
                      <Link key={community.id}
                        href={`/community/${community.slug}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-gold/40 hover:bg-beige/20 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gold" />
                          </div>
                          <span className="font-medium text-navy group-hover:text-gold transition-colors">
                            {community.name}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Account settings */}
            <div className="space-y-6">
              <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Key className="w-5 h-5 text-gold" />
                  <h2 className="text-lg font-semibold text-navy">Contul meu</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-medium text-navy break-all">{user.email}</p>
                    {emailChangeSent && (
                      <p className="text-xs text-green-600 mt-1">
                        Confirmare trimisă la noul email!
                      </p>
                    )}
                  </div>

                  {/* Schimbă emailul */}
                  {showEmailForm ? (
                    <form onSubmit={handleChangeEmail} className="space-y-3 pt-3 border-t border-border">
                      <p className="text-sm font-medium text-navy">Schimbă emailul</p>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-email-student" className="text-xs">Email nou</Label>
                        <Input
                          id="new-email-student"
                          type="email"
                          placeholder="email@exemplu.ro"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          disabled={isSavingEmail}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          className="flex-1"
                          disabled={isSavingEmail || !newEmail}
                        >
                          {isSavingEmail ? (
                            <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Se trimite...</>
                          ) : (
                            "Trimite confirmare"
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => { setShowEmailForm(false); setNewEmail(""); }}
                          disabled={isSavingEmail}
                        >
                          Anulează
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowEmailForm(true)}
                      >
                        <Mail className="w-3.5 h-3.5 mr-2" />
                        Schimbă emailul
                      </Button>
                    </div>
                  )}

                  {/* Change password */}
                  {showPasswordForm ? (
                    <form onSubmit={handleChangePassword} className="space-y-3 pt-3 border-t border-border">
                      <p className="text-sm font-medium text-navy">Schimbă parola</p>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-password" className="text-xs">Parolă nouă</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Minim 8 caractere"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isSavingPassword}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-xs">Confirmă parola</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Repetă parola nouă"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isSavingPassword}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          className="flex-1"
                          disabled={isSavingPassword || !newPassword || !confirmPassword}
                        >
                          {isSavingPassword ? (
                            <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Se salvează...</>
                          ) : (
                            <><CheckCircle2 className="w-3 h-3 mr-1.5" />Salvează</>
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword(""); }}
                          disabled={isSavingPassword}
                        >
                          Anulează
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowPasswordForm(true)}
                      >
                        <Key className="w-3.5 h-3.5 mr-2" />
                        Schimbă parola
                      </Button>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Ieși din cont
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StudentDashboard;
