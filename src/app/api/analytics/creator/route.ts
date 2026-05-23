import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function GET() {
  const supabase = await createClient() as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("creator_id", user.id);

  if (!courses || courses.length === 0) {
    return NextResponse.json({ courses: [], totals: { students: 0, completions: 0, lessons: 0 } });
  }

  const courseIds: string[] = courses.map((c: { id: string }) => c.id);

  const { data: modules } = await supabase
    .from("modules")
    .select("id, course_id")
    .in("course_id", courseIds);

  const moduleIds: string[] = (modules ?? []).map((m: { id: string }) => m.id);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id")
    .in("module_id", moduleIds);

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

  const courseStats = courses.map((course: { id: string; title: string }) => {
    const courseLessonIds = (modulesByCourse[course.id] ?? [])
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

  return NextResponse.json({
    courses: courseStats,
    totals: { students: uniqueStudents, completions: completedCount, lessons: lessonIds.length },
  });
}
