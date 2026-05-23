import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { lessonId, completed } = body;

  if (!lessonId || typeof lessonId !== "string") {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  const upsertData: Record<string, unknown> = {
    user_id: user.id,
    lesson_id: lessonId,
    last_seen_at: new Date().toISOString(),
  };

  if (completed === true) {
    upsertData.completed = true;
    upsertData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(upsertData, { onConflict: "user_id,lesson_id" });

  if (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");
  const courseId = searchParams.get("courseId");

  if (lessonId) {
    const { data } = await supabase
      .from("lesson_progress")
      .select("completed, completed_at, last_seen_at")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    return NextResponse.json(data ?? { completed: false });
  }

  if (courseId) {
    // Fetch lesson IDs for this course first, then query progress
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    const moduleIds: string[] = (modules ?? []).map((m: { id: string }) => m.id);
    if (moduleIds.length === 0) return NextResponse.json([]);

    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds);

    const lessonIds: string[] = (lessons ?? []).map((l: { id: string }) => l.id);
    if (lessonIds.length === 0) return NextResponse.json([]);

    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed, completed_at")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    return NextResponse.json(data ?? []);
  }

  return NextResponse.json({ error: "lessonId or courseId required" }, { status: 400 });
}
