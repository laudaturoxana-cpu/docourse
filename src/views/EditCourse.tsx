"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  Trash2,
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  Settings,
  Pencil,
  Crown,
  Users,
  Info,
  AlertCircle,
  Image,
  Sparkles,
  Zap,
  Link as LinkIcon,
  Magnet,
  RefreshCw,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  description: string | null;
  position: number;
  lessons: Lesson[];
  available_from: string | null;
  isEditingTitle?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  position: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  access_token: string;
  is_published: boolean;
  requires_login: boolean;
  sequential_unlock: boolean;
  unlock_trigger: string;
  image_url: string | null;
  payment_link: string | null;
  is_publicly_listed: boolean;
  is_lead_magnet: boolean;
  lead_list_id: string | null;
  capture_headline: string | null;
  capture_subheadline: string | null;
  capture_bullets: string[];
  capture_cta: string | null;
  thankyou_headline: string | null;
  thankyou_message: string | null;
}

const EditCourse = () => {
  const _params = useParams<{ id: string }>();
  const id = _params?.id;
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isPro } = useSubscriptionCheck();

  // Check if user has active subscription
  const hasActiveSubscription = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showNewModule, setShowNewModule] = useState(false);
  const [newLessonModule, setNewLessonModule] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editingModuleTitle, setEditingModuleTitle] = useState<{ id: string; title: string } | null>(null);
  const [emailLists, setEmailLists] = useState<{ id: string; name: string }[]>([]);
  const [generatingCapture, setGeneratingCapture] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profile?.id) return;
    supabase.from("email_lists").select("id, name").eq("creator_id", profile.id).order("name")
      .then(({ data }) => { if (data) setEmailLists(data); });
  }, [profile?.id]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id || !profile?.id) return;

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .eq("creator_id", profile.id)
        .single();

      if (courseError || !courseData) {
        toast({
          title: "Eroare",
          description: "Cursul nu a fost găsit.",
          variant: "destructive",
        });
        router.push("/dashboard/courses");
        return;
      }

      setCourse(courseData as unknown as Course);

      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", id)
        .order("position");

      if (modulesData) {
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (mod) => {
            const { data: lessonsData } = await supabase
              .from("lessons")
              .select("*")
              .eq("module_id", mod.id)
              .order("position");
            return { ...mod, lessons: lessonsData || [] };
          })
        );
        setModules(modulesWithLessons);
        if (modulesWithLessons.length > 0) {
          setExpandedModules([modulesWithLessons[0].id]);
        }
      }

      setIsLoading(false);
    };

    if (profile?.id) {
      fetchCourse();
    }
  }, [id, profile?.id, router]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !course) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Eroare", description: "Imaginea trebuie să fie mai mică de 5MB.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Eroare", description: "Doar imagini PNG, JPG sau WebP sunt permise.", variant: "destructive" });
      return;
    }

    setIsUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${course.id}/cover.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-covers')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-covers')
        .getPublicUrl(fileName);

      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      await supabase.from("courses").update({ image_url: urlWithTimestamp }).eq("id", course.id);
      setCourse({ ...course, image_url: urlWithTimestamp });
      toast({ title: "Salvat!", description: "Poza reprezentativă a fost actualizată." });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Eroare necunoscută";
      console.error("Cover upload error:", err);
      toast({ title: "Eroare upload", description: msg, variant: "destructive" });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!course) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        description: course.description,
        is_published: course.is_published,
        requires_login: course.requires_login,
        sequential_unlock: course.sequential_unlock,
        unlock_trigger: course.unlock_trigger,
        image_url: course.image_url,
        is_lead_magnet: course.is_lead_magnet,
        lead_list_id: course.lead_list_id || null,
      })
      .eq("id", course.id);

    if (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva cursul.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvat!",
        description: "Modificările au fost salvate.",
      });
    }
    setIsSaving(false);
  };

  const handleGenerateCapture = async () => {
    if (!course) return;
    setGeneratingCapture(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("generate-capture-page", {
      body: { course_id: course.id, lead_list_id: course.lead_list_id || null },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.data?.success) {
      setCourse({
        ...course,
        is_lead_magnet: true,
        capture_headline: res.data.capture_headline,
        capture_subheadline: res.data.capture_subheadline,
        capture_bullets: res.data.capture_bullets,
        capture_cta: res.data.capture_cta,
        thankyou_headline: res.data.thankyou_headline,
        thankyou_message: res.data.thankyou_message,
      });
      toast({ title: "✓ Funnel generat!", description: "Pagina de captură este activă. Previzualizează linkul de mai jos." });
    } else {
      toast({ title: "Eroare la generare", description: res.data?.error || "Încearcă din nou.", variant: "destructive" });
    }
    setGeneratingCapture(false);
  };

  const addModule = async () => {
    if (!newModuleTitle.trim() || !course) return;

    const { data, error } = await supabase
      .from("modules")
      .insert({
        course_id: course.id,
        title: newModuleTitle,
        position: modules.length
      })
      .select()
      .single();

    if (!error && data) {
      setModules([...modules, { ...data, lessons: [] }]);
      setExpandedModules([...expandedModules, data.id]);
      setNewModuleTitle("");
      setShowNewModule(false);
      toast({ title: "Modul adăugat!" });
    }
  };

  const deleteModule = async (moduleId: string) => {
    const { error } = await supabase
      .from("modules")
      .delete()
      .eq("id", moduleId);

    if (!error) {
      setModules(modules.filter(m => m.id !== moduleId));
      toast({ title: "Modul șters!" });
    } else {
      console.error("Delete module error:", error);
      toast({
        title: "Eroare la ștergere modul",
        description: error.message || "Nu s-a putut șterge modulul.",
        variant: "destructive",
      });
    }
  };

  const startEditingModuleTitle = (module: Module, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingModuleTitle({ id: module.id, title: module.title });
  };

  const saveModuleTitle = async () => {
    if (!editingModuleTitle || !editingModuleTitle.title.trim()) return;

    const { error } = await supabase
      .from("modules")
      .update({ title: editingModuleTitle.title })
      .eq("id", editingModuleTitle.id);

    if (!error) {
      setModules(modules.map(m =>
        m.id === editingModuleTitle.id
          ? { ...m, title: editingModuleTitle.title }
          : m
      ));
      toast({ title: "Titlu actualizat!" });
    } else {
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza titlul.",
        variant: "destructive",
      });
    }
    setEditingModuleTitle(null);
  };

  const cancelEditingModuleTitle = () => {
    setEditingModuleTitle(null);
  };

  const saveModuleAvailableFrom = async (moduleId: string, value: string) => {
    const availableFrom = value ? new Date(value).toISOString() : null;
    const { error } = await supabase
      .from("modules")
      .update({ available_from: availableFrom })
      .eq("id", moduleId);

    if (!error) {
      setModules(modules.map(m =>
        m.id === moduleId ? { ...m, available_from: availableFrom } : m
      ));
      toast({ title: value ? "Dată programare salvată!" : "Programare eliminată." });
    }
  };

  const addLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) return;

    const foundModule = modules.find(m => m.id === moduleId);
    if (!foundModule) return;

    const { data, error } = await supabase
      .from("lessons")
      .insert({
        module_id: moduleId,
        title: newLessonTitle,
        position: foundModule.lessons.length
      })
      .select()
      .single();

    if (!error && data) {
      setModules(modules.map(m =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, data] }
          : m
      ));
      setNewLessonTitle("");
      setNewLessonModule(null);
      toast({ title: "Lecție adăugată!" });
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    console.log("🗑️ DELETE LESSON CALLED:", { moduleId, lessonId });
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (!error) {
      console.log("✅ DELETE SUCCESS");
      setModules(modules.map(m =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
      ));
      toast({ title: "Lecție ștearsă!" });
    } else {
      console.error("❌ Delete lesson error:", error);
      toast({
        title: "Eroare la ștergere lecție",
        description: error.message || "Nu s-a putut șterge lecția.",
        variant: "destructive",
      });
    }
  };

  const moveModuleUp = async (index: number) => {
    if (index === 0) return; // Already at the top

    const newModules = [...modules];
    [newModules[index], newModules[index - 1]] = [newModules[index - 1], newModules[index]];

    // Update positions in database
    const updates = newModules.map((mod, idx) =>
      supabase
        .from("modules")
        .update({ position: idx })
        .eq("id", mod.id)
    );

    await Promise.all(updates);
    setModules(newModules);
    toast({ title: "Modul mutat!" });
  };

  const moveModuleDown = async (index: number) => {
    if (index === modules.length - 1) return; // Already at the bottom

    const newModules = [...modules];
    [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];

    // Update positions in database
    const updates = newModules.map((mod, idx) =>
      supabase
        .from("modules")
        .update({ position: idx })
        .eq("id", mod.id)
    );

    await Promise.all(updates);
    setModules(newModules);
    toast({ title: "Modul mutat!" });
  };

  const moveLessonUp = async (moduleId: string, lessonIndex: number) => {
    if (lessonIndex === 0) return; // Already at the top

    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;

    const foundMod = modules[moduleIndex];
    const newLessons = [...foundMod.lessons];
    [newLessons[lessonIndex], newLessons[lessonIndex - 1]] = [newLessons[lessonIndex - 1], newLessons[lessonIndex]];

    // Update positions in database
    const updates = newLessons.map((lesson, idx) =>
      supabase
        .from("lessons")
        .update({ position: idx })
        .eq("id", lesson.id)
    );

    await Promise.all(updates);

    const newModules = [...modules];
    newModules[moduleIndex] = { ...foundMod, lessons: newLessons };
    setModules(newModules);
    toast({ title: "Lecție mutată!" });
  };

  const moveLessonDown = async (moduleId: string, lessonIndex: number) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;

    const foundMod2 = modules[moduleIndex];
    if (lessonIndex === foundMod2.lessons.length - 1) return; // Already at the bottom

    const newLessons = [...foundMod2.lessons];
    [newLessons[lessonIndex], newLessons[lessonIndex + 1]] = [newLessons[lessonIndex + 1], newLessons[lessonIndex]];

    // Update positions in database
    const updates = newLessons.map((lesson, idx) =>
      supabase
        .from("lessons")
        .update({ position: idx })
        .eq("id", lesson.id)
    );

    await Promise.all(updates);

    const newModules = [...modules];
    newModules[moduleIndex] = { ...foundMod2, lessons: newLessons };
    setModules(newModules);
    toast({ title: "Lecție mutată!" });
  };

  const copyLink = () => {
    if (!course) return;
    const url = `${window.location.origin}/course/${course.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiat!",
      description: "Link-ul cursului a fost copiat în clipboard.",
    });
  };

  // Component for membership inclusion
  const MembershipInclusionCard = ({ courseId, profileId }: { courseId: string; profileId: string }) => {
    const [membershipPlans, setMembershipPlans] = useState<Array<{ id: string; title: string; includes_courses: string[] }>>([]);
    const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newMembershipData, setNewMembershipData] = useState({
      title: "",
      priceInfo: "",
      benefits: "",
    });

    useEffect(() => {
      const fetchMemberships = async () => {
        // Fetch creator's membership plans
        const { data: plans } = await supabase
          .from("membership_plans")
          .select("id, title, includes_courses")
          .eq("creator_id", profileId);

        if (plans) {
          setMembershipPlans(plans.map(p => ({ ...p, includes_courses: (p.includes_courses as string[]) || [] })));
          // Find which plans include this course
          const plansWithCourse = plans
            .filter(plan => (plan.includes_courses as string[] | null)?.includes(courseId!))
            .map(plan => plan.id);
          setSelectedPlans(plansWithCourse);
        }
        setIsLoading(false);
      };

      fetchMemberships();
    }, [courseId, profileId]);

    const toggleMembership = async (planId: string) => {
      const plan = membershipPlans.find(p => p.id === planId);
      if (!plan) return;

      const isCurrentlySelected = selectedPlans.includes(planId);
      let updatedCourses = plan.includes_courses || [];

      if (isCurrentlySelected) {
        // Remove course from membership
        updatedCourses = updatedCourses.filter((id: string) => id !== courseId);
      } else {
        // Add course to membership
        updatedCourses = [...updatedCourses, courseId];
      }

      const { error } = await supabase
        .from("membership_plans")
        .update({ includes_courses: updatedCourses })
        .eq("id", planId);

      if (!error) {
        setSelectedPlans(isCurrentlySelected 
          ? selectedPlans.filter(id => id !== planId)
          : [...selectedPlans, planId]
        );
        toast({
          title: isCurrentlySelected ? "Curs eliminat din membership" : "Curs adăugat în membership",
          description: `Cursul a fost ${isCurrentlySelected ? "eliminat din" : "adăugat în"} ${plan.title}`,
        });
      }
    };

    const deleteMembership = async (planId: string) => {
      const plan = membershipPlans.find(p => p.id === planId);
      if (!plan) return;

      // First delete community if exists
      const { data: community } = await supabase
        .from("community_groups")
        .select("id")
        .eq("membership_plan_id", planId)
        .single();

      if (community) {
        // Delete posts and comments
        const { data: posts } = await supabase
          .from("community_posts")
          .select("id")
          .eq("membership_plan_id", planId);

        if (posts && posts.length > 0) {
          const postIds = posts.map(p => p.id);
          await supabase.from("community_comments").delete().in("post_id", postIds);
          await (supabase as any).from("post_likes").delete().in("post_id", postIds);
          await supabase.from("community_posts").delete().eq("membership_plan_id", planId);
        }

        await supabase.from("community_groups").delete().eq("id", community.id);
      }

      // Delete subscriptions
      await supabase.from("membership_subscriptions").delete().eq("membership_plan_id", planId);

      // Delete the membership plan
      const { error } = await supabase
        .from("membership_plans")
        .delete()
        .eq("id", planId);

      if (!error) {
        setMembershipPlans(membershipPlans.filter(p => p.id !== planId));
        setSelectedPlans(selectedPlans.filter(id => id !== planId));
        toast({
          title: "Membership șters",
          description: `${plan.title} a fost șters cu succes.`,
        });
      } else {
        toast({
          title: "Eroare",
          description: "Nu s-a putut șterge membership-ul.",
          variant: "destructive",
        });
      }
    };

    const createNewMembership = async () => {
      if (!newMembershipData.title.trim()) {
        toast({
          title: "Eroare",
          description: "Titlul membership-ului este obligatoriu.",
          variant: "destructive",
        });
        return;
      }

      setIsCreating(true);

      const slug = newMembershipData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data: membershipResult, error } = await supabase
        .from("membership_plans")
        .insert({
          creator_id: profileId,
          title: newMembershipData.title,
          slug: slug,
          price_info: newMembershipData.priceInfo || null,
          benefits: newMembershipData.benefits || null,
          includes_courses: [courseId],
          status: "active"
        })
        .select()
        .single();

      setIsCreating(false);

      if (error) {
        toast({
          title: "Eroare",
          description: "Nu s-a putut crea membership-ul.",
          variant: "destructive",
        });
        return;
      }

      // Refresh the list
      setMembershipPlans([...membershipPlans, { id: membershipResult.id, title: membershipResult.title, includes_courses: (membershipResult.includes_courses as string[]) || [] }]);
      setSelectedPlans([...selectedPlans, membershipResult.id]);
      setShowCreateForm(false);
      setNewMembershipData({ title: "", priceInfo: "", benefits: "" });
      
      toast({
        title: "Membership creat!",
        description: "Cursul a fost inclus automat în membership.",
      });
    };

    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="w-5 h-5 text-gold" />
              Membership
            </CardTitle>
            <CardDescription>Include acest curs în membership-uri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-4 border-gold border-t-transparent rounded-full mx-auto" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="w-5 h-5 text-gold" />
            Membership
          </CardTitle>
          <CardDescription>Include acest curs în membership-uri sau creează unul nou</CardDescription>
        </CardHeader>
        <CardContent>
          {membershipPlans.length > 0 && (
            <div className="space-y-3 mb-4">
              {membershipPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-beige/30 transition-colors"
                >
                  <Checkbox
                    id={`plan-${plan.id}`}
                    checked={selectedPlans.includes(plan.id)}
                    onCheckedChange={() => toggleMembership(plan.id)}
                  />
                  <Link href={`/dashboard/memberships/${plan.id}`}
                    className="flex-1 text-sm font-medium hover:text-gold transition-colors"
                  >
                    {plan.title}
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-gold"
                      title="Editează membership"
                      asChild
                    >
                      <Link href={`/dashboard/memberships/${plan.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          title="Șterge membership"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ești sigur că vrei să ștergi acest membership?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Această acțiune va șterge permanent membership-ul "{plan.title}" împreună cu toate comunitățile, postările, comentariile și abonamentele asociate. Această acțiune nu poate fi anulată.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMembership(plan.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Șterge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showCreateForm && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Creează membership nou
            </Button>
          )}

          {showCreateForm && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="new-membership-title">Titlu membership *</Label>
                <Input
                  id="new-membership-title"
                  placeholder="Ex: Acces Premium"
                  value={newMembershipData.title}
                  onChange={(e) => setNewMembershipData({ ...newMembershipData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-membership-price">Preț</Label>
                <Input
                  id="new-membership-price"
                  placeholder="Ex: 50 lei/lună"
                  value={newMembershipData.priceInfo}
                  onChange={(e) => setNewMembershipData({ ...newMembershipData, priceInfo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-membership-benefits">Beneficii</Label>
                <Textarea
                  id="new-membership-benefits"
                  placeholder="Acces la cursuri&#10;Comunitate privată&#10;Suport prioritar"
                  value={newMembershipData.benefits}
                  onChange={(e) => setNewMembershipData({ ...newMembershipData, benefits: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={createNewMembership}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? "Se creează..." : "Creează"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewMembershipData({ title: "", priceInfo: "", benefits: "" });
                  }}
                >
                  Anulează
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Component to show or create community for this course
  const CommunityInfoCard = ({
    courseId,
    courseTitle,
    profileId
  }: {
    courseId: string;
    courseTitle: string;
    profileId: string;
  }) => {
    const [communityPlanId, setCommunityPlanId] = useState<string | null>(null);
    const [communityId, setCommunityId] = useState<string | null>(null);
    const [communityName, setCommunityName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const generateSlug = (title: string) =>
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    useEffect(() => {
      const fetchData = async () => {
        const { data: plans } = await supabase
          .from("membership_plans")
          .select("id, title, includes_courses")
          .eq("creator_id", profileId);

        const plan = plans?.find(p => (p.includes_courses as string[] | null)?.includes(courseId!));
        if (plan) {
          setCommunityPlanId(plan.id);
          const { data: community } = await supabase
            .from("community_groups")
            .select("id, name")
            .eq("membership_plan_id", plan.id)
            .maybeSingle();
          if (community) {
            setCommunityId(community.id);
            setCommunityName(community.name || null);
          }
        }
        setIsLoading(false);
      };

      fetchData();
    }, [courseId, profileId]);

    const createCommunity = async () => {
      setIsCreating(true);
      try {
        const communityMembershipSlug = generateSlug(`${courseTitle} comunitate`);
        const { data: communityMembership, error: cmError } = await supabase
          .from("membership_plans")
          .insert({
            creator_id: profileId,
            title: `${courseTitle} - Comunitate`,
            slug: `${communityMembershipSlug}-${Date.now().toString(36).slice(-4)}`,
            price_info: null,
            includes_courses: [courseId],
            status: "inactive"
          })
          .select()
          .single();

        if (cmError) throw cmError;

        const { data: existingCommunity } = await supabase
          .from("community_groups")
          .select("id, name")
          .eq("membership_plan_id", communityMembership.id)
          .maybeSingle();

        if (existingCommunity) {
          setCommunityPlanId(communityMembership.id);
          setCommunityId(existingCommunity.id);
          setCommunityName(existingCommunity.name);
        } else {
          const communityPayload = {
            membership_plan_id: communityMembership.id,
            name: `Comunitatea ${courseTitle}`,
            description: `Comunitate pentru ${courseTitle}`,
            type: "membership"
          };

          const { data: community, error: communityError } = await supabase
            .from("community_groups")
            .insert(communityPayload)
            .select()
            .single();

          if (communityError) throw communityError;

          setCommunityPlanId(communityMembership.id);
          setCommunityId(community.id);
          setCommunityName(community.name);
        }
        toast({
          title: "Comunitate creată",
          description: "Comunitatea a fost creată cu succes.",
        });
      } catch (error) {
        toast({
          title: "Eroare",
          description: "Nu s-a putut crea comunitatea.",
          variant: "destructive",
        });
      } finally {
        setIsCreating(false);
      }
    };

    const deleteCommunity = async () => {
      if (!communityPlanId) return;
      setIsDeleting(true);
      try {
        const { data: posts } = await supabase
          .from("community_posts")
          .select("id")
          .eq("membership_plan_id", communityPlanId);

        if (posts && posts.length > 0) {
          const postIds = posts.map(post => post.id);
          const { error: commentsError } = await supabase
            .from("community_comments")
            .delete()
            .in("post_id", postIds);
          if (commentsError) throw commentsError;

          const { error: likesError } = await (supabase as any)
            .from("post_likes")
            .delete()
            .in("post_id", postIds);
          if (likesError) throw likesError;

          const { error: postsError } = await supabase
            .from("community_posts")
            .delete()
            .eq("membership_plan_id", communityPlanId);
          if (postsError) throw postsError;
        }

        if (communityId) {
          const { error: communityError } = await supabase
            .from("community_groups")
            .delete()
            .eq("id", communityId);
          if (communityError) throw communityError;
        } else {
          const { error: communityError } = await supabase
            .from("community_groups")
            .delete()
            .eq("membership_plan_id", communityPlanId);
          if (communityError) throw communityError;
        }

        const { error: subscriptionsError } = await supabase
          .from("membership_subscriptions")
          .delete()
          .eq("membership_plan_id", communityPlanId);
        if (subscriptionsError) throw subscriptionsError;

        const { error: planError } = await supabase
          .from("membership_plans")
          .delete()
          .eq("id", communityPlanId);
        if (planError) throw planError;

        setCommunityPlanId(null);
        setCommunityId(null);
        setCommunityName(null);
        toast({
          title: "Comunitate ștearsă",
          description: "Comunitatea a fost ștearsă cu succes.",
        });
      } catch (error) {
        console.error("Delete community error:", error);
        toast({
          title: "Eroare",
          description: `Nu s-a putut șterge comunitatea. ${error instanceof Error ? error.message : ""}`,
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    };

    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-gold" />
              Comunitate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-4 border-gold border-t-transparent rounded-full mx-auto" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-gold" />
            Comunitate
          </CardTitle>
          <CardDescription>Comunitate dedicată cursului tău</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {communityPlanId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-beige/20">
                <div>
                  <p className="font-medium text-sm">{communityName || `Comunitatea ${courseTitle}`}</p>
                  <p className="text-xs text-muted-foreground">Comunitate pentru curs</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" asChild>
                    <Link href={`/community/${communityPlanId}`}>
                      Intră în comunitate
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-gold"
                    title="Admin comunitate"
                    asChild
                  >
                    <Link href={`/dashboard/community/${communityPlanId}`}>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        title="Șterge comunitate"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ștergi comunitatea?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Această acțiune nu poate fi anulată. Se vor șterge postările, comentariile și accesul la comunitate.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteCommunity}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Se șterge..." : "Șterge"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center py-6 text-muted-foreground text-sm">
                <p className="mb-2">Acest curs nu are încă o comunitate.</p>
                <p className="text-xs">Poți crea una pentru discuții și suport.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={createCommunity}
                disabled={isCreating}
              >
                {isCreating ? "Se creează..." : "Creează comunitate"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Payment link + public page card (available on all plans)
  const PaymentLinkCard = ({
    course,
    onUpdate,
  }: {
    course: Course;
    onUpdate: (updated: Partial<Course>) => void;
  }) => {
    const [paymentLink, setPaymentLink] = useState(course.payment_link || "");
    const [isPublic, setIsPublic] = useState(course.is_publicly_listed || false);
    const [isSaving, setIsSaving] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);
    const publicUrl = `${window.location.origin}/c/${course.slug}`;
    const embedCode = `<a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#d4a017;color:#0a192f;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;font-family:sans-serif;">Accesează cursul</a>`;

    const save = async () => {
      setIsSaving(true);
      const { error } = await supabase
        .from("courses")
        .update({
          payment_link: paymentLink.trim() || null,
          is_publicly_listed: isPublic,
        })
        .eq("id", course.id);
      if (!error) {
        onUpdate({ payment_link: paymentLink.trim() || null, is_publicly_listed: isPublic });
        toast({ title: "Salvat!", description: "Setările de plată au fost salvate." });
      } else {
        toast({ title: "Eroare", description: error.message, variant: "destructive" });
      }
      setIsSaving(false);
    };

    return (
      <div className="bg-background rounded-2xl border border-border p-5 space-y-4 min-w-0">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-gold" />
          <h3 className="font-semibold text-navy text-sm">Plată & pagină publică</h3>
        </div>

        {/* Toggle public */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy">Pagină publică activă</p>
            <p className="text-xs text-muted-foreground">Permite accesul la pagina de prezentare</p>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className="relative shrink-0 w-11 h-6 rounded-full transition-colors"
            style={{ backgroundColor: isPublic ? "#C9A84C" : "#e2e8f0" }}
          >
            <span
              className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: isPublic ? "translateX(20px)" : "translateX(0px)" }}
            />
          </button>
        </div>

        {/* Payment link */}
        <div className="space-y-1.5 min-w-0">
          <Label className="text-xs">Link de plată (Stripe, PayPal, etc.)</Label>
          <Input
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            placeholder="https://buy.stripe.com/..."
            className="text-xs w-full min-w-0"
          />
          <p className="text-xs text-muted-foreground">Apare ca buton pe pagina publică a cursului</p>
        </div>

        <Button size="sm" onClick={save} disabled={isSaving} className="w-full">
          {isSaving ? "Se salvează..." : "Salvează"}
        </Button>

        {/* Public URL + embed */}
        {isPublic && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-navy">Pagina publică:</p>
            <div className="flex gap-1.5 min-w-0">
              <code className="flex-1 min-w-0 text-xs bg-beige/50 px-2 py-1.5 rounded break-all">{publicUrl}</code>
              <Button size="sm" variant="ghost" className="shrink-0 px-2" onClick={() => { navigator.clipboard.writeText(publicUrl); toast({ title: "Copiat!" }); }}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button size="sm" variant="ghost" className="px-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
            <button
              onClick={() => setShowEmbed(!showEmbed)}
              className="text-xs text-gold hover:underline"
            >
              {showEmbed ? "Ascunde" : "Cod embed pentru site-ul tău"}
            </button>
            {showEmbed && (
              <div className="space-y-1.5">
                <code className="block text-xs bg-beige/50 px-2 py-2 rounded break-all whitespace-pre-wrap">{embedCode}</code>
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { navigator.clipboard.writeText(embedCode); toast({ title: "Cod embed copiat!" }); }}>
                  <Copy className="w-3 h-3 mr-1.5" /> Copiază codul embed
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Component for student link customization (URL curat + editare slug)
  const StudentLinkCard = ({ course, onSlugUpdate }: { course: Course; onSlugUpdate: (newSlug: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [customSlug, setCustomSlug] = useState(course.slug);
    const [isSaving, setIsSaving] = useState(false);

    const cleanUrl = `${window.location.origin}/course/${course.slug}`;

    const copyLink = () => {
      navigator.clipboard.writeText(cleanUrl);
      toast({
        title: "Link copiat!",
        description: "Link-ul cursului a fost copiat în clipboard.",
      });
    };

    const generateSlug = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const saveCustomSlug = async () => {
      const validSlug = generateSlug(customSlug);

      if (validSlug.length < 3) {
        toast({
          title: "Eroare",
          description: "URL-ul trebuie să aibă minim 3 caractere.",
          variant: "destructive",
        });
        return;
      }

      if (validSlug === course.slug) {
        setIsEditing(false);
        return;
      }

      // Verificăm unicitatea slug-ului
      const { count } = await supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("slug", validSlug)
        .neq("id", course.id);

      if (count && count > 0) {
        toast({
          title: "Eroare",
          description: "Acest URL este deja folosit de un alt curs. Alege altul.",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);

      // Salvăm redirect de la slug vechi
      await supabase
        .from("course_slug_redirects" as never)
        .insert({ old_slug: course.slug, course_id: course.id } as never);

      // Actualizăm slug-ul în baza de date
      const { error } = await supabase
        .from("courses")
        .update({ slug: validSlug })
        .eq("id", course.id);

      if (!error) {
        onSlugUpdate(validSlug);
        setCustomSlug(validSlug);
        setIsEditing(false);
        toast({
          title: "URL actualizat!",
          description: "URL-ul cursului a fost personalizat.",
        });
      } else {
        toast({
          title: "Eroare",
          description: "Nu s-a putut actualiza URL-ul. Încearcă altul.",
          variant: "destructive",
        });
      }
      setIsSaving(false);
    };

    return (
      <div className="bg-gold/10 rounded-2xl border border-gold/30 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-navy">Link pentru studenți</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyLink} className="h-8">
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setIsEditing(!isEditing); setCustomSlug(course.slug); }}
              className="h-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Distribuie acest link pentru acces la curs.
        </p>

        {isEditing ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {window.location.origin}/course/
            </p>
            <Input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="url-personalizat"
              className="text-sm"
              autoFocus
            />
            {customSlug && (
              <p className="text-xs text-gold break-all">
                Preview: {window.location.origin}/course/{generateSlug(customSlug)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Litere, cifre și cratimă. Ex: psihologie-comportamentala, curs-vip
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveCustomSlug} disabled={isSaving} className="flex-1">
                {isSaving ? "Se salvează..." : "Salvează"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setIsEditing(false); setCustomSlug(course.slug); }}
              >
                Anulează
              </Button>
            </div>
          </div>
        ) : (
          <code className="block p-3 bg-background rounded-lg text-xs break-all">
            {cleanUrl}
          </code>
        )}
      </div>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !course) return null;

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
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses"
                className="p-2 rounded-lg hover:bg-beige transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal" />
              </Link>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Copiază link</span>
              </Button>
              <a
                href={`/course/${course.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Vizualizează</span>
                </Button>
              </a>
              <Button
                variant="gold"
                size="sm"
                onClick={handleSaveCourse}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Se salvează..." : "Salvează"}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Course settings */}
            <div className="lg:col-span-1 space-y-6 min-w-0 overflow-hidden">
              {/* Buton Cursanți */}
              <Link href={`/dashboard/courses/${id}/students`}
                className="flex items-center justify-between w-full bg-background rounded-2xl border border-border p-4 hover:border-gold/40 hover:bg-beige/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gold" />
                  <div>
                    <p className="font-semibold text-navy text-sm">Cursanți</p>
                    <p className="text-xs text-muted-foreground">Progres, statistici și export Excel</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </Link>

              {/* Payment Link & Public Page (all plans) */}
              <PaymentLinkCard
                course={course}
                onUpdate={(updated) => setCourse({ ...course, ...updated })}
              />

              {/* Sales Page (Pro) */}
              <Link href={`/dashboard/courses/${id}/sales-page`}
                className={`flex items-center justify-between w-full rounded-2xl border p-4 transition-all group ${
                  isPro
                    ? "bg-gold/5 border-gold/40 hover:border-gold hover:bg-gold/10"
                    : "bg-background border-border hover:border-gold/40 hover:bg-beige/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <div>
                    <p className="font-semibold text-navy text-sm flex items-center gap-2">
                      Sales Page AI
                      {!isPro && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-gold text-navy px-1.5 py-0.5 rounded-full">
                          <Zap className="w-2.5 h-2.5" /> Pro
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Pagină de vânzări generată cu Gemini AI</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </Link>

              {/* Lead Magnet Funnel (Pro) */}
              {isPro && (
                <Link href={`/dashboard/courses/${id}/funnel`}
                  className="flex items-center justify-between w-full bg-gold/5 rounded-2xl border border-gold/40 p-4 hover:border-gold hover:bg-gold/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Magnet className="w-5 h-5 text-gold" />
                    <div>
                      <p className="font-semibold text-navy text-sm flex items-center gap-2">
                        Funnel Lead Magnet
                        {course?.is_lead_magnet && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Activ</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Pagină de captură + mulțumire generate cu AI</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </Link>
              )}

              <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-gold" />
                  <h2 className="text-lg font-semibold text-navy">Setări curs</h2>
                </div>

                <div className="space-y-4">
                  {/* Cover image */}
                  <div className="space-y-2">
                    <Label>Poză reprezentativă</Label>
                    <div
                      className="relative w-full aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden bg-beige/30 flex items-center justify-center group cursor-pointer hover:border-gold/50 transition-colors"
                      onClick={() => document.getElementById('cover-upload')?.click()}
                    >
                      {course.image_url ? (
                        <img src={course.image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Image className="w-8 h-8" />
                          <span className="text-xs text-center px-4">Click pentru a adăuga<br/>o poză reprezentativă</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {isUploadingCover ? "Se încarcă..." : "Schimbă poza"}
                        </span>
                      </div>
                    </div>
                    <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    <p className="text-xs text-muted-foreground">PNG, JPG, WebP. Max 5MB. Recomandat: 16:9.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Titlu</Label>
                    <Input
                      id="title"
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      value={course.description || ""}
                      onChange={(e) => setCourse({ ...course, description: e.target.value })}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-border">
                    <div>
                      <Label>Publicat</Label>
                      <p className="text-xs text-muted-foreground">
                        Cursul va fi accesibil prin link
                      </p>
                    </div>
                    <Switch
                      checked={course.is_published}
                      onCheckedChange={(checked) => setCourse({ ...course, is_published: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-border">
                    <div>
                      <Label>Necesită cont</Label>
                      <p className="text-xs text-muted-foreground">
                        Cursanții trebuie să fie autentificați
                      </p>
                    </div>
                    <Switch
                      checked={course.requires_login}
                      onCheckedChange={(checked) => setCourse({ ...course, requires_login: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-border">
                    <div>
                      <Label>Parcurgere secvențială</Label>
                      <p className="text-xs text-muted-foreground">
                        Lecțiile se deblochează pe rând
                      </p>
                    </div>
                    <Switch
                      checked={course.sequential_unlock ?? false}
                      onCheckedChange={(checked) => setCourse({ ...course, sequential_unlock: checked })}
                    />
                  </div>

                  {course.sequential_unlock && (
                    <div className="py-3 px-3 bg-beige/50 rounded-xl space-y-2 border-t border-border">
                      <Label className="text-xs">Deblochează modulul următor după:</Label>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="unlock_trigger"
                            value="first_lesson"
                            checked={(course.unlock_trigger ?? 'first_lesson') === 'first_lesson'}
                            onChange={() => setCourse({ ...course, unlock_trigger: 'first_lesson' })}
                            className="accent-gold"
                          />
                          Prima lecție finalizată
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="unlock_trigger"
                            value="all_lessons"
                            checked={course.unlock_trigger === 'all_lessons'}
                            onChange={() => setCourse({ ...course, unlock_trigger: 'all_lessons' })}
                            className="accent-gold"
                          />
                          Toate lecțiile finalizate
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CommunityInfoCard courseId={course.id} courseTitle={course.title} profileId={profile?.id || ""} />

              <StudentLinkCard
                course={course}
                onSlugUpdate={(newSlug) => setCourse({ ...course, slug: newSlug })}
              />
            </div>

            {/* Modules and lessons */}
            <div className="lg:col-span-2">
              <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-navy">Module și lecții</h2>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setShowNewModule(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adaugă modul
                  </Button>
                </div>

                {showNewModule && (
                  <div className="mb-6 p-4 bg-beige/50 rounded-xl">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Titlul modulului"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button variant="gold" size="sm" onClick={addModule}>
                        Adaugă
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewModule(false);
                          setNewModuleTitle("");
                        }}
                      >
                        Anulează
                      </Button>
                    </div>
                  </div>
                )}

                {modules.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Niciun modul încă. Adaugă primul modul pentru a începe.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((mod) => (
                      <div key={mod.id} className="border border-border rounded-xl overflow-hidden">
                        <div
                          className="flex items-center gap-3 p-4 bg-beige/30 cursor-pointer"
                          onClick={() => toggleModule(mod.id)}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          {expandedModules.includes(mod.id) ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          {editingModuleTitle?.id === mod.id ? (
                            <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editingModuleTitle.title}
                                onChange={(e) => setEditingModuleTitle({ ...editingModuleTitle, title: e.target.value })}
                                className="h-8 flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveModuleTitle();
                                  if (e.key === "Escape") cancelEditingModuleTitle();
                                }}
                              />
                              <Button variant="gold" size="sm" onClick={saveModuleTitle}>
                                Salvează
                              </Button>
                              <Button variant="ghost" size="sm" onClick={cancelEditingModuleTitle}>
                                Anulează
                              </Button>
                            </div>
                          ) : (
                            <span 
                              className="flex-1 font-medium text-navy hover:text-gold cursor-text"
                              onClick={(e) => startEditingModuleTitle(mod, e)}
                              title="Click pentru a edita"
                            >
                              {mod.title}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {mod.lessons.length} lecții
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveModuleUp(modules.findIndex(m => m.id === mod.id));
                            }}
                            className="hover:text-sky"
                            title="Mută sus"
                            disabled={modules.findIndex(m => m.id === mod.id) === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveModuleDown(modules.findIndex(m => m.id === mod.id));
                            }}
                            className="hover:text-sky"
                            title="Mută jos"
                            disabled={modules.findIndex(m => m.id === mod.id) === modules.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => startEditingModuleTitle(mod, e)}
                            className="hover:text-gold"
                            title="Editează modul"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:text-destructive"
                                title="Șterge modul"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ștergi modulul "{mod.title}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Această acțiune nu poate fi anulată. Toate lecțiile din acest modul vor fi șterse permanent.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anulează</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteModule(mod.id);
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Șterge modulul
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {expandedModules.includes(mod.id) && (
                          <div className="p-4 space-y-2">
                            {/* Programare acces modul */}
                            <div className="flex items-center gap-3 pb-3 mb-1 border-b border-border/50">
                              <label className="text-xs text-muted-foreground whitespace-nowrap">
                                Disponibil din:
                              </label>
                              <input
                                type="datetime-local"
                                className="flex-1 h-8 text-xs rounded-md border border-border bg-background px-2 text-navy"
                                value={mod.available_from ? toLocalDatetimeInput(mod.available_from) : ""}
                                onChange={(e) => saveModuleAvailableFrom(mod.id, e.target.value)}
                              />
                              {mod.available_from && (
                                <button
                                  type="button"
                                  className="text-xs text-muted-foreground hover:text-destructive"
                                  onClick={() => saveModuleAvailableFrom(mod.id, "")}
                                >
                                  Elimină
                                </button>
                              )}
                            </div>

                            {mod.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-gold hover:bg-gold/5 transition-colors"
                              >
                                {lesson.video_url ? (
                                  <Play className="w-4 h-4 text-gold" />
                                ) : (
                                  <FileText className="w-4 h-4 text-sky" />
                                )}
                                <Link href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                                  className="flex-1 text-charcoal hover:text-gold transition-colors"
                                >
                                  {lesson.title}
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    moveLessonUp(mod.id, lessonIndex);
                                  }}
                                  className="hover:text-sky"
                                  title="Mută sus"
                                  disabled={lessonIndex === 0}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    moveLessonDown(mod.id, lessonIndex);
                                  }}
                                  className="hover:text-sky"
                                  title="Mută jos"
                                  disabled={lessonIndex === mod.lessons.length - 1}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                                <Link href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                                  className="p-2 rounded-md hover:bg-gold/10 hover:text-gold transition-colors"
                                  title="Editează lecție"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:text-destructive"
                                      title="Șterge lecție"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ștergi lecția "{lesson.title}"?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Această acțiune nu poate fi anulată. Lecția și conținutul său vor fi șterse permanent.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Anulează</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          deleteLesson(mod.id, lesson.id);
                                        }}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Șterge lecția
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ))}

                            {newLessonModule === mod.id ? (
                              <div className="flex gap-3 p-2">
                                <Input
                                  placeholder="Titlul lecției"
                                  value={newLessonTitle}
                                  onChange={(e) => setNewLessonTitle(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button variant="gold" size="sm" onClick={() => addLesson(mod.id)}>
                                  Adaugă
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setNewLessonModule(null);
                                    setNewLessonTitle("");
                                  }}
                                >
                                  Anulează
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setNewLessonModule(mod.id)}
                                className="w-full justify-start text-muted-foreground"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Adaugă lecție
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default EditCourse;
