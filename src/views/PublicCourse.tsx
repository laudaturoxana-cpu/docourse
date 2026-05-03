"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DOMPurify from "dompurify";
import {
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  BookOpen,
  Users,
  AlertCircle,
  Download,
  FileType,
  Maximize2,
  Lock,
  Check,
  Circle,
  CheckCircle2,
  Headphones,
  Music,
  Menu,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "@/hooks/useAuth";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useLessonProgress, LessonStatus } from "@/hooks/useLessonProgress";
import { toast } from "sonner";
import AudioPlayer from "@/components/AudioPlayer";

interface LessonFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
}

interface LessonVideo {
  id: string;
  title: string;
  video_url: string;
  video_provider: string;
  pos: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration: string | null;
  position: number;
  files: LessonFile[];
  videos: LessonVideo[];
  available_from: string | null;
}

interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
  available_from: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  creator_name: string;
  requires_login: boolean;
  sequential_unlock: boolean;
  unlock_trigger: string;
  image_url: string | null;
}

interface PublicCourseData {
  id: string;
  title: string;
  description: string | null;
  creator_name: string;
  requires_login: boolean;
  sequential_unlock?: boolean;
  unlock_trigger?: string;
  image_url?: string | null;
}

interface ModuleData {
  id: string;
  title: string;
  description: string | null;
  module_position: number;
  available_from: string | null;
}

interface LessonData {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  video_provider: string | null;
  duration: string | null;
  lesson_position: number;
  available_from: string | null;
}

// Status icon component
const LessonStatusIcon = ({ status }: { status: LessonStatus }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
    case 'in_progress':
      return <Circle className="w-4 h-4 text-yellow-500 fill-yellow-500/30 flex-shrink-0" />;
    default:
      return <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
  }
};

const PublicCourse = () => {
  const _params = useParams<{ slug: string; token?: string }>();
  const slug = _params?.slug;
  const token = _params?.token;
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCommunity = searchParams?.get("from"); // e.g. /community/ai-business-accelerate
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [fullscreenFile, setFullscreenFile] = useState<LessonFile | null>(null);
  const [communityInfo, setCommunityInfo] = useState<{ planId: string; name: string } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [failedEmbeds, setFailedEmbeds] = useState<Set<string>>(new Set());
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check course access based on membership
  const { isLoading: isCheckingAccess, hasAccess, requiresMembership, requiredPlan } = useCourseAccess(course?.id);
  
  // Progress tracking
  const {
    getLessonProgress,
    updateVideoProgress,
    markLessonCompleted,
    markFileDownloaded,
    isFileDownloaded,
    calculateCourseProgress,
    checkAndIssueCertificate,
    isAuthenticated,
    canTrackProgress,
    saveLastViewedLesson,
    getLastViewedLessonId,
  } = useLessonProgress(course?.id);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) {
        setIsValidToken(false);
        setIsLoading(false);
        return;
      }

      let courseResult: PublicCourseData[] | null = null;

      if (token) {
        // URL vechi cu token → obținem cursul, apoi redirectăm la URL curat
        const { data, error } = await supabase
          .rpc('get_public_course' as never, { _slug: slug, _token: token } as never);

        if (!error && data && (data as unknown as PublicCourseData[]).length > 0) {
          // Redirectăm la URL curat (fără token)
          router.replace(`/course/${slug}`);
          return;
        }

        // Token invalid sau expirat — încearcă direct după slug (link vechi trimis de creator)
        const { data: slugData } = await supabase
          .rpc('get_course_by_slug' as never, { _slug: slug } as never);

        if (slugData && (slugData as unknown as PublicCourseData[]).length > 0) {
          router.replace(`/course/${slug}`);
          return;
        }

        // Verificăm dacă slug-ul s-a schimbat
        const { data: redirectData } = await supabase
          .rpc('get_course_by_old_slug' as never, { _old_slug: slug } as never) as { data: { course_id: string; current_slug: string }[] | null };

        if (redirectData && redirectData.length > 0) {
          router.replace(`/course/${redirectData[0].current_slug}`);
          return;
        }

        setIsValidToken(false);
        setIsLoading(false);
        return;
      } else {
        // URL nou fără token → folosim get_course_by_slug
        const { data, error } = await supabase
          .rpc('get_course_by_slug' as never, { _slug: slug } as never);

        if (error || !data || (data as unknown as PublicCourseData[]).length === 0) {
          // Poate slug-ul s-a schimbat — verificăm redirecturi
          const { data: redirectData } = await supabase
            .rpc('get_course_by_old_slug' as never, { _old_slug: slug } as never) as { data: { course_id: string; current_slug: string }[] | null };

          if (redirectData && redirectData.length > 0) {
            router.replace(`/course/${redirectData[0].current_slug}`);
            return;
          }

          setIsValidToken(false);
          setIsLoading(false);
          return;
        }

        courseResult = data as unknown as PublicCourseData[];
      }

      if (!courseResult || courseResult.length === 0) {
        setIsValidToken(false);
        setIsLoading(false);
        return;
      }

      const courseInfo = courseResult[0];
      setCourse({
        id: courseInfo.id,
        title: courseInfo.title,
        description: courseInfo.description,
        creator_name: courseInfo.creator_name || "Creator",
        requires_login: courseInfo.requires_login ?? false,
        sequential_unlock: courseInfo.sequential_unlock ?? false,
        unlock_trigger: courseInfo.unlock_trigger ?? 'first_lesson',
        image_url: courseInfo.image_url ?? null,
      });

      // Find community linked to this course (through the internal plan)
      const { data: communityRpc, error: communityRpcError } = await supabase
        .rpc("get_course_community", { _course_id: courseInfo.id });

      const rpcCommunity = Array.isArray(communityRpc) ? communityRpc[0] : communityRpc;
      const planId = rpcCommunity?.plan_id as string | undefined;
      if (communityRpcError) {
        console.warn("Community RPC lookup error:", communityRpcError);
      }

      if (!planId) {
        const { data: plans, error: plansError } = await supabase
          .from("membership_plans")
          .select("id, includes_courses");

        if (plansError) {
          console.warn("Membership plans lookup error:", plansError);
        }

        const fallbackPlanId = plans?.find((plan) => {
          const includes = plan.includes_courses as unknown;
          if (!includes) return false;
          if (Array.isArray(includes)) {
            return includes.includes(courseInfo.id);
          }
          if (typeof includes === "string") {
            if (includes.includes(courseInfo.id)) {
              return true;
            }
            try {
              const parsed = JSON.parse(includes) as string[];
              return parsed.includes(courseInfo.id);
            } catch {
              return false;
            }
          }
          if (typeof includes === "object") {
            try {
              const parsed = includes as string[];
              return Array.isArray(parsed) && parsed.includes(courseInfo.id);
            } catch {
              return false;
            }
          }
          return false;
        })?.id;

        if (fallbackPlanId) {
          const { data: community, error: communityError } = await supabase
            .from("community_groups")
            .select("name")
            .eq("membership_plan_id", fallbackPlanId)
            .maybeSingle();

          if (communityError) {
            console.warn("Community lookup error:", communityError);
          }

          if (community?.name) {
            setCommunityInfo({ planId: fallbackPlanId, name: community.name });
          }
        }
      } else if (rpcCommunity?.community_name) {
        setCommunityInfo({ planId, name: rpcCommunity.community_name as string });
      }
      if (!communityInfo && planId) {
        const { data: community, error: communityError } = await supabase
          .from("community_groups")
          .select("name")
          .eq("membership_plan_id", planId)
          .maybeSingle();

        if (communityError) {
          console.warn("Community lookup error:", communityError);
        }

        if (community?.name) {
          setCommunityInfo({ planId, name: community.name });
        }
      }

      // Get modules using secure RPC function
      const { data: modulesData } = await supabase
        .rpc('get_course_modules', { _course_id: courseInfo.id });

      const modulesResult = modulesData as unknown as ModuleData[] | null;

      if (modulesResult && modulesResult.length > 0) {
        const modulesWithLessons = await Promise.all(
          modulesResult.map(async (mod) => {
            // Get lessons using secure RPC function
            const { data: lessonsData } = await supabase
              .rpc('get_module_lessons', { _module_id: mod.id });
            
            const lessonsResult = lessonsData as unknown as LessonData[] | null;
            
            // Get lessons with their files and videos
            const lessons: Lesson[] = await Promise.all(
              (lessonsResult || []).map(async (lesson) => {
                // Fetch files for this lesson using RPC (bypasses RLS)
                const { data: filesData } = await supabase
                  .rpc('get_lesson_files', { _lesson_id: lesson.id });

                // Fetch videos for this lesson
                const { data: videosData } = await supabase
                  .rpc('get_lesson_videos' as never, { _lesson_id: lesson.id } as never);

                return {
                  id: lesson.id,
                  title: lesson.title,
                  content: lesson.content,
                  video_url: lesson.video_url,
                  duration: lesson.duration,
                  position: lesson.lesson_position,
                  files: filesData || [],
                  videos: (videosData as LessonVideo[] | null) || [],
                  available_from: lesson.available_from || null,
                };
              })
            );

            return {
              id: mod.id,
              title: mod.title,
              position: mod.module_position,
              lessons,
              available_from: mod.available_from || null,
            };
          })
        );
        
        setModules(modulesWithLessons);
        
        // Auto-expand first available module and select lesson
        const now = new Date();
        const allAvailableLessons = modulesWithLessons.flatMap(m => m.lessons).filter(
          l => !l.available_from || new Date(l.available_from) <= now
        );

        // Try to resume last viewed lesson (read directly — courseId not yet in hook closure)
        const lastLessonId = localStorage.getItem(`docourse_last_lesson_${courseInfo.id}`);
        const lastLesson = lastLessonId
          ? allAvailableLessons.find(l => l.id === lastLessonId)
          : null;

        if (lastLesson) {
          // Resume where they left off
          setActiveLesson(lastLesson);
          setShowResumeBanner(true);
          const lastModule = modulesWithLessons.find(m =>
            m.lessons.some(l => l.id === lastLesson.id)
          );
          if (lastModule) setExpandedModules([lastModule.id]);
        } else {
          // Default: first available module + lesson
          const firstAvailableModule = modulesWithLessons.find(
            m => !m.available_from || new Date(m.available_from) <= now
          );
          if (firstAvailableModule) {
            setExpandedModules([firstAvailableModule.id]);
            const firstAvailableLesson = firstAvailableModule.lessons.find(
              l => !l.available_from || new Date(l.available_from) <= now
            );
            if (firstAvailableLesson) {
              setActiveLesson(firstAvailableLesson);
            }
          } else if (modulesWithLessons.length > 0) {
            setExpandedModules([modulesWithLessons[0].id]);
          }
        }
      }

      setIsLoading(false);
    };

    fetchCourse();
  }, [slug, token, router]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Flatten all lessons for navigation
  const allLessons = modules.flatMap(mod => mod.lessons);
  const currentLessonIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Calculate course progress
  const courseProgress = calculateCourseProgress(allLessons.map(l => l.id));

  // Check and issue certificate when course is 100% complete
  useEffect(() => {
    if (isAuthenticated && courseProgress.percentage === 100 && allLessons.length > 0) {
      checkAndIssueCertificate(allLessons.map(l => l.id));
    }
  }, [isAuthenticated, courseProgress.percentage, allLessons, checkAndIssueCertificate]);


  // Toast reminder: "Nu uita să apeși Finalizează lecție"
  const shownReminderRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!activeLesson || !canTrackProgress) return;
    if (getLessonStatus(activeLesson.id) === 'completed') return;
    if (shownReminderRef.current.has(activeLesson.id)) return;
    const timer = setTimeout(() => {
      if (getLessonStatus(activeLesson.id) !== 'completed') {
        shownReminderRef.current.add(activeLesson.id);
        toast('Nu uita să apeși "Finalizează lecție" după ce termini! 😊', {
          duration: 6000,
          position: 'bottom-right',
        });
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [activeLesson?.id]);

  // Scroll sidebar la lecția activă când se schimbă
  useEffect(() => {
    if (!activeLesson) return;
    const timer = setTimeout(() => {
      document.getElementById(`lesson-item-${activeLesson.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    return () => clearTimeout(timer);
  }, [activeLesson?.id]);

  // Auto-enrollment: înscrie utilizatorul autentificat la curs (silențios)
  useEffect(() => {
    if (isAuthenticated && course?.id) {
      supabase.rpc('enroll_in_course' as never, { _course_id: course.id } as never).then(() => {
        // enrollment silențios — nu afișăm toast
      });
    }
  }, [isAuthenticated, course?.id]);

  // Auto-deblochează lecțiile programate fără refresh: setează un timeout
  // pentru cel mai apropiat moment de deblocare din viitor
  useEffect(() => {
    if (modules.length === 0) return;
    const now = Date.now();
    const futureTimes = [
      ...modules.map(m => m.available_from),
      ...modules.flatMap(m => m.lessons.map(l => l.available_from)),
    ]
      .filter(Boolean)
      .map(d => new Date(d!).getTime())
      .filter(t => t > now);

    if (futureTimes.length === 0) return;

    const msUntilNext = Math.min(...futureTimes) - now;
    const timer = setTimeout(() => {
      // Forțăm re-render copiind array-ul — React re-evaluează isScheduledFuture()
      setModules(prev => [...prev]);
      toast.success("O nouă lecție a fost deblocată!");
    }, msUntilNext);

    return () => clearTimeout(timer);
  }, [modules]);

  // ── Logica sequential unlock ──────────────────────────────────────────────

  const isLessonUnlocked = useCallback((lesson: Lesson, mod: Module): boolean => {
    // Dacă lecția are available_from → deblocare strict după timp, fără condiție de completare anterioară
    if (lesson.available_from) return true;

    if (!course?.sequential_unlock) return true; // deblocare secvențială dezactivată

    const moduleIndex = modules.findIndex(m => m.id === mod.id);
    const lessonIndex = mod.lessons.findIndex(l => l.id === lesson.id);

    // Prima lecție din primul modul → mereu deblocată
    if (moduleIndex === 0 && lessonIndex === 0) return true;

    if (lessonIndex === 0) {
      // Prima lecție dintr-un modul non-prim → verifică modulul precedent
      const prevModule = modules[moduleIndex - 1];
      if (!prevModule) return false;

      if (course.unlock_trigger === 'all_lessons') {
        return prevModule.lessons.every(l => getLessonProgress(l.id)?.status === 'completed');
      } else {
        // first_lesson: prima lecție din modulul precedent trebuie finalizată
        const firstLesson = prevModule.lessons[0];
        return !!firstLesson && getLessonProgress(firstLesson.id)?.status === 'completed';
      }
    } else {
      // Lecție non-primă: cea anterioară trebuie finalizată
      const prevLesson = mod.lessons[lessonIndex - 1];
      return !!prevLesson && getLessonProgress(prevLesson.id)?.status === 'completed';
    }
  }, [course, modules, getLessonProgress]);

  // Lecție din trecut nefinalizată (available_from în trecut și status != completed)
  const isMissedLesson = useCallback((lesson: Lesson): boolean => {
    if (!lesson.available_from) return false;
    if (isScheduledFuture(lesson.available_from)) return false;
    const status = getLessonProgress(lesson.id)?.status;
    return status !== 'completed';
  }, [getLessonProgress]);

  const isModuleUnlocked = useCallback((module: Module): boolean => {
    if (!course?.sequential_unlock) return true;

    const moduleIndex = modules.findIndex(m => m.id === module.id);
    if (moduleIndex === 0) return true;

    const prevModule = modules[moduleIndex - 1];
    if (!prevModule) return false;

    if (course.unlock_trigger === 'all_lessons') {
      return prevModule.lessons.every(l => getLessonProgress(l.id)?.status === 'completed');
    } else {
      const firstLesson = prevModule.lessons[0];
      return !!firstLesson && getLessonProgress(firstLesson.id)?.status === 'completed';
    }
  }, [course, modules, getLessonProgress]);

  // Verifică dacă un element e programat pentru viitor
  const isScheduledFuture = (available_from: string | null): boolean => {
    if (!available_from) return false;
    return new Date(available_from) > new Date();
  };

  const formatScheduledDate = (available_from: string): string => {
    return new Date(available_from).toLocaleString("ro-RO", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const navigateToLesson = (lesson: Lesson) => {
    // Gardă: blochează accesul dacă lecția sau modulul ei sunt programate în viitor
    const lessonModule = modules.find(m => m.lessons.some(l => l.id === lesson.id));
    if (isScheduledFuture(lesson.available_from)) {
      toast.error(`Disponibil din ${formatScheduledDate(lesson.available_from!)}`);
      return;
    }
    if (lessonModule && isScheduledFuture(lessonModule.available_from)) {
      toast.error(`Disponibil din ${formatScheduledDate(lessonModule.available_from!)}`);
      return;
    }
    setActiveLesson(lesson);
    saveLastViewedLesson(lesson.id);
    setMobileSidebarOpen(false);
    // Find and expand the module containing this lesson
    if (lessonModule && !expandedModules.includes(lessonModule.id)) {
      setExpandedModules(prev => [...prev, lessonModule.id]);
    }
    // Scroll to top of main content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle file download with clean filename
  const handleFileDownload = useCallback(async (file: LessonFile, lessonId: string) => {
    // Mark as downloaded
    markFileDownloaded(lessonId, file.id);

    // Use direct storage URL for download
    const downloadUrl = file.file_url;

    // Create a temporary link and click it (works better on mobile)
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.file_name; // Set the filename for download
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Descărcarea a început");
  }, [markFileDownloaded]);

  // Get lesson status for display
  const getLessonStatus = (lessonId: string): LessonStatus => {
    const progress = getLessonProgress(lessonId);
    return progress?.status || 'unwatched';
  };

  // Get saved video timestamp for a lesson
  const getSavedTimestamp = (lessonId: string): number => {
    const progress = getLessonProgress(lessonId);
    return progress?.video_timestamp || 0;
  };

  // Detect video provider from URL
  const detectVideoProvider = (url: string): 'youtube' | 'vimeo' | null => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return null;
  };

  // Extract YouTube video ID from any YouTube URL format
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&\n?#]+)/,      // watch?v=ID
      /youtu\.be\/([^&\n?#]+)/,                   // youtu.be/ID
      /youtube\.com\/embed\/([^&\n?#]+)/,          // embed/ID (already embed)
      /youtube\.com\/shorts\/([^&\n?#]+)/,         // shorts/ID
      /youtube\.com\/v\/([^&\n?#]+)/,              // v/ID
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Extract Vimeo video ID + optional private hash
  const getVimeoInfo = (url: string): { id: string; hash?: string } | null => {
    // Handles: vimeo.com/ID, vimeo.com/video/ID, vimeo.com/channels/.../ID,
    //          vimeo.com/groups/.../videos/ID, player.vimeo.com/video/ID,
    //          private: vimeo.com/ID/HASH, player.vimeo.com/video/ID?h=HASH
    const idMatch = url.match(/vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/);
    if (!idMatch) return null;
    const id = idMatch[1];
    // Private hash: /ID/HASH or ?h=HASH
    const hashPath = url.match(/\/\d+\/([a-f0-9]+)/)?.[1];
    const hashQuery = url.match(/[?&]h=([a-zA-Z0-9]+)/)?.[1];
    return { id, hash: hashPath ?? hashQuery };
  };

  // Build proper embed URL with all required params + start time
  const getVideoEmbedUrl = (url: string, lessonId: string): string => {
    const savedTime = getSavedTimestamp(lessonId);
    const provider = detectVideoProvider(url);

    if (provider === 'youtube') {
      const videoId = getYouTubeId(url);
      if (!videoId) return url;
      const startParam = savedTime > 0 ? `&start=${Math.floor(savedTime)}` : '';
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1${startParam}`;
    }

    if (provider === 'vimeo') {
      const info = getVimeoInfo(url);
      if (!info) return url;
      const hashParam = info.hash ? `&h=${info.hash}` : '';
      const startParam = savedTime > 0 ? `#t=${Math.floor(savedTime)}s` : '';
      return `https://player.vimeo.com/video/${info.id}?dnt=1&autopause=0${hashParam}${startParam}`;
    }

    return url;
  };

  if (isLoading || isCheckingAccess || authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isValidToken || !course) {
    return (
      <>
        

        
        <div className="min-h-screen bg-beige/30 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-8 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Acces invalid sau link expirat</h1>
            <p className="text-muted-foreground mb-6">
              Link-ul pe care l-ai accesat nu este valid sau a expirat.
              Contactează creatorul cursului pentru un link nou.
            </p>
            <a href="https://docourse.ro">
              <Button variant="outline">
                Înapoi la DoCourse
              </Button>
            </a>
          </div>
        </div>
      </>
    );
  }

  // Block access if course requires login and user is not authenticated
  if (course.requires_login && !isAuthenticated) {
    const returnUrl = encodeURIComponent(window.location.pathname);
    return (
      <>
        

        
        <div className="min-h-screen bg-beige/30 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-8 max-w-lg text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Autentificare necesară</h1>
            <p className="text-muted-foreground mb-6">
              Cursul <strong>{course.title}</strong> necesită un cont activ. Autentifică-te sau creează un cont gratuit pentru a accesa conținutul.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/student-login?redirect=${returnUrl}`}>
                <Button className="w-full sm:w-auto">
                  Autentifică-te
                </Button>
              </Link>
              <Link href={`/student-register?redirect=${returnUrl}`}>
                <Button variant="outline" className="w-full sm:w-auto">
                  Creează cont gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Block access if membership is required but user doesn't have it
  if (requiresMembership && !hasAccess && requiredPlan) {
    return (
      <>
        

        
        <div className="min-h-screen bg-beige/30 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-8 max-w-lg text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Cursul necesită membership activ</h1>
            <p className="text-muted-foreground mb-2">
              Pentru a accesa <strong>{course.title}</strong>, trebuie să ai un abonament activ la:
            </p>
            <div className="bg-gold/5 rounded-xl border border-gold/20 p-4 my-6">
              <h2 className="text-lg font-bold text-navy mb-1">{requiredPlan.title}</h2>
              {requiredPlan.price_info && (
                <p className="text-gold font-semibold">{requiredPlan.price_info}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/membership/${requiredPlan.slug}`}>
                <Button className="w-full sm:w-auto">
                  Vezi detalii membership
                </Button>
              </Link>
              <a href="https://docourse.ro">
                <Button variant="outline" className="w-full sm:w-auto">
                  Înapoi la DoCourse
                </Button>
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Lecția activă este programată în viitor?
  const activeLessonModule = activeLesson
    ? modules.find(m => m.lessons.some(l => l.id === activeLesson.id))
    : null;
  const isActiveLessonScheduled =
    activeLesson != null &&
    (isScheduledFuture(activeLesson.available_from) ||
      (activeLessonModule != null && isScheduledFuture(activeLessonModule.available_from)));
  const activeLessonBlockedDate = activeLesson
    ? (activeLesson.available_from || activeLessonModule?.available_from || null)
    : null;

  return (
    <>
      


        <meta property="og:title" content={`${course.title} — DoCourse`} />
        <meta property="og:description" content={course.description || ""} />
        <meta property="og:type" content="website" />
        {course.image_url && <meta property="og:image" content={course.image_url} />}
        <meta name="twitter:card" content={course.image_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={course.title} />
        <meta name="twitter:description" content={course.description || ""} />
        {course.image_url && <meta name="twitter:image" content={course.image_url} />}
      

      {/* ── Mobile fixed header ─────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-background border-b border-border flex items-center gap-3 px-4">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-1.5 rounded-lg hover:bg-beige/50 flex-shrink-0"
          aria-label="Deschide navigare"
        >
          <Menu className="w-5 h-5 text-navy" />
        </button>
        {fromCommunity && (
          <Link href={fromCommunity}
            className="flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold/80 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Comunitate
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-sm truncate leading-tight">{course.title}</p>
          {activeLesson && (
            <p className="text-xs text-muted-foreground truncate leading-tight">{activeLesson.title}</p>
          )}
        </div>
        {user && (
          <Link href="/student"
            className="flex-shrink-0 text-xs font-semibold text-navy bg-beige/80 hover:bg-beige px-3 py-1.5 rounded-lg transition-colors"
          >
            Cursurile mele
          </Link>
        )}
      </div>

      <div className="min-h-screen bg-beige/30 flex flex-col lg:flex-row pt-14 lg:pt-0">
        {/* ── Mobile backdrop ───────────────────────────────── */}
        {mobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Course navigation */}
        <aside className={cn(
          "bg-background border-r border-border flex flex-col flex-shrink-0",
          "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs transition-transform duration-300 ease-in-out overflow-hidden",
          mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          "lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:shadow-none lg:w-80 xl:w-96"
        )}>
          <div className="p-4 lg:p-6 border-b border-border flex-shrink-0">
            {/* Mobile close row */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="text-sm font-semibold text-navy">Navigare curs</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-beige/50"
                aria-label="Închide"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {fromCommunity && (
              <Link href={fromCommunity}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold/80 transition-colors mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Înapoi la comunitate
              </Link>
            )}
            {user && (
              <Link href="/student"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy bg-beige/60 hover:bg-beige px-3 py-2 rounded-xl transition-colors mb-4 w-full"
              >
                <ChevronLeft className="w-4 h-4" />
                Toate cursurile mele
              </Link>
            )}
            <Logo size="sm" className="mb-4" />
            {course.image_url && (
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full aspect-video object-cover rounded-xl mb-3"
              />
            )}
            <h1 className="font-bold text-navy text-lg mb-1">{course.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">de {course.creator_name}</p>

            {communityInfo && (
              <a
                href={`/community/${communityInfo.planId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Accesează comunitatea
                </Button>
              </a>
            )}
            
            {/* Course Progress Bar - shown for all users */}
            {canTrackProgress && allLessons.length > 0 && (
              <div className="bg-beige/50 rounded-xl p-3 mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progres curs</span>
                  <span className="font-semibold text-navy">{courseProgress.percentage}%</span>
                </div>
                <Progress value={courseProgress.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {courseProgress.completedLessons} din {courseProgress.totalLessons} lecții finalizate
                </p>
              </div>
            )}
          </div>

          <nav className="p-4 lg:p-6 flex-1 overflow-y-auto overscroll-contain">
            {modules.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Niciun conținut încă.
              </p>
            ) : (
              modules.map((mod) => {
                const moduleUnlocked = isModuleUnlocked(mod);
                const moduleScheduled = isScheduledFuture(mod.available_from);
                return (
                <div key={mod.id} className="mb-4">
                  <button
                    onClick={() => !moduleScheduled && toggleModule(mod.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                      moduleScheduled
                        ? "bg-muted/30 cursor-default opacity-70"
                        : moduleUnlocked
                        ? "bg-beige/50 hover:bg-beige"
                        : "bg-muted/40 cursor-default opacity-60"
                    )}
                  >
                    <span className="font-medium text-navy text-left text-sm flex items-center gap-2">
                      {moduleScheduled ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      ) : course?.sequential_unlock && !moduleUnlocked ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      ) : null}
                      <span>
                        {mod.title}
                        {moduleScheduled && (
                          <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                            Disponibil din {formatScheduledDate(mod.available_from!)}
                          </span>
                        )}
                      </span>
                    </span>
                    {!moduleScheduled && (expandedModules.includes(mod.id) ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ))}
                  </button>

                  {!moduleScheduled && expandedModules.includes(mod.id) && (
                    <ul className="mt-2 space-y-1">
                      {mod.lessons.map((lesson) => {
                        const status = getLessonStatus(lesson.id);
                        const lessonUnlocked = isLessonUnlocked(lesson, mod);
                        const lessonScheduled = isScheduledFuture(lesson.available_from);
                        const missed = canTrackProgress && isMissedLesson(lesson);
                        return (
                          <li key={lesson.id}>
                            <button
                              id={`lesson-item-${lesson.id}`}
                              onClick={() => {
                                if (lessonScheduled) {
                                  toast.error(`Disponibil din ${formatScheduledDate(lesson.available_from!)}`);
                                  return;
                                }
                                if (!lessonUnlocked) {
                                  toast.error("Finalizează lecția anterioară pentru a debloca aceasta.");
                                  return;
                                }
                                setActiveLesson(lesson);
                                setMobileSidebarOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors text-sm",
                                lessonScheduled
                                  ? "opacity-50 cursor-default text-muted-foreground"
                                  : !lessonUnlocked
                                  ? "opacity-50 cursor-default text-muted-foreground"
                                  : activeLesson?.id === lesson.id
                                  ? "bg-gold/10 text-gold"
                                  : missed
                                  ? "border border-amber-300 bg-amber-50/60 text-charcoal hover:bg-amber-50"
                                  : "hover:bg-beige/50 text-charcoal"
                              )}
                            >
                              {/* Status / lock icon */}
                              {lessonScheduled ? (
                                <Lock className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                              ) : course?.sequential_unlock && !lessonUnlocked ? (
                                <Lock className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                              ) : canTrackProgress ? (
                                <LessonStatusIcon status={status} />
                              ) : lesson.videos.length > 0 || lesson.video_url ? (
                                <Play className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span className="flex-1 truncate">{lesson.title}</span>
                              {lessonScheduled && lesson.available_from ? (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(lesson.available_from).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                                </span>
                              ) : missed ? (
                                <span className="text-xs text-amber-600 whitespace-nowrap font-medium">Nefinalizată</span>
                              ) : lesson.duration ? (
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                );
              })
            )}
          </nav>
        </aside>

        {/* Main content - Lesson viewer */}
        <main className="flex-1 p-4 lg:p-8 min-w-0 relative">
          {/* Resume banner */}
          {showResumeBanner && activeLesson && (
            <div className="mb-4 flex items-center gap-3 bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Play className="w-4 h-4 text-gold flex-shrink-0" />
              <p className="text-sm text-navy flex-1">
                <span className="font-semibold">Continuă de unde ai rămas:</span>{" "}
                {activeLesson.title}
              </p>
              <button
                onClick={() => setShowResumeBanner(false)}
                className="text-muted-foreground hover:text-navy transition-colors flex-shrink-0 p-1"
                aria-label="Închide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!activeLesson ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground" />
              <p className="text-muted-foreground">Selectează o lecție pentru a începe</p>
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-gold/10 hover:bg-gold/20 text-navy px-5 py-3 rounded-xl font-medium transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Vezi lecțiile
              </button>
            </div>
          ) : isActiveLessonScheduled ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 py-12">
              <Lock className="w-16 h-16 text-muted-foreground" />
              <h2 className="text-xl font-bold text-navy">{activeLesson.title}</h2>
              <p className="text-muted-foreground">
                {activeLessonBlockedDate
                  ? `Disponibil din ${formatScheduledDate(activeLessonBlockedDate)}`
                  : "Conținut indisponibil momentan"}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {activeLesson.video_url ? (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Video</span>
                      {activeLesson.duration && (
                        <>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{activeLesson.duration}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Lecție</span>
                    </>
                  )}
                  {canTrackProgress && (
                    <>
                      <span>•</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        getLessonStatus(activeLesson.id) === 'completed' && "bg-green-100 text-green-700",
                        getLessonStatus(activeLesson.id) === 'in_progress' && "bg-yellow-100 text-yellow-700",
                        getLessonStatus(activeLesson.id) === 'unwatched' && "bg-muted text-muted-foreground"
                      )}>
                        {getLessonStatus(activeLesson.id) === 'completed' && "Finalizat"}
                        {getLessonStatus(activeLesson.id) === 'in_progress' && "În progres"}
                        {getLessonStatus(activeLesson.id) === 'unwatched' && "Nevizionat"}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-navy">{activeLesson.title}</h2>
              </div>

              {/* Video-uri lecție (multiple) */}
              {activeLesson.videos.length > 0 ? (
                <div className="space-y-6 mb-6">
                  {activeLesson.videos.map((video, idx) => {
                    const embedKey = `${activeLesson.id}-${video.id}`;
                    const embedFailed = failedEmbeds.has(embedKey);
                    return (
                      <div key={video.id}>
                        {video.title && (
                          <h3 className="text-sm font-medium text-navy mb-2">{video.title}</h3>
                        )}
                        <div className="aspect-video bg-navy rounded-2xl overflow-hidden relative">
                          {embedFailed ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white p-6">
                              <Play className="w-10 h-10 opacity-60" />
                              <p className="text-sm opacity-80 text-center">Videoclipul nu poate fi redat direct.</p>
                              <a
                                href={video.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gold text-navy font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gold/90 transition-colors"
                              >
                                Deschide videoclipul
                              </a>
                            </div>
                          ) : (
                            <iframe
                              ref={idx === 0 ? videoRef : undefined}
                              src={getVideoEmbedUrl(video.video_url, activeLesson.id)}
                              title={video.title || activeLesson.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                              allowFullScreen
                              onError={() => setFailedEmbeds(prev => new Set(prev).add(embedKey))}
                            />
                          )}
                          {idx === 0 && !embedFailed && canTrackProgress && getSavedTimestamp(activeLesson.id) > 0 && (
                            <div className="absolute bottom-4 left-4 bg-navy/80 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              <span>Reia de la {formatTime(getSavedTimestamp(activeLesson.id))}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : activeLesson.video_url ? (
                <div className="aspect-video bg-navy rounded-2xl overflow-hidden mb-6 relative">
                  {failedEmbeds.has(activeLesson.id) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white p-6">
                      <Play className="w-10 h-10 opacity-60" />
                      <p className="text-sm opacity-80 text-center">Videoclipul nu poate fi redat direct.</p>
                      <a
                        href={activeLesson.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gold text-navy font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gold/90 transition-colors"
                      >
                        Deschide videoclipul
                      </a>
                    </div>
                  ) : (
                    <iframe
                      ref={videoRef}
                      src={getVideoEmbedUrl(activeLesson.video_url, activeLesson.id)}
                      title={activeLesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      onError={() => setFailedEmbeds(prev => new Set(prev).add(activeLesson.id))}
                    />
                  )}
                  {!failedEmbeds.has(activeLesson.id) && canTrackProgress && getSavedTimestamp(activeLesson.id) > 0 && (
                    <div className="absolute bottom-4 left-4 bg-navy/80 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>Reia de la {formatTime(getSavedTimestamp(activeLesson.id))}</span>
                    </div>
                  )}
                </div>
              ) : null}

              {activeLesson.content && (
                <div className="bg-background rounded-2xl border border-border p-6 sm:p-8 mb-6">
                  {/<[a-z][\s\S]*>/i.test(activeLesson.content) ? (
                    // Conținut HTML (rich text) — randare sigură cu DOMPurify
                    <div
                      className="prose prose-navy max-w-none break-words overflow-wrap-anywhere overflow-x-hidden"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLesson.content) }}
                    />
                  ) : (
                    // Text simplu din textarea — whitespace-pre-line păstrează Enter-urile
                    <div className="text-base text-navy leading-7 break-words whitespace-pre-line overflow-x-hidden">
                      {activeLesson.content}
                    </div>
                  )}
                </div>
              )}

              {/* Audio / Meditations Section - Separate from documents */}
              {activeLesson.files.filter(f => isAudioFile(f.file_type)).length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border-2 border-purple-300 p-4 sm:p-6 mb-6">
                  <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
                    <Music className="w-6 h-6 text-purple-600" />
                    🎵 Audio / Meditații ({activeLesson.files.filter(f => isAudioFile(f.file_type)).length})
                  </h3>
                  <div className="space-y-4">
                    {activeLesson.files.filter(f => isAudioFile(f.file_type)).map((file) => {
                      const downloaded = isFileDownloaded(activeLesson.id, file.id);
                      return (
                        <div key={file.id} className="rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-sm">
                          <div className="bg-purple-100 px-4 py-3 flex items-center gap-2 border-b border-purple-200">
                            <Headphones className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-purple-900 text-sm truncate flex-1">
                              {cleanFileName(file.file_name)}
                            </span>
                            {downloaded && (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                <Check className="w-4 h-4" />
                                Ascultat
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <AudioPlayer
                              src={file.file_url}
                              title={cleanFileName(file.file_name)}
                              onComplete={() => {
                                if (!downloaded) {
                                  markFileDownloaded(activeLesson.id, file.id);
                                }
                              }}
                              className="border-0 bg-transparent p-0"
                            />
                          </div>
                          <div className="px-4 pb-4">
                            <button
                              onClick={() => handleFileDownload(file, activeLesson.id)}
                              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full text-sm"
                            >
                              <Download className="w-4 h-4" />
                              {downloaded ? 'Descarcă din nou' : 'Descarcă audio'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents Section - Separate from audio */}
              {activeLesson.files.filter(f => !isAudioFile(f.file_type)).length > 0 && (
                <div className="bg-gold/10 rounded-2xl border-2 border-gold p-4 sm:p-6 mb-6">
                  <h3 className="font-bold text-navy mb-4 flex items-center gap-2 text-lg">
                    <Download className="w-6 h-6 text-gold" />
                    📄 Documente ({activeLesson.files.filter(f => !isAudioFile(f.file_type)).length})
                  </h3>
                  <div className="space-y-3">
                    {activeLesson.files.filter(f => !isAudioFile(f.file_type)).map((file) => {
                      const downloaded = isFileDownloaded(activeLesson.id, file.id);
                      const isPdf = file.file_type.toLowerCase() === "pdf";
                      const isWord = ["doc", "docx"].includes(file.file_type.toLowerCase());

                      // Get preview URL for opening in new tab
                      const getPreviewUrl = () => {
                        if (isPdf) return file.file_url;
                        if (isWord) return `https://docs.google.com/viewer?url=${encodeURIComponent(file.file_url)}&embedded=true`;
                        return file.file_url;
                      };

                      return (
                        <div key={file.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-background border-2 border-gold/30">
                          <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
                            {isPdf ? (
                              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-red-500" />
                              </div>
                            ) : isWord ? (
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FileType className="w-6 h-6 text-blue-500" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="block text-charcoal font-semibold text-base truncate">
                                {cleanFileName(file.file_name)}
                              </span>
                              <span className="text-xs text-muted-foreground uppercase">
                                {file.file_type}
                              </span>
                            </div>
                            {downloaded && (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                <Check className="w-4 h-4" />
                                Descărcat
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            {(isPdf || isWord) && (
                              <a
                                href={getPreviewUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-sky/10 hover:bg-sky/20 text-sky px-4 py-2 rounded-lg font-medium transition-colors flex-1 sm:flex-initial text-sm"
                              >
                                <Maximize2 className="w-4 h-4" />
                                <span>Deschide</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleFileDownload(file, activeLesson.id)}
                              className="flex items-center justify-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-colors flex-1 sm:flex-initial text-sm"
                            >
                              <Download className="w-5 h-5" />
                              <span>{downloaded ? 'Descarcă din nou' : 'Descarcă'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!activeLesson.video_url && !activeLesson.content && activeLesson.files.length === 0 && (
                <div className="bg-background rounded-2xl border border-border p-6 sm:p-8 mb-6">
                  <p className="text-muted-foreground text-center">
                    Conținutul acestei lecții nu este disponibil încă.
                  </p>
                </div>
              )}

              {/* Mark as completed button for all lessons */}
              {canTrackProgress && getLessonStatus(activeLesson.id) !== 'completed' && (
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={() => markLessonCompleted(activeLesson.id)}
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto min-h-[48px]"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Marchează ca finalizat
                  </Button>
                </div>
              )}

              {/* Show completed status + prompt continuare */}
              {canTrackProgress && getLessonStatus(activeLesson.id) === 'completed' && (
                <div className="mb-6 space-y-3">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                      Lecție finalizată
                    </div>
                  </div>
                  {nextLesson && (() => {
                    const nextModule = modules.find(m => m.lessons.some(l => l.id === nextLesson.id));
                    const nextUnlocked = nextModule ? isLessonUnlocked(nextLesson, nextModule) : false;
                    const nextScheduled = isScheduledFuture(nextLesson.available_from);
                    const nextModuleScheduled = nextModule ? isScheduledFuture(nextModule.available_from) : false;
                    if (!nextUnlocked || nextScheduled || nextModuleScheduled) return null;
                    return (
                      <div className="flex justify-center">
                        <Button
                          onClick={() => navigateToLesson(nextLesson)}
                          className="bg-gold hover:bg-gold/90 text-navy font-semibold"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Continuă cu: {nextLesson.title}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Previous/Next Navigation */}
              <div className="flex items-stretch gap-3 pt-4 border-t border-border overflow-hidden">
                {previousLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => navigateToLesson(previousLesson)}
                    className="flex items-center gap-2 flex-1 min-w-0 h-auto py-3 min-h-[56px]"
                  >
                    <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                    <span className="min-w-0 text-left">
                      <span className="text-xs text-muted-foreground block">Anterioară</span>
                      <span className="text-sm font-medium block truncate">{previousLesson.title}</span>
                    </span>
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                {nextLesson ? (() => {
                  const nextModule = modules.find(m => m.lessons.some(l => l.id === nextLesson.id));
                  const nextUnlocked = nextModule ? isLessonUnlocked(nextLesson, nextModule) : true;
                  const nextScheduled = isScheduledFuture(nextLesson.available_from);
                  const nextModuleScheduled = nextModule ? isScheduledFuture(nextModule.available_from) : false;
                  const isBlocked = !nextUnlocked || nextScheduled || nextModuleScheduled;
                  return (
                    <Button
                      onClick={() => {
                        if (nextScheduled || nextModuleScheduled) {
                          const dateStr = nextScheduled
                            ? formatScheduledDate(nextLesson.available_from!)
                            : formatScheduledDate(nextModule!.available_from!);
                          toast.error(`Disponibil din ${dateStr}`);
                          return;
                        }
                        if (!nextUnlocked) {
                          toast.error("Finalizează lecția curentă pentru a debloca lecția următoare.");
                          return;
                        }
                        navigateToLesson(nextLesson);
                      }}
                      className={cn(
                        "flex items-center gap-2 flex-1 min-w-0 h-auto py-3 min-h-[56px]",
                        !isBlocked
                          ? "bg-gold hover:bg-gold/90 text-navy"
                          : "bg-muted text-muted-foreground cursor-default opacity-60"
                      )}
                    >
                      <span className="min-w-0 text-right flex-1">
                        <span className="text-xs opacity-80 flex items-center gap-1 justify-end">
                          {isBlocked && <Lock className="w-3 h-3" />}
                          Următoarea
                        </span>
                        <span className="text-sm font-medium block truncate">{nextLesson.title}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </Button>
                  );
                })() : (
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                    <BookOpen className="w-5 h-5" />
                    <span>Curs finalizat!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Fullscreen File Dialog */}
      <Dialog open={!!fullscreenFile} onOpenChange={() => setFullscreenFile(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0">
          <DialogHeader className={`p-4 border-b border-border ${fullscreenFile?.file_type.toLowerCase() === "pdf" ? "bg-red-100" : "bg-blue-100"}`}>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-navy">
                {fullscreenFile?.file_type.toLowerCase() === "pdf" ? (
                  <FileText className="w-5 h-5 text-red-500" />
                ) : (
                  <FileType className="w-5 h-5 text-blue-500" />
                )}
                {fullscreenFile && cleanFileName(fullscreenFile.file_name)}
              </DialogTitle>
            </div>
          </DialogHeader>
          {fullscreenFile && (
            <iframe
              src={
                fullscreenFile.file_type.toLowerCase() === "pdf"
                  ? `${fullscreenFile.file_url}#toolbar=1&navpanes=1`
                  : `https://docs.google.com/gview?url=${encodeURIComponent(fullscreenFile.file_url)}&embedded=true`
              }
              title={fullscreenFile.file_name}
              className="w-full flex-1 h-full"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Convertește text simplu (cu \n) la HTML cu paragrafe/line-breaks
// Dacă textul conține deja taguri HTML, îl lasă neatins
function contentToHtml(text: string): string {
  if (/<[a-z][\s\S]*>/i.test(text)) return text; // deja HTML
  return text
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Helper function to clean file names (remove timestamps)
function cleanFileName(fileName: string): string {
  // Remove timestamp prefixes like "1764702181685_"
  let cleaned = fileName.replace(/^\d{13,}_/, '');
  // Replace underscores with spaces
  cleaned = cleaned.replace(/_+/g, ' ');
  return cleaned.trim() || fileName;
}

// Helper function to check if file is audio
function isAudioFile(fileType: string): boolean {
  return ["mp3", "wav", "m4a", "ogg", "webm", "aac", "flac"].includes(fileType.toLowerCase());
}

// Helper function to format time in mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default PublicCourse;
