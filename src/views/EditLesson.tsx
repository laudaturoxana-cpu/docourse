"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  FileText,
  FileType,
  Film,
  AlertCircle,
  Download,
  Headphones,
  Music,
  Eye
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import AudioPlayer from "@/components/AudioPlayer";

interface LessonFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
}

interface LessonVideo {
  id: string;
  title: string;
  video_url: string;
  video_provider: string;
  position: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  module_id: string;
  available_from: string | null;
}

interface CourseInfo {
  id: string;
  title: string;
}

// Detect video provider from URL (check domain first, then extract ID)
const detectVideoProvider = (url: string): 'youtube' | 'vimeo' | null => {
  if (!url.trim()) return null;
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('vimeo.com')) return 'vimeo';
  return null;
};

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Extract Vimeo video ID and optional hash from various URL formats
const extractVimeoInfo = (url: string): { id: string; hash?: string } | null => {
  if (!url) return null;

  // Match vimeo.com/ID/HASH format (private videos)
  const privateMatch = url.match(/vimeo\.com\/(\d+)\/([a-zA-Z0-9]+)/);
  if (privateMatch) {
    return { id: privateMatch[1], hash: privateMatch[2] };
  }

  // Match vimeo.com/ID format (public videos)
  const publicMatch = url.match(/vimeo\.com\/(\d+)/);
  if (publicMatch) {
    return { id: publicMatch[1] };
  }

  // Match player embed URLs with hash
  const playerHashMatch = url.match(/player\.vimeo\.com\/video\/(\d+)\?h=([a-zA-Z0-9]+)/);
  if (playerHashMatch) {
    return { id: playerHashMatch[1], hash: playerHashMatch[2] };
  }

  // Match player embed URLs without hash
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) {
    return { id: playerMatch[1] };
  }

  return null;
};

// For backwards compatibility
const extractVimeoId = (url: string): string | null => {
  const info = extractVimeoInfo(url);
  return info?.id || null;
};

const isValidVideoUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Empty is valid (no video)
  const provider = detectVideoProvider(url);
  if (provider === 'youtube') return extractYouTubeId(url) !== null;
  if (provider === 'vimeo') return extractVimeoId(url) !== null;
  return false;
};

const EditLesson = () => {
  const _params = useParams<{ courseId: string; lessonId: string }>();
  const courseId = _params?.courseId;
  const lessonId = _params?.lessonId;
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Check if user has active subscription
  const hasActiveSubscription = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [files, setFiles] = useState<LessonFile[]>([]);
  const [videos, setVideos] = useState<LessonVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; url: string; name: string } | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const pendingNavRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Auto-save draft to localStorage whenever lesson/videos change
  useEffect(() => {
    if (!lesson || !lessonId || isLoading) return;
    const draft = { title: lesson.title, content: lesson.content, videos, savedAt: Date.now() };
    localStorage.setItem(`docourse_draft_lesson_${lessonId}`, JSON.stringify(draft));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.title, lesson?.content, videos, lessonId, isLoading]);

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId || !courseId || !profile?.id) return;

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (lessonError || !lessonData) {
        toast({
          title: "Eroare",
          description: "Lecția nu a fost găsită.",
          variant: "destructive",
        });
        router.push(`/dashboard/courses/${courseId}`);
        return;
      }

      // Verify ownership through module -> course -> creator
      const { data: moduleData } = await supabase
        .from("modules")
        .select("course_id")
        .eq("id", lessonData.module_id ?? "")
        .single();

      if (!moduleData) {
        router.push(`/dashboard/courses/${courseId}`);
        return;
      }

      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title, creator_id")
        .eq("id", moduleData.course_id ?? "")
        .eq("creator_id", profile.id ?? "")
        .single();

      if (!courseData) {
        toast({
          title: "Acces refuzat",
          description: "Nu ai permisiunea să editezi această lecție.",
          variant: "destructive",
        });
        router.push("/dashboard/courses");
        return;
      }

      setCourse({ id: courseData.id, title: courseData.title });

      // Check for a newer draft in localStorage
      try {
        const draftRaw = localStorage.getItem(`docourse_draft_lesson_${lessonId}`);
        if (draftRaw) {
          const draft = JSON.parse(draftRaw);
          const dbUpdatedAt = lessonData.updated_at ? new Date(lessonData.updated_at).getTime() : 0;
          // If draft is newer than last DB save, offer to restore
          if (draft.savedAt > dbUpdatedAt + 5000) {
            setLesson({ ...lessonData, title: draft.title, content: draft.content } as unknown as Lesson);
            setHasDraftRestored(true);
            if (draft.videos?.length > 0) {
              // videos restored later after setVideos below
              setTimeout(() => setVideos(draft.videos), 0);
            }
            setHasUnsavedChanges(true);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // ignore draft errors
      }

      setLesson(lessonData as unknown as Lesson);

      // Fetch lesson files
      const { data: filesData } = await supabase
        .from("lesson_files")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at");

      if (filesData) {
        setFiles(filesData as unknown as LessonFile[]);
      }

      // Fetch lesson videos (multiple videos support)
      const { data: videosData } = await supabase
        .from("lesson_videos")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("position");

      if (videosData && videosData.length > 0) {
        setVideos(videosData as unknown as LessonVideo[]);
      } else if (lessonData.video_url) {
        // Fallback: dacă nu există în lesson_videos dar există video_url vechi
        setVideos([{
          id: "temp-" + Date.now(),
          title: "",
          video_url: lessonData.video_url,
          video_provider: "youtube",
          position: 0
        }]);
      }

      setIsLoading(false);
    };

    if (profile?.id) {
      fetchData();
    }
  }, [lessonId, courseId, profile?.id, router]);

  const handleSave = async () => {
    if (!lesson) return;

    setIsSaving(true);
    setVideoUrlError(null);

    try {
      // Parse available_from safely
      let availableFrom: string | null = null;
      if (lesson.available_from) {
        const parsed = new Date(lesson.available_from);
        if (isNaN(parsed.getTime())) {
          toast({ title: "Eroare", description: "Data de disponibilitate este invalidă.", variant: "destructive" });
          setIsSaving(false);
          return;
        }
        availableFrom = parsed.toISOString();
      }

      // Save lesson (title, content, available_from)
      const { error } = await supabase
        .from("lessons")
        .update({
          title: lesson.title,
          content: lesson.content,
          available_from: availableFrom,
        })
        .eq("id", lesson.id);

      if (error) {
        toast({ title: "Eroare", description: "Nu s-a putut salva lecția: " + error.message, variant: "destructive" });
        setIsSaving(false);
        return;
      }

      // Sync lesson_videos: delete all + re-insert
      // Keep old videos in memory for rollback if insert fails
      const validVideos = videos.filter(v => v.video_url.trim());

      const { error: deleteError } = await supabase
        .from("lesson_videos")
        .delete()
        .eq("lesson_id", lesson.id);

      if (deleteError) {
        toast({ title: "Eroare", description: "Nu s-au putut salva video-urile.", variant: "destructive" });
        setIsSaving(false);
        return;
      }

      if (validVideos.length > 0) {
        const toInsert = validVideos.map((v, i) => {
          const provider = detectVideoProvider(v.video_url) || 'youtube';
          let embedUrl = v.video_url;
          if (provider === 'youtube') {
            const id = extractYouTubeId(v.video_url);
            embedUrl = id ? `https://www.youtube.com/embed/${id}` : v.video_url;
          } else if (provider === 'vimeo') {
            const info = extractVimeoInfo(v.video_url);
            if (info) {
              const params = 'title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0';
              embedUrl = info.hash
                ? `https://player.vimeo.com/video/${info.id}?h=${info.hash}&${params}`
                : `https://player.vimeo.com/video/${info.id}?${params}`;
            }
          }
          return {
            lesson_id: lesson.id,
            title: v.title || null,
            video_url: embedUrl,
            video_provider: provider,
            position: i,
          };
        });

        const { error: insertError } = await supabase
          .from("lesson_videos")
          .insert(toInsert);

        if (insertError) {
          toast({ title: "Eroare", description: "Video-urile nu s-au putut salva: " + insertError.message, variant: "destructive" });
          setIsSaving(false);
          return;
        }
      }

      setHasUnsavedChanges(false);
      setHasDraftRestored(false);
      localStorage.removeItem(`docourse_draft_lesson_${lessonId}`);
      toast({ title: "Salvat!", description: "Modificările au fost salvate." });
    } catch (err) {
      console.error("Save error:", err);
      toast({ title: "Eroare neașteptată", description: "Încearcă din nou.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleVideoUrlChange = (url: string) => {
    setLesson(prev => prev ? { ...prev, video_url: url } : null);
    if (url && !isValidVideoUrl(url)) {
      setVideoUrlError("Doar link-uri YouTube sau Vimeo sunt acceptate");
    } else {
      setVideoUrlError(null);
    }
  };

  const addVideo = () => {
    setVideos(prev => [...prev, { id: "new-" + Date.now(), title: "", video_url: "", video_provider: "youtube", position: prev.length }]);
  };

  const updateVideo = (index: number, field: "title" | "video_url", value: string) => {
    setVideos(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
    setHasUnsavedChanges(true);
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  // Sanitize filename for storage (remove special chars, spaces, dashes, etc.)
  const sanitizeFileName = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const baseName = name.slice(0, -(ext.length + 1));
    const sanitized = baseName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[\u2010-\u2015]/g, '-') // Normalize all dash types to regular hyphen
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace ALL non-alphanumeric with underscore
      .replace(/_+/g, '_') // Remove multiple underscores
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
      .slice(0, 50); // Limit length
    return `${sanitized || 'file'}.${ext}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || !lesson) return;

    setIsUploading(true);

    for (const file of Array.from(selectedFiles)) {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = sanitizeFileName(file.name);
      const storagePath = `${lesson.id}/${Date.now()}_${sanitizedName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("lesson-files")
        .upload(storagePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast({
          title: "Eroare",
          description: `Nu s-a putut încărca ${file.name}: ${uploadError.message}`,
          variant: "destructive",
        });
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("lesson-files")
        .getPublicUrl(storagePath);

      // Save to lesson_files table
      const { data: fileRecord, error: dbError } = await supabase
        .from("lesson_files")
        .insert({
          lesson_id: lesson.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: fileExt || "unknown",
          file_size: file.size
        })
        .select()
        .single();

      if (!dbError && fileRecord) {
        setFiles(prev => [...prev, fileRecord as unknown as LessonFile]);
        toast({
          title: "Încărcat!",
          description: `${file.name} a fost încărcat.`,
        });
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const { id: fileId, url: fileUrl } = fileToDelete;

    const urlParts = fileUrl.split("/lesson-files/");
    const filePath = urlParts[1];
    if (filePath) {
      await supabase.storage.from("lesson-files").remove([filePath]);
    }

    const { error } = await supabase
      .from("lesson_files")
      .delete()
      .eq("id", fileId);

    if (!error) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({ title: "Fișier șters!" });
    }
    setFileToDelete(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
    if (["doc", "docx"].includes(fileType)) return <FileType className="w-5 h-5 text-blue-500" />;
    if (["mp3", "wav", "m4a", "ogg", "webm", "aac", "flac"].includes(fileType)) {
      return <Headphones className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  // Check if file is audio
  const isAudioFile = (fileType: string) => {
    return ["mp3", "wav", "m4a", "ogg", "webm", "aac", "flac"].includes(fileType.toLowerCase());
  };

  // Check if file is a previewable document
  const isPreviewableDocument = (fileType: string) => {
    return ["pdf", "doc", "docx"].includes(fileType.toLowerCase());
  };

  // Get preview URL for documents
  const getDocumentPreviewUrl = (file: LessonFile): string => {
    const fileType = file.file_type.toLowerCase();
    if (fileType === "pdf") {
      // PDF can be embedded directly
      return file.file_url;
    }
    // Word docs use Google Docs viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(file.file_url)}&embedded=true`;
  };

  // Separate files into audio and documents
  const audioFiles = files.filter(f => isAudioFile(f.file_type));
  const documentFiles = files.filter(f => !isAudioFile(f.file_type));

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Preview video embed (YouTube or Vimeo)
  const previewProvider = lesson?.video_url ? detectVideoProvider(lesson.video_url) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const previewYouTubeId = previewProvider === 'youtube' ? extractYouTubeId(lesson!.video_url!) : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const previewVimeoInfo = previewProvider === 'vimeo' ? extractVimeoInfo(lesson!.video_url!) : null;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !lesson || !course) return null;

  // Block access if no active subscription
  if (!authLoading && profile && !hasActiveSubscription) {
    return <SubscriptionRequired />;
  }

  // Convertește UTC ISO string → format local pentru datetime-local input
  const toLocalDatetimeInput = (utcString: string): string => {
    const d = new Date(utcString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <>
      

      

      <div className="min-h-screen bg-beige/30">
        <header className="bg-background border-b border-border px-4 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    pendingNavRef.current = `/dashboard/courses/${courseId}`;
                    setShowUnsavedDialog(true);
                  } else {
                    router.push(`/dashboard/courses/${courseId}`);
                  }
                }}
                className="p-2 rounded-lg hover:bg-beige transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal" />
              </button>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && !isSaving && (
                <span className="text-xs text-amber-600 font-medium hidden sm:block">
                  Modificări nesalvate
                </span>
              )}
              <Button
                variant="gold"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Se salvează..." : "Salvează"}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Draft restored banner */}
            {hasDraftRestored && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Am restaurat o versiune mai recentă salvată local (draft). Apasă <strong>Salvează</strong> pentru a o confirma sau{" "}
                  <button
                    className="underline hover:no-underline"
                    onClick={() => {
                      localStorage.removeItem(`docourse_draft_lesson_${lessonId}`);
                      window.location.reload();
                    }}
                  >
                    renunță la draft
                  </button>
                  .
                </p>
              </div>
            )}
            {/* Title + available_from */}
            <div className="bg-background rounded-2xl border border-border p-4 sm:p-6 space-y-4">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold text-navy mb-4 block">
                  Titlu lecție
                </Label>
                <Input
                  id="title"
                  value={lesson.title}
                  onChange={(e) => { setLesson({ ...lesson, title: e.target.value }); setHasUnsavedChanges(true); }}
                  className="text-base sm:text-xl font-medium h-11 sm:h-14"
                  placeholder="Titlul lecției"
                />
              </div>
              <div className="pt-4 border-t border-border">
                <Label className="text-sm font-medium text-navy mb-2 block">
                  Programare acces lecție
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Lecția va fi vizibilă cursanților abia de la data și ora aleasă. Lasă gol pentru acces imediat.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="datetime-local"
                    className="flex-1 h-10 text-sm rounded-md border border-border bg-background px-3 text-navy"
                    value={lesson.available_from ? toLocalDatetimeInput(lesson.available_from) : ""}
                    onChange={(e) => setLesson({ ...lesson, available_from: e.target.value || null })}
                  />
                  {lesson.available_from && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setLesson({ ...lesson, available_from: null })}
                    >
                      Elimină
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Video-uri (multiple) */}
            <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <Film className="w-5 h-5 text-gold flex-shrink-0" />
                  <Label className="text-base sm:text-lg font-semibold text-navy">Video-uri lecție</Label>
                </div>
                <Button variant="outline" size="sm" onClick={addVideo} className="flex-shrink-0">
                  + Adaugă video
                </Button>
              </div>

              {videos.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <Film className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Niciun video adăugat. Apasă "+ Adaugă video" pentru a adăuga.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video, index) => {
                    const provider = detectVideoProvider(video.video_url);
                    const ytId = provider === 'youtube' ? extractYouTubeId(video.video_url) : null;
                    const vimeoInfo = provider === 'vimeo' ? extractVimeoInfo(video.video_url) : null;
                    const hasError = video.video_url.trim() && !provider;
                    return (
                      <div key={video.id} className="border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-navy">Video {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeVideo(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Titlu (opțional)</Label>
                          <Input
                            value={video.title}
                            onChange={(e) => updateVideo(index, "title", e.target.value)}
                            placeholder="Ex: Introducere, Partea 1..."
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            Link YouTube sau Vimeo
                          </Label>
                          <Input
                            value={video.video_url}
                            onChange={(e) => updateVideo(index, "video_url", e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=... sau https://vimeo.com/..."
                            className={hasError ? "border-destructive h-9 text-sm" : "h-9 text-sm"}
                          />
                          {hasError && (
                            <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
                              <AlertCircle className="w-3 h-3" />
                              Doar link-uri YouTube sau Vimeo sunt acceptate
                            </div>
                          )}
                          {provider && !hasError && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Detectat: {provider === 'youtube' ? 'YouTube' : 'Vimeo'}
                            </p>
                          )}
                        </div>
                        {ytId && (
                          <div className="aspect-video bg-navy rounded-lg overflow-hidden">
                            <iframe src={`https://www.youtube.com/embed/${ytId}`} title="Preview" className="w-full h-full" allowFullScreen />
                          </div>
                        )}
                        {vimeoInfo && (
                          <div className="aspect-video bg-navy rounded-lg overflow-hidden">
                            <iframe
                              src={vimeoInfo.hash
                                ? `https://player.vimeo.com/video/${vimeoInfo.id}?h=${vimeoInfo.hash}&title=0&byline=0&portrait=0`
                                : `https://player.vimeo.com/video/${vimeoInfo.id}?title=0&byline=0&portrait=0`}
                              title="Preview" className="w-full h-full" allowFullScreen
                              allow="autoplay; fullscreen; picture-in-picture"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {videos.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="gold" size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Se salvează..." : "Salvează videourile"}
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
              <Label className="text-lg font-semibold text-navy mb-4 block">
                Descriere / Text lecție
              </Label>
              <RichTextEditor
                value={lesson.content || ""}
                onChange={(html) => { setLesson({ ...lesson, content: html }); setHasUnsavedChanges(true); }}
                placeholder="Adaugă descrierea sau conținutul lecției..."
              />
            </div>

            {/* Audio / Meditations Section */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border-2 border-purple-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-600" />
                  <Label className="text-lg font-semibold text-purple-900">🎵 Audio / Meditații</Label>
                </div>
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept=".mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Se încarcă..." : "Încarcă audio"}
                </Button>
              </div>

              {audioFiles.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-xl bg-white/50">
                  <Headphones className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-600">
                    Niciun fișier audio. Încarcă MP3, WAV sau alte formate audio.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {audioFiles.map((file) => (
                    <div key={file.id} className="bg-white rounded-xl border border-purple-200 overflow-hidden">
                      <AudioPlayer
                        src={file.file_url}
                        title={file.file_name}
                      />
                      <div className="flex items-center gap-3 px-4 py-2 border-t border-purple-100 bg-purple-50/50">
                        <Headphones className="w-4 h-4 text-purple-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-purple-900 truncate">{file.file_name}</p>
                          <p className="text-xs text-purple-600">
                            {file.file_type.toUpperCase()} • {formatFileSize(file.file_size)}
                          </p>
                        </div>
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4 text-purple-500" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFileToDelete({ id: file.id, url: file.file_url, name: file.file_name })}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  <Label className="text-lg font-semibold text-navy">📄 Documente descărcabile</Label>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Se încarcă..." : "Încarcă documente"}
                </Button>
              </div>

              {documentFiles.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Niciun document încă. Încarcă PDF, Word sau alte fișiere.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documentFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-beige/50 border border-border">
                      {getFileIcon(file.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_type.toUpperCase()} • {formatFileSize(file.file_size)}
                        </p>
                      </div>
                      {isPreviewableDocument(file.file_type) && (
                        <a
                          href={getDocumentPreviewUrl(file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-sky/10 hover:bg-sky/20 text-sky rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Deschide</span>
                        </a>
                      )}
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFileToDelete({ id: file.id, url: file.file_url, name: file.file_name })}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialog: modificări nesalvate la navigare */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ai modificări nesalvate</AlertDialogTitle>
            <AlertDialogDescription>
              Dacă pleci acum, modificările tale vor fi pierdute. Ești sigur că vrei să continui?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowUnsavedDialog(false); pendingNavRef.current = null; }}>
              Rămâi pe pagină
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                if (pendingNavRef.current) router.push(pendingNavRef.current);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Pleacă fără să salvezi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: confirmare ștergere fișier */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => { if (!open) setFileToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergi fișierul?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{fileToDelete?.name}</strong> va fi șters definitiv și nu poate fi recuperat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFile}
              className="bg-destructive hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditLesson;
