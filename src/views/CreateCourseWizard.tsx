"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import WizardStepper from "@/components/wizard/WizardStepper";
import CourseStep from "@/components/wizard/CourseStep";
import CommunityStep from "@/components/wizard/CommunityStep";
import SuccessSummary from "@/components/wizard/SuccessSummary";

const WIZARD_STEPS = [
  { id: 1, title: "Curs", description: "Detalii și conținut" },
  { id: 2, title: "Comunitate", description: "Opțională" },
  { id: 3, title: "Finalizat", description: "Rezumat" }
];

const CreateCourseWizard = () => {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Check if user has active subscription
  const hasActiveSubscription = profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Course data
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    is_published: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Community data
  const [communityData, setCommunityData] = useState<{
    communityOption: "link" | "skip";
    selectedMembershipPlanId: string | null;
    selectedCommunityId: string | null;
    selectedCommunityName: string;
  }>({
    communityOption: "skip",
    selectedMembershipPlanId: null,
    selectedCommunityId: null,
    selectedCommunityName: "",
  });

  // Created / linked IDs
  const [createdCourseId, setCreatedCourseId] = useState<string>("");
  const [linkedCommunityPlanId, setLinkedCommunityPlanId] = useState<string>("");
  const [linkedCommunityId, setLinkedCommunityId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleCourseChange = (field: keyof typeof courseData, value: string | boolean) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCommunityOptionChange = (option: "link" | "skip") => {
    setCommunityData(prev => ({ ...prev, communityOption: option }));
  };

  const handleSelectCommunity = (membershipPlanId: string, communityId: string, communityName: string) => {
    setCommunityData(prev => ({
      ...prev,
      selectedMembershipPlanId: membershipPlanId,
      selectedCommunityId: communityId,
      selectedCommunityName: communityName,
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Generează un slug unic verificând în baza de date
  const generateUniqueSlug = async (title: string): Promise<string> => {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const { count } = await supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("slug", slug);

      if (count === 0 || count === null) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  const hasCommunity = communityData.communityOption === "link" && !!communityData.selectedMembershipPlanId;

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!courseData.title.trim()) {
        toast({
          title: "Eroare",
          description: "Titlul cursului este obligatoriu.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const ensureProfileId = async () => {
    if (profile?.id) return profile.id;
    if (!user) return null;

    const fallbackName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Creator";

    const { data: createdProfile, error: createError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        user_id: user.id,
        full_name: fallbackName,
        activity: (user.user_metadata?.activity as string | undefined) || null
      }, { onConflict: "id" })
      .select("id")
      .maybeSingle();

    if (createError) {
      console.error("Profile upsert error:", createError);
    }

    if (createdProfile?.id) return createdProfile.id;

    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Profile fetch error:", fetchError);
    }

    return existingProfile?.id || null;
  };

  const handleSubmit = async () => {
    const profileId = await ensureProfileId();
    if (!profileId) {
      toast({
        title: "Eroare",
        description: "Profilul nu a fost găsit. Te rog reîncearcă după 5 secunde.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload image if exists
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${profileId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("lesson-files")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("lesson-files")
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // 2. Create course
      const slug = await generateUniqueSlug(courseData.title);
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          creator_id: profileId,
          title: courseData.title,
          description: courseData.description || null,
          slug: slug,
          image_url: imageUrl,
          is_published: courseData.is_published
        })
        .select()
        .single();

      if (courseError) throw courseError;
      setCreatedCourseId(course.id);

      // 3. Link course to existing community if selected
      if (hasCommunity && communityData.selectedMembershipPlanId) {
        const { data: plan } = await supabase
          .from("membership_plans")
          .select("includes_courses")
          .eq("id", communityData.selectedMembershipPlanId)
          .single();

        const existingCourses = (plan?.includes_courses as string[]) || [];
        if (!existingCourses.includes(course.id)) {
          await supabase
            .from("membership_plans")
            .update({ includes_courses: [...existingCourses, course.id] })
            .eq("id", communityData.selectedMembershipPlanId);
        }

        setLinkedCommunityPlanId(communityData.selectedMembershipPlanId);
        setLinkedCommunityId(communityData.selectedCommunityId || "");
      }

      setIsComplete(true);
      setCurrentStep(3);

      toast({
        title: "Succes!",
        description: "Toate componentele au fost create cu succes!",
      });
    } catch (error) {
      console.error("Error creating:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la creare. Te rugăm să încerci din nou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  // Block access if no active subscription
  if (!authLoading && profile && !hasActiveSubscription) {
    return <SubscriptionRequired />;
  }

  return (
    <>
      


      

      <div className="min-h-screen bg-beige/30">
        <header className="bg-background border-b border-border px-4 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard"
                className="p-2 rounded-lg hover:bg-beige transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal" />
              </Link>
              <Logo size="sm" />
            </div>
            {!isComplete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                Salvează draft
              </Button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {!isComplete && (
            <WizardStepper steps={WIZARD_STEPS} currentStep={currentStep} />
          )}

          <div className="bg-background rounded-2xl border border-border p-6 lg:p-8">
            {currentStep === 1 && (
              <>
                <h2 className="text-xl font-bold text-navy mb-2">
                  Pasul 1: Creează cursul
                </h2>
                <p className="text-muted-foreground mb-6">
                  Completează detaliile cursului. Poți adăuga lecții ulterior.
                </p>
                <CourseStep
                  data={courseData}
                  imageFile={imageFile}
                  imagePreview={imagePreview}
                  onChange={handleCourseChange}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-xl font-bold text-navy mb-2">
                  Pasul 2: Comunitate (opțională)
                </h2>
                <p className="text-muted-foreground mb-6">
                  Comunitatea crește engagement-ul și retenția studenților. Alege tipul de acces.
                </p>
                <CommunityStep
                  communityOption={communityData.communityOption}
                  selectedMembershipPlanId={communityData.selectedMembershipPlanId}
                  selectedCommunityId={communityData.selectedCommunityId}
                  onOptionChange={handleCommunityOptionChange}
                  onSelectCommunity={handleSelectCommunity}
                />
              </>
            )}

            {currentStep === 3 && isComplete && (
              <SuccessSummary
                courseId={createdCourseId}
                courseTitle={courseData.title}
                communityPlanId={linkedCommunityPlanId || undefined}
                communityId={linkedCommunityId || undefined}
                communityName={communityData.selectedCommunityName || undefined}
                onClose={() => router.push("/dashboard")}
              />
            )}
          </div>

          {!isComplete && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi
              </Button>

              <Button
                variant="hero"
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Se procesează..."
                ) : currentStep === 2 ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Finalizează
                  </>
                ) : (
                  <>
                    Continuă
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CreateCourseWizard;
