"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  BookOpen,
  Download,
  Search,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  UserMinus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as XLSX from "xlsx";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";

interface Student {
  user_id: string;
  full_name: string;
  email: string;
  first_accessed: string | null;
  last_accessed: string | null;
  lessons_completed: number;
  total_lessons: number;
  progress_percent: number;
}

type StatusFilter = "all" | "active" | "inactive" | "not_started" | "completed" | "abandoned";
type SortField = "full_name" | "progress_percent" | "last_accessed" | "first_accessed" | "lessons_completed";
type SortDir = "asc" | "desc";

function getStatus(student: Student): StatusFilter {
  if (student.progress_percent >= 100) return "completed";
  if (student.progress_percent === 0 || !student.last_accessed) return "not_started";
  const days = (Date.now() - new Date(student.last_accessed).getTime()) / (1000 * 60 * 60 * 24);
  if (days > 30) return "abandoned";
  if (days > 7) return "inactive";
  return "active";
}

function statusLabel(status: StatusFilter) {
  const map: Record<StatusFilter, { label: string; cls: string; icon: React.ReactNode }> = {
    all:         { label: "Toți",       cls: "bg-muted text-muted-foreground", icon: <Users className="w-3 h-3" /> },
    active:      { label: "Activ",      cls: "bg-green-100 text-green-700",    icon: <CheckCircle2 className="w-3 h-3" /> },
    inactive:    { label: "Inactiv",    cls: "bg-yellow-100 text-yellow-700",  icon: <Clock className="w-3 h-3" /> },
    abandoned:   { label: "Abandonat",  cls: "bg-red-100 text-red-700",        icon: <XCircle className="w-3 h-3" /> },
    not_started: { label: "Neînceput",  cls: "bg-muted text-muted-foreground", icon: <Circle className="w-3 h-3" /> },
    completed:   { label: "Finalizat",  cls: "bg-blue-100 text-blue-700",      icon: <CheckCircle2 className="w-3 h-3" /> },
  };
  return map[status];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
}

const CourseStudents = () => {
  const _params = useParams<{ courseId: string }>();
  const courseId = _params?.courseId;
  const router = useRouter();
  const { user, profile } = useAuth();

  const [courseTitle, setCourseTitle] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("last_accessed");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [removingStudent, setRemovingStudent] = useState<Student | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Access control — only subscription-active creators
  const hasAccess = profile?.subscription_active || profile?.lifetime_access || profile?.beta_tester;

  useEffect(() => {
    if (!user || !profile || !courseId) return;

    const load = async () => {
      // Fetch course title (verify ownership)
      const { data: course } = await supabase
        .from("courses")
        .select("title, slug")
        .eq("id", courseId)
        .eq("creator_id", profile.id)
        .maybeSingle();

      if (!course) {
        router.push("/dashboard/courses");
        return;
      }

      setCourseTitle(course.title);
      setCourseSlug(course.slug || "");

      // Fetch students via RPC
      const { data, error } = await supabase
        .rpc("get_course_students" as never, {
          _course_id: courseId,
          _creator_id: profile.id,
        } as never);

      if (!error && data) {
        setStudents(
          (data as Student[]).map((s) => ({
            ...s,
            lessons_completed: Number(s.lessons_completed) || 0,
            total_lessons: Number(s.total_lessons) || 0,
            progress_percent: Number(s.progress_percent) || 0,
          }))
        );
      }

      setIsLoading(false);
    };

    load();
  }, [user, profile, courseId, router]);

  // Summary stats
  const summary = useMemo(() => {
    const total = students.length;
    const started = students.filter((s) => s.progress_percent > 0).length;
    const notStarted = students.filter((s) => s.progress_percent === 0).length;
    const completed = students.filter((s) => s.progress_percent >= 100).length;
    const avgProgress = total > 0
      ? Math.round(students.reduce((acc, s) => acc + s.progress_percent, 0) / total)
      : 0;
    return { total, started, notStarted, completed, avgProgress };
  }, [students]);

  // Filter + search + sort
  const filtered = useMemo(() => {
    let list = students;

    if (filter !== "all") {
      list = list.filter((s) => getStatus(s) === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortField === "full_name") { valA = a.full_name || ""; valB = b.full_name || ""; }
      else if (sortField === "progress_percent") { valA = a.progress_percent; valB = b.progress_percent; }
      else if (sortField === "lessons_completed") { valA = a.lessons_completed; valB = b.lessons_completed; }
      else if (sortField === "last_accessed") { valA = a.last_accessed || ""; valB = b.last_accessed || ""; }
      else if (sortField === "first_accessed") { valA = a.first_accessed || ""; valB = b.first_accessed || ""; }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [students, filter, search, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleRemoveStudent = async () => {
    if (!removingStudent || !courseId) return;
    setIsRemoving(true);
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("course_id", courseId)
      .eq("user_id", removingStudent.user_id);
    if (error) {
      toast({ title: "Eroare", description: "Nu s-a putut șterge cursantul.", variant: "destructive" });
    } else {
      setStudents((prev) => prev.filter((s) => s.user_id !== removingStudent.user_id));
      toast({ title: "Cursant șters", description: `${removingStudent.full_name || removingStudent.email} a fost scos din curs.` });
    }
    setRemovingStudent(null);
    setIsRemoving(false);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-gold" />
      : <ChevronDown className="w-3 h-3 text-gold" />;
  };

  // Export to Excel
  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const filename = `cursanti_${courseSlug || courseId}_${today}.xlsx`;

    const rows = filtered.map((s) => ({
      "Nume": s.full_name || "—",
      "Email": s.email || "—",
      "Data înscrierii": formatDate(s.first_accessed),
      "Ultima activitate": formatDate(s.last_accessed),
      "Progres (%)": s.progress_percent,
      "Lecții finalizate": s.lessons_completed,
      "Total lecții": s.total_lessons,
      "Status": statusLabel(getStatus(s)).label,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Style header row (bold + gray background via cell format)
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cell]) {
        ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: "F0F0F0" } } };
      }
    }

    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 18 },
      { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cursanți");

    // UTF-8 BOM for Romanian diacritics in Excel
    XLSX.writeFile(wb, filename, { bookType: "xlsx", type: "binary" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  const filterOptions: StatusFilter[] = ["all", "active", "inactive", "abandoned", "not_started", "completed"];

  return (
    <div className="min-h-screen bg-beige/30">
      

      

      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <Logo className="h-8 w-auto" />
          </Link>
          <Link href={`/dashboard/courses/${courseId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {courseTitle}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-navy">Cursanți</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total cursanți",   value: summary.total,       icon: <Users className="w-5 h-5 text-navy" /> },
            { label: "Au început",        value: summary.started,     icon: <TrendingUp className="w-5 h-5 text-green-600" /> },
            { label: "Nu au început",     value: summary.notStarted,  icon: <Circle className="w-5 h-5 text-muted-foreground" /> },
            { label: "Finalizat",         value: summary.completed,   icon: <CheckCircle2 className="w-5 h-5 text-blue-600" /> },
            { label: "Progres mediu",     value: `${summary.avgProgress}%`, icon: <BookOpen className="w-5 h-5 text-gold" /> },
          ].map((card) => (
            <div key={card.label} className="bg-background rounded-xl border border-border p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {card.icon}
                {card.label}
              </div>
              <p className="text-2xl font-bold text-navy">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume sau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((f) => {
              const s = statusLabel(f);
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    filter === f
                      ? "bg-navy text-white border-navy"
                      : "bg-background text-muted-foreground border-border hover:border-navy/40"
                  )}
                >
                  {s.icon}
                  {s.label}
                </button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2 ml-2"
              disabled={filtered.length === 0}
            >
              <Download className="w-4 h-4" />
              Descarcă Excel
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              {students.length === 0
                ? "Niciun cursant înscris încă."
                : "Niciun cursant nu corespunde filtrelor selectate."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-beige/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      <button
                        onClick={() => handleSort("full_name")}
                        className="flex items-center gap-1 hover:text-navy transition-colors"
                      >
                        Nume <SortIcon field="full_name" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                      <button
                        onClick={() => handleSort("first_accessed")}
                        className="flex items-center gap-1 hover:text-navy transition-colors"
                      >
                        Înscris <SortIcon field="first_accessed" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                      <button
                        onClick={() => handleSort("last_accessed")}
                        className="flex items-center gap-1 hover:text-navy transition-colors"
                      >
                        Ultima activitate <SortIcon field="last_accessed" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      <button
                        onClick={() => handleSort("progress_percent")}
                        className="flex items-center gap-1 hover:text-navy transition-colors"
                      >
                        Progres <SortIcon field="progress_percent" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((student) => {
                    const status = getStatus(student);
                    const { label, cls, icon } = statusLabel(status);
                    return (
                      <tr key={student.user_id} className="hover:bg-beige/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-navy">
                          {student.full_name || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {formatDate(student.first_accessed)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {formatDate(student.last_accessed)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress
                              value={student.progress_percent}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {student.progress_percent}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {student.lessons_completed}/{student.total_lessons} lecții
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit", cls)}>
                            {icon}
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setRemovingStudent(student)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded"
                            title="Scoate din curs"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {filtered.length} din {students.length} cursanți afișați
        </p>
      </main>

      <AlertDialog open={!!removingStudent} onOpenChange={(open) => !open && setRemovingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scoate cursantul din curs?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{removingStudent?.full_name || removingStudent?.email}</strong> va fi șters din lista de cursanți și nu va mai putea accesa cursul.
              Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRemoving ? "Se șterge..." : "Da, scoate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseStudents;
