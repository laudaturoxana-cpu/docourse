"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import {
  BookOpen,
  Menu,
  ArrowRight,
  Users,
  TrendingUp,
  GraduationCap,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
const DashboardChart = dynamic(() => import("@/components/DashboardChart"), {
  ssr: false,
  loading: () => <div className="h-48 bg-muted/30 animate-pulse rounded-xl" />,
});
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  students: number;
  avgProgress: number;
}

interface ChartPoint {
  name: string;
  cursanți: number;
}

interface DropoffLesson {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  completionRate: number; // % din cei înscriși care au finalizat lecția
  reached: number;        // câți au ajuns la ea
  enrolled: number;       // total înscriși în curs
}

interface StatCardProps {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  color: "gold" | "green" | "navy" | "sky";
  loading: boolean;
}

const colorMap = {
  gold: {
    gradient: "from-amber-50 to-yellow-50/60",
    border: "border-amber-200/70",
    strip: "bg-amber-400",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueTxt: "text-amber-700",
  },
  green: {
    gradient: "from-emerald-50 to-green-50/60",
    border: "border-emerald-200/70",
    strip: "bg-emerald-400",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    valueTxt: "text-emerald-700",
  },
  navy: {
    gradient: "from-blue-50 to-sky-50/60",
    border: "border-blue-200/70",
    strip: "bg-navy",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    valueTxt: "text-blue-900",
  },
  sky: {
    gradient: "from-violet-50 to-purple-50/60",
    border: "border-violet-200/70",
    strip: "bg-violet-400",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    valueTxt: "text-violet-700",
  },
};

const StatCard = ({ label, value, sub, icon: Icon, color, loading }: StatCardProps) => {
  const { ref, inView } = useInView();
  const isPercent = typeof value === "string" && value.endsWith("%");
  const numericTarget = isPercent
    ? parseInt(value as string, 10)
    : typeof value === "number"
    ? value
    : 0;
  const animated = useCountUp(numericTarget, 1200, inView && !loading);
  const displayValue = loading
    ? null
    : isPercent
    ? `${animated}%`
    : typeof value === "number"
    ? animated
    : value;

  const c = colorMap[color];

  return (
    <div
      ref={ref}
      className={cn(
        "relative bg-gradient-to-br rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        c.gradient,
        c.border
      )}
    >
      {/* Colored top strip */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", c.strip)} />

      <div className="p-4 pt-5">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", c.iconBg)}>
          <Icon className={cn("w-5 h-5", c.iconColor)} />
        </div>
        {loading ? (
          <div className="h-7 w-14 bg-white/60 animate-pulse rounded mb-1" />
        ) : (
          <p className={cn("text-2xl font-bold leading-none mb-1", c.valueTxt)}>{displayValue}</p>
        )}
        <p className="text-xs font-semibold text-navy/80">{label}</p>
        <p className="text-xs text-navy/40 mt-0.5">{sub}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewsBanner, setShowNewsBanner] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("banner_may2026_dismissed")) {
      setShowNewsBanner(true);
    }
  }, []);

  const [stats, setStats] = useState({
    courses: 0,
    communities: 0,
    totalStudents: 0,
    newThisWeek: 0,
    avgCompletion: 0,
  });
  const [courseRows, setCourseRows] = useState<CourseRow[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [dropoffLessons, setDropoffLessons] = useState<DropoffLesson[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const hasActiveSubscription =
    profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);

      // Batch 1: courses + plans — fully independent, run in parallel
      const [coursesResult, plansResult] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, slug, is_published")
          .eq("creator_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("membership_plans")
          .select("id")
          .eq("creator_id", profile.id),
      ]);

      const courses = coursesResult.data;
      const plans = plansResult.data;
      const courseIds = courses?.map((c) => c.id) || [];

      if (courseIds.length === 0) {
        // Communities count (only thing left to do)
        let communitiesCount = 0;
        if (plans && plans.length > 0) {
          const { count } = await supabase
            .from("community_groups")
            .select("*", { count: "exact", head: true })
            .in("membership_plan_id", plans.map((p) => p.id));
          communitiesCount = count || 0;
        }
        setStats({ courses: 0, communities: communitiesCount, totalStudents: 0, newThisWeek: 0, avgCompletion: 0 });
        setLoadingAnalytics(false);
        return;
      }

      // Batch 2: all depend on courseIds/plans — run in parallel
      // modules includes nested lessons to avoid a 3rd sequential round-trip
      const communitiesCountPromise = plans && plans.length > 0
        ? supabase
            .from("community_groups")
            .select("*", { count: "exact", head: true })
            .in("membership_plan_id", plans.map((p) => p.id))
            .then((r) => r.count || 0)
        : Promise.resolve(0);

      const [enrollmentsResult, progressResult, modulesResult, communitiesCount] = await Promise.all([
        supabase.from("enrollments").select("user_id, course_id, enrolled_at").in("course_id", courseIds).limit(1000),
        supabase.from("lesson_progress").select("course_id, lesson_id, user_id, completed").in("course_id", courseIds).limit(2000),
        supabase.from("modules").select("id, course_id, lessons(id, title, position)").in("course_id", courseIds),
        communitiesCountPromise,
      ]);

      const allEnrollments = enrollmentsResult.data || [];
      const progressRows = progressResult.data;
      const rawModules = modulesResult.data || [];

      // Flatten nested lessons out of modules response
      const modulesData = rawModules.map((m) => ({ id: m.id, course_id: m.course_id }));
      const lessonsData = rawModules.flatMap((m) =>
        ((m as { lessons?: { id: string; title: string; position: number }[] }).lessons || []).map((l) => ({ id: l.id, title: l.title, module_id: m.id, position: l.position }))
      );

      // Unique students
      const uniqueStudents = new Set(allEnrollments.map((e) => e.user_id)).size;

      // New this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const newThisWeek = allEnrollments.filter((e) => e.enrolled_at >= weekAgo).length;

      // Per-course student counts
      const studentsPerCourse: Record<string, Set<string>> = {};
      for (const e of allEnrollments) {
        if (!studentsPerCourse[e.course_id]) studentsPerCourse[e.course_id] = new Set();
        studentsPerCourse[e.course_id].add(e.user_id);
      }

      // Map module → course
      const moduleCourseMap: Record<string, string> = {};
      for (const m of modulesData) if (m.id && m.course_id) moduleCourseMap[m.id] = m.course_id;

      // Map lesson → course
      const lessonCourseMap: Record<string, string> = {};
      for (const l of lessonsData || []) lessonCourseMap[l.id] = moduleCourseMap[l.module_id] || "";

      // group by course → per user → % completed
      const progressByCourse: Record<string, number[]> = {};

      // Total lessons per course
      const lessonsByCourse: Record<string, number> = {};
      for (const m of modulesData || []) {
        const cnt = lessonsData?.filter((l) => l.module_id === m.id).length || 0;
        if (m.course_id) lessonsByCourse[m.course_id] = (lessonsByCourse[m.course_id] || 0) + cnt;
      }

      if (progressRows) {
        // Group progress by course+user
        const byUser: Record<string, Record<string, number>> = {};
        for (const p of progressRows) {
          if (!p.course_id || !p.user_id) continue;
          if (!byUser[p.course_id]) byUser[p.course_id] = {};
          if (!byUser[p.course_id][p.user_id]) byUser[p.course_id][p.user_id] = 0;
          if (p.completed) byUser[p.course_id][p.user_id]++;
        }

        for (const [courseId, userMap] of Object.entries(byUser)) {
          const total = lessonsByCourse[courseId] || 0;
          if (total === 0) continue;
          for (const completed of Object.values(userMap)) {
            const pct = Math.round((completed / total) * 100);
            if (!progressByCourse[courseId]) progressByCourse[courseId] = [];
            progressByCourse[courseId].push(pct);
          }
        }

        // Drop-off: per lesson, count unique users who have a record (reached) vs completed
        const lessonReached: Record<string, Set<string>> = {};
        const lessonCompleted: Record<string, Set<string>> = {};
        for (const p of progressRows) {
          if (!p.lesson_id || !p.user_id) continue;
          if (!lessonReached[p.lesson_id]) lessonReached[p.lesson_id] = new Set();
          lessonReached[p.lesson_id].add(p.user_id);
          if (p.completed) {
            if (!lessonCompleted[p.lesson_id]) lessonCompleted[p.lesson_id] = new Set();
            lessonCompleted[p.lesson_id].add(p.user_id);
          }
        }

        // Build dropoff list — only lessons that at least someone reached
        const courseMap = Object.fromEntries((courses || []).map(c => [c.id, c.title]));
        const dropoff: DropoffLesson[] = [];
        for (const lesson of lessonsData || []) {
          const courseId = lessonCourseMap[lesson.id];
          const enrolled = studentsPerCourse[courseId]?.size || 0;
          if (enrolled === 0) continue;
          const reached = lessonReached[lesson.id]?.size || 0;
          if (reached === 0) continue; // nobody reached it yet — skip
          const completedCount = lessonCompleted[lesson.id]?.size || 0;
          const completionRate = Math.round((completedCount / enrolled) * 100);
          dropoff.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            courseTitle: courseMap[courseId] || "—",
            completionRate,
            reached,
            enrolled,
          });
        }
        // Sort ascending by completion rate, take worst 5
        dropoff.sort((a, b) => a.completionRate - b.completionRate);
        setDropoffLessons(dropoff.slice(0, 5));
      }

      const avgByCourse: Record<string, number> = {};
      for (const [cid, pcts] of Object.entries(progressByCourse)) {
        avgByCourse[cid] = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
      }

      const allAvgs = Object.values(avgByCourse);
      const avgCompletion = allAvgs.length
        ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length)
        : 0;

      // 8. Course rows for table
      const rows: CourseRow[] = (courses || []).map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        is_published: c.is_published ?? false,
        students: studentsPerCourse[c.id]?.size || 0,
        avgProgress: avgByCourse[c.id] || 0,
      }));
      setCourseRows(rows);

      // 9. Chart: last 8 weeks
      const points: ChartPoint[] = [];
      for (let i = 7; i >= 0; i--) {
        const wStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const wEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
        const count = allEnrollments.filter((e) => {
          const d = new Date(e.enrolled_at);
          return d >= wStart && d < wEnd;
        }).length;
        points.push({
          name: wStart.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }),
          cursanți: count,
        });
      }
      setChartData(points);

      setStats({
        courses: courses?.length || 0,
        communities: communitiesCount as number,
        totalStudents: uniqueStudents,
        newThisWeek,
        avgCompletion,
      });
      setLoadingAnalytics(false);
    };

    fetchAnalytics();
  }, [profile?.id]);



  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;
  if (!authLoading && profile && !hasActiveSubscription) return <SubscriptionRequired />;

  const statCards = [
    { label: "Total cursanți", value: stats.totalStudents, icon: GraduationCap, color: "gold", sub: "pe toate cursurile" },
    { label: "Înscriși săptămâna asta", value: stats.newThisWeek, icon: UserPlus, color: "green", sub: "ultimele 7 zile" },
    { label: "Cursuri create", value: stats.courses, icon: BookOpen, color: "navy", sub: `${courseRows.filter(c => c.is_published).length} publicate` },
    { label: "Rată medie finalizare", value: `${stats.avgCompletion}%`, icon: CheckCircle2, color: "sky", sub: "media tuturor cursurilor" },
  ];

  return (
    <>
      


      

      <div className="min-h-screen bg-beige/30 flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-background border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between shrink-0">
            <button className="lg:hidden p-2 text-charcoal" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold">
                {profile?.full_name?.charAt(0) || "C"}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-mobile-nav">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-navy">
                  Bun venit, {profile?.full_name || "Creator"}!
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy text-white text-xs font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {stats.courses === 0
                  ? "Creează primul tău curs și începe să-ți ajuți cursanții."
                  : "Iată cum merge platforma ta azi."}
              </p>
              {isAdmin && (
                <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-navy font-medium mt-2 hover:underline">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Panel — vezi toți creatorii
                </Link>
              )}
            </div>

            {/* What's new banner — dismissible, shown once */}
            {showNewsBanner && (
              <div className="bg-gradient-to-r from-navy/[0.04] to-sky/[0.04] border border-navy/20 rounded-2xl p-4 mb-6 relative">
                <button
                  onClick={() => {
                    setShowNewsBanner(false);
                    localStorage.setItem("banner_may2026_dismissed", "1");
                  }}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3 pr-6">
                  <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-navy mb-2">Noutăți în platformă</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Notificări în comunitate</strong> — primești notificare când cineva comentează la postarea ta, răspunde la comentariul tău sau îți apreciază postarea</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Comunitate inclusă la Starter</strong> — membrii comunității tale sunt adăugați automat într-o listă de contacte, gata de folosit când activezi Email Marketing (Pro)</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">Email Marketing și Funnel Lead Magnet</strong> sunt acum vizibile în meniu și în editorul de curs — disponibile în planul Pro</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span><strong className="text-foreground">0% comision</strong> din vânzările tale, indiferent de planul ales</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade banner — shown only for non-Pro users */}
            {hasActiveSubscription && profile?.plan_type !== "pro" && !profile?.lifetime_access && (
              <Link href="/pricing" className="block mb-6">
                <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/40 rounded-2xl p-4 hover:bg-gold/15 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground mb-1">Deblochează Email Marketing + Sales Page AI</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[11px] text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5">📧 Email marketing</span>
                          <span className="text-[11px] text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5">✨ Sales page cu AI</span>
                          <span className="text-[11px] text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5">🎯 Funnel lead magnet</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gold whitespace-nowrap shrink-0 mt-1">Pro 29€/lună →</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {statCards.map((s) => (
                <StatCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  sub={s.sub}
                  icon={s.icon}
                  color={s.color as "gold" | "green" | "navy" | "sky"}
                  loading={loadingAnalytics}
                />
              ))}
            </div>

            {/* Enrollment chart */}
            {stats.courses > 0 && (
              <div className="bg-background rounded-2xl border border-border p-4 lg:p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  <h2 className="font-semibold text-navy">Înrolări — ultimele 8 săptămâni</h2>
                </div>
                {loadingAnalytics ? (
                  <div className="h-48 bg-muted/30 animate-pulse rounded-xl" />
                ) : (
                  <DashboardChart data={chartData} />
                )}
              </div>
            )}

            {/* Per-course table */}
            {stats.courses > 0 && (
              <div className="bg-background rounded-2xl border border-border p-4 lg:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold" />
                    <h2 className="font-semibold text-navy">Performanță per curs</h2>
                  </div>
                  <Link href="/dashboard/courses">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Vezi toate <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 text-xs text-muted-foreground font-medium">Curs</th>
                        <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">Cursanți</th>
                        <th className="text-left py-2 px-2 text-xs text-muted-foreground font-medium min-w-[120px]">Progres mediu</th>
                        <th className="py-2 px-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {loadingAnalytics ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-3 px-2"><div className="h-4 bg-muted animate-pulse rounded w-32" /></td>
                            <td className="py-3 px-2"><div className="h-4 bg-muted animate-pulse rounded w-8 ml-auto" /></td>
                            <td className="py-3 px-2"><div className="h-3 bg-muted animate-pulse rounded w-full" /></td>
                            <td className="py-3 px-2" />
                          </tr>
                        ))
                      ) : (
                        courseRows.map((course) => (
                          <tr key={course.id} className="border-b border-border/50 hover:bg-beige/20 transition-colors">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  course.is_published ? "bg-green-500" : "bg-muted-foreground"
                                )} />
                                <span className="font-medium text-navy truncate max-w-[180px]">{course.title}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right font-semibold text-navy">{course.students}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <Progress value={course.avgProgress} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground w-8 text-right">{course.avgProgress}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <Link href={`/dashboard/courses/${course.id}/students`}
                                className="text-xs text-gold hover:underline whitespace-nowrap"
                              >
                                Cursanți →
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Drop-off: lecții cu rata de finalizare scăzută */}
            {stats.courses > 0 && (dropoffLessons.length > 0 || loadingAnalytics) && (
              <div className="bg-background rounded-2xl border border-border p-4 lg:p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-navy">Lecții cu cel mai mare drop-off</h2>
                  <span className="text-xs text-muted-foreground ml-1">— unde pierde cursanți</span>
                </div>
                {loadingAnalytics ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                        <div className="h-4 bg-muted animate-pulse rounded w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dropoffLessons.map((item) => (
                      <div key={item.lessonId} className="flex items-center gap-3 p-3 rounded-xl bg-beige/30 hover:bg-beige/50 transition-colors">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                          item.completionRate < 30 ? "bg-red-100 text-red-600" :
                          item.completionRate < 60 ? "bg-amber-100 text-amber-600" :
                          "bg-yellow-50 text-yellow-700"
                        )}>
                          {item.completionRate}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy truncate">{item.lessonTitle}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.courseTitle}</p>
                        </div>
                        <div className="text-xs text-muted-foreground text-right shrink-0">
                          <p>{item.reached} au ajuns</p>
                          <p>din {item.enrolled} înscriși</p>
                        </div>
                      </div>
                    ))}
                    {dropoffLessons.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nu există date suficiente încă.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background rounded-2xl border border-border p-5 sm:p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-7 h-7 text-gold" />
                </div>
                <h2 className="text-lg font-bold text-navy mb-1">
                  {stats.courses === 0 ? "Creează primul curs" : "Curs nou"}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">Adaugă module, lecții, video-uri și PDF-uri.</p>
                <Link href="/dashboard/courses/new">
                  <Button className="w-full group">
                    Creează curs
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="bg-background rounded-2xl border border-border p-5 sm:p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-sky/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-sky" />
                </div>
                <h2 className="text-lg font-bold text-navy mb-1">Comunitate pentru curs</h2>
                <p className="text-muted-foreground text-sm mb-4">Creează sau administrează comunitatea din pagina cursului.</p>
                <Link href="/dashboard/courses">
                  <Button variant="outline" className="w-full group">
                    Vezi cursurile
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
};

export default Dashboard;
