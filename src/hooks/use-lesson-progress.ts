"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Progress {
  completed: boolean;
  completed_at?: string;
  last_seen_at?: string;
}

export function useLessonProgress(lessonId: string) {
  return useQuery<Progress>({
    queryKey: ["lesson-progress", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/progress?lessonId=${lessonId}`);
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, completed = true }: { lessonId: string; completed?: boolean }) => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
    onSuccess: (_, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", lessonId] });
    },
  });
}

export function useCourseProgress(courseId: string) {
  return useQuery<{ lesson_id: string; completed: boolean }[]>({
    queryKey: ["course-progress", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/progress?courseId=${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course progress");
      return res.json();
    },
    staleTime: 30_000,
  });
}
