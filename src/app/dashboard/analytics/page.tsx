import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface CourseStats {
  course_id: string;
  title: string;
  total_lessons: number;
  students: number;
  completions: number;
  completion_rate: number;
}

interface AnalyticsData {
  courses: CourseStats[];
  totals: { students: number; completions: number; lessons: number };
}

async function getAnalytics(): Promise<AnalyticsData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("creator_id", user.id);

  if (!courses || courses.length === 0) {
    return { courses: [], totals: { students: 0, completions: 0, lessons: 0 } };
  }

  const courseIds: string[] = courses.map((c: { id: string }) => c.id);

  const { data: modules } = await supabase.from("modules").select("id, course_id").in("course_id", courseIds);
  const moduleIds: string[] = (modules ?? []).map((m: { id: string }) => m.id);

  const { data: lessons } = await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds);
  const lessonIds: string[] = (lessons ?? []).map((l: { id: string }) => l.id);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, user_id, completed")
    .in("lesson_id", lessonIds);

  const progressRows: { lesson_id: string; user_id: string; completed: boolean }[] = progress ?? [];

  const uniqueStudents = new Set(progressRows.map((p) => p.user_id)).size;
  const completedCount = progressRows.filter((p) => p.completed).length;

  const modulesByCourse: Record<string, string[]> = {};
  for (const m of (modules ?? []) as { id: string; course_id: string }[]) {
    modulesByCourse[m.course_id] = [...(modulesByCourse[m.course_id] ?? []), m.id];
  }

  const lessonsByModule: Record<string, string[]> = {};
  for (const l of (lessons ?? []) as { id: string; module_id: string }[]) {
    lessonsByModule[l.module_id] = [...(lessonsByModule[l.module_id] ?? []), l.id];
  }

  const courseStats: CourseStats[] = courses.map((course: { id: string; title: string }) => {
    const courseLessonIds: string[] = (modulesByCourse[course.id] ?? [])
      .flatMap((mid: string) => lessonsByModule[mid] ?? []);
    const cp = progressRows.filter((p) => courseLessonIds.includes(p.lesson_id));
    const students = new Set(cp.map((p) => p.user_id)).size;
    const completions = cp.filter((p) => p.completed).length;
    return {
      course_id: course.id,
      title: course.title,
      total_lessons: courseLessonIds.length,
      students,
      completions,
      completion_rate:
        courseLessonIds.length > 0 && students > 0
          ? Math.round((completions / (courseLessonIds.length * students)) * 100)
          : 0,
    };
  });

  return { courses: courseStats, totals: { students: uniqueStudents, completions: completedCount, lessons: lessonIds.length } };
}

export default async function AnalyticsPage() {
  const { courses, totals } = await getAnalytics();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Statistici</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Studenți activi" value={totals.students} />
        <StatCard label="Lecții completate" value={totals.completions} />
        <StatCard label="Total lecții" value={totals.lessons} />
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-500">Nu ai niciun curs publicat încă.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Curs</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Lecții</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Studenți</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Completări</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Rată</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((c) => (
                <tr key={c.course_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.total_lessons}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.students}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.completions}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${c.completion_rate >= 50 ? "text-green-600" : "text-gray-600"}`}>
                      {c.completion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
