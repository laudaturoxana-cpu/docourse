import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/browser';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type LessonStatus = 'unwatched' | 'in_progress' | 'completed';

export interface LessonProgress {
  lesson_id: string;
  video_timestamp: number;
  video_duration: number;
  watched_percentage: number;
  status: LessonStatus;
  downloaded_files: string[];
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  percentage: number;
}

// Helper to get localStorage key for course progress — include userId ca să nu se amestece progresul între conturi
const getLocalStorageKey = (courseId: string, userId?: string) =>
  userId ? `docourse_progress_${userId}_${courseId}` : `docourse_progress_anon_${courseId}`;

// Helper to load progress from localStorage
const loadLocalProgress = (courseId: string, userId?: string): Record<string, LessonProgress> => {
  try {
    const stored = localStorage.getItem(getLocalStorageKey(courseId, userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading local progress:', err);
  }
  return {};
};

// Helper to save progress to localStorage
const saveLocalProgress = (courseId: string, progressMap: Record<string, LessonProgress>, userId?: string) => {
  try {
    localStorage.setItem(getLocalStorageKey(courseId, userId), JSON.stringify(progressMap));
  } catch (err) {
    console.error('Error saving local progress:', err);
  }
};

export function useLessonProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [certificateIssued, setCertificateIssued] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const certificateCheckRef = useRef(false);

  // Fetch all progress for the course (from DB if authenticated, from localStorage otherwise)
  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }

      if (user) {
        // Utilizator autentificat: localStorage cu cheia user-specifică + DB
        const localProgress = loadLocalProgress(courseId, user.id);
        try {
          const { data, error } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId);

          if (error) {
            console.error('Error fetching progress:', error);
            setProgressMap(localProgress);
          } else if (data) {
            const dbMap: Record<string, LessonProgress> = {};
            data.forEach((p) => {
              if (!p.lesson_id) return;
              dbMap[p.lesson_id] = {
                lesson_id: p.lesson_id,
                video_timestamp: Number(p.video_timestamp) || 0,
                video_duration: Number(p.video_duration) || 0,
                watched_percentage: Number(p.watched_percentage) || 0,
                status: p.status as LessonStatus,
                downloaded_files: p.downloaded_files || [],
              };
            });
            // DB are prioritate — local e doar buffer temporar
            const mergedMap = { ...localProgress, ...dbMap };
            setProgressMap(mergedMap);
            saveLocalProgress(courseId, mergedMap, user.id);
          }
        } catch (err) {
          console.error('Error fetching progress:', err);
          setProgressMap(localProgress);
        }
      } else {
        // Neautentificat — localStorage anonim
        const localProgress = loadLocalProgress(courseId);
        setProgressMap(localProgress);
      }

      setIsLoading(false);
    };

    fetchProgress();
  }, [user, courseId]);

  // Get progress for a specific lesson
  const getLessonProgress = useCallback((lessonId: string): LessonProgress | null => {
    return progressMap[lessonId] || null;
  }, [progressMap]);

  // Update video progress (called during video playback)
  const updateVideoProgress = useCallback(async (
    lessonId: string,
    currentTime: number,
    duration: number
  ) => {
    if (!courseId || duration === 0) return;

    const percentage = Math.round((currentTime / duration) * 100);
    const isCompleted = percentage >= 90;
    const newStatus: LessonStatus = isCompleted ? 'completed' : (percentage > 0 ? 'in_progress' : 'unwatched');

    // Update local state immediately
    setProgressMap(prev => {
      const updated = {
        ...prev,
        [lessonId]: {
          lesson_id: lessonId,
          video_timestamp: currentTime,
          video_duration: duration,
          watched_percentage: percentage,
          status: prev[lessonId]?.status === 'completed' ? 'completed' : newStatus,
          downloaded_files: prev[lessonId]?.downloaded_files || [],
        }
      };
      // Always save to localStorage
      saveLocalProgress(courseId, updated, user?.id);
      return updated;
    });

    // Debounce database save (every 5 seconds) - only if authenticated
    if (user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const existingProgress = progressMap[lessonId];
          const finalStatus = existingProgress?.status === 'completed' ? 'completed' : newStatus;

          const { error } = await supabase
            .from('lesson_progress')
            .upsert({
              user_id: user.id,
              course_id: courseId,
              lesson_id: lessonId,
              video_timestamp: currentTime,
              video_duration: duration,
              watched_percentage: percentage,
              status: finalStatus,
              downloaded_files: existingProgress?.downloaded_files || [],
            }, {
              onConflict: 'user_id,lesson_id'
            });

          if (error) {
            console.error('Error saving video progress:', error);
          }
        } catch (err) {
          console.error('Error saving video progress:', err);
        }
      }, 5000);
    }
  }, [user, courseId, progressMap]);

  // Mark lesson as completed manually
  const markLessonCompleted = useCallback(async (lessonId: string) => {
    if (!courseId) return;

    setProgressMap(prev => {
      const updated = {
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          lesson_id: lessonId,
          video_timestamp: prev[lessonId]?.video_timestamp || 0,
          video_duration: prev[lessonId]?.video_duration || 0,
          watched_percentage: 100,
          status: 'completed' as LessonStatus,
          downloaded_files: prev[lessonId]?.downloaded_files || [],
        }
      };
      // Always save to localStorage
      saveLocalProgress(courseId, updated, user?.id);
      return updated;
    });

    // Save to database only if authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('lesson_progress')
          .upsert({
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            watched_percentage: 100,
            status: 'completed',
            downloaded_files: progressMap[lessonId]?.downloaded_files || [],
          }, {
            onConflict: 'user_id,lesson_id'
          });

        if (error) {
          console.error('Error marking lesson completed:', error);
        }
      } catch (err) {
        console.error('Error marking lesson completed:', err);
      }
    }
  }, [user, courseId, progressMap]);

  // Mark file as downloaded
  const markFileDownloaded = useCallback(async (lessonId: string, fileId: string) => {
    if (!courseId) return;

    const currentProgress = progressMap[lessonId];
    const currentDownloads = currentProgress?.downloaded_files || [];

    if (currentDownloads.includes(fileId)) return; // Already marked

    const newDownloads = [...currentDownloads, fileId];

    setProgressMap(prev => {
      const updated = {
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          lesson_id: lessonId,
          video_timestamp: prev[lessonId]?.video_timestamp || 0,
          video_duration: prev[lessonId]?.video_duration || 0,
          watched_percentage: prev[lessonId]?.watched_percentage || 0,
          status: prev[lessonId]?.status || 'unwatched',
          downloaded_files: newDownloads,
        }
      };
      // Always save to localStorage
      saveLocalProgress(courseId, updated, user?.id);
      return updated;
    });

    // Save to database only if authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('lesson_progress')
          .upsert({
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            video_timestamp: currentProgress?.video_timestamp || 0,
            video_duration: currentProgress?.video_duration || 0,
            watched_percentage: currentProgress?.watched_percentage || 0,
            status: currentProgress?.status || 'unwatched',
            downloaded_files: newDownloads,
          }, {
            onConflict: 'user_id,lesson_id'
          });

        if (error) {
          console.error('Error marking file downloaded:', error);
        }
      } catch (err) {
        console.error('Error marking file downloaded:', err);
      }
    }
  }, [user, courseId, progressMap]);

  // Check if file is downloaded
  const isFileDownloaded = useCallback((lessonId: string, fileId: string): boolean => {
    return progressMap[lessonId]?.downloaded_files?.includes(fileId) || false;
  }, [progressMap]);

  // Calculate overall course progress
  const calculateCourseProgress = useCallback((lessonIds: string[]): CourseProgress => {
    const totalLessons = lessonIds.length;
    let completedLessons = 0;
    let inProgressLessons = 0;

    lessonIds.forEach(id => {
      const progress = progressMap[id];
      if (progress?.status === 'completed') {
        completedLessons++;
      } else if (progress?.status === 'in_progress') {
        inProgressLessons++;
      }
    });

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedLessons,
      inProgressLessons,
      percentage,
    };
  }, [progressMap]);

  // Check if course is complete and issue certificate
  const checkAndIssueCertificate = useCallback(async (lessonIds: string[]) => {
    if (!user || !courseId || certificateCheckRef.current) return;

    const progress = calculateCourseProgress(lessonIds);

    // Only proceed if course is 100% complete
    if (progress.percentage !== 100) return;

    // Prevent multiple checks
    certificateCheckRef.current = true;

    try {
      console.log('Course completed! Issuing certificate...');

      const { data, error } = await supabase.functions.invoke('issue-certificate', {
        body: {
          userId: user.id,
          courseId: courseId,
        }
      });

      if (error) {
        console.error('Error issuing certificate:', error);
        certificateCheckRef.current = false;
        return;
      }

      if (data?.success) {
        setCertificateIssued(true);

        if (data.alreadyIssued) {
          console.log('Certificate was already issued');
        } else {
          // Show celebration toast
          toast.success(
            '🎉 Felicitări! Ai finalizat cursul!',
            {
              description: 'Certificatul tău a fost emis. Verifică email-ul pentru detalii.',
              duration: 10000,
            }
          );
        }
      }
    } catch (err) {
      console.error('Error checking certificate:', err);
      certificateCheckRef.current = false;
    }
  }, [user, courseId, calculateCourseProgress]);

  // Save last viewed lesson ID to localStorage
  const saveLastViewedLesson = useCallback((lessonId: string) => {
    if (!courseId) return;
    localStorage.setItem(`docourse_last_lesson_${courseId}`, lessonId);
  }, [courseId]);

  // Get last viewed lesson ID from localStorage
  const getLastViewedLessonId = useCallback((): string | null => {
    if (!courseId) return null;
    return localStorage.getItem(`docourse_last_lesson_${courseId}`);
  }, [courseId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    progressMap,
    isLoading,
    getLessonProgress,
    updateVideoProgress,
    markLessonCompleted,
    markFileDownloaded,
    isFileDownloaded,
    calculateCourseProgress,
    checkAndIssueCertificate,
    certificateIssued,
    isAuthenticated: !!user,
    canTrackProgress: !!courseId,
    saveLastViewedLesson,
    getLastViewedLessonId,
  };
}
