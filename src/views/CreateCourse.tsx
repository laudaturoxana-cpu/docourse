"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Image as ImageIcon,
  Save,
  Crown,
  Users
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";

const CreateCourse = () => {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Membership creation state
  const [createMembership, setCreateMembership] = useState(false);
  const [membershipData, setMembershipData] = useState({
    title: "",
    priceInfo: "",
    benefits: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Eroare",
        description: "Titlul cursului este obligatoriu.",
        variant: "destructive",
      });
      return;
    }

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

    let imageUrl = null;

    // Upload image if exists
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("lesson-files")
        .upload(fileName, imageFile);

      if (uploadError) {
        toast({
          title: "Eroare",
          description: "Nu s-a putut încărca imaginea.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("lesson-files")
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    const slug = generateSlug(formData.title);

    const { data, error } = await supabase
      .from("courses")
      .insert({
        creator_id: profileId,
        title: formData.title,
        description: formData.description || null,
        slug: slug,
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea cursul.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Create membership if checkbox is checked
    if (createMembership && membershipData.title.trim()) {
      const membershipSlug = generateSlug(membershipData.title);
      
      const { data: membershipResult, error: membershipError } = await supabase
        .from("membership_plans")
        .insert({
          creator_id: profile!.id,
          title: membershipData.title,
          slug: membershipSlug,
          price_info: membershipData.priceInfo || null,
          benefits: membershipData.benefits || null,
          includes_courses: [data.id], // Include this course
          status: "active"
        })
        .select()
        .single();

      if (membershipError) {
        toast({
          title: "Atenție",
          description: "Cursul a fost creat, dar membership-ul a eșuat.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succes!",
          description: "Curs și membership create cu succes!",
        });
      }
    } else {
      toast({
        title: "Curs creat!",
        description: "Acum poți adăuga module și lecții.",
      });
    }
    
    router.push(`/dashboard/courses/${data.id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

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
            <Button
              variant="gold"
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Se salvează..." : "Salvează"}
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
              Creează un curs nou
            </h1>
            <p className="text-muted-foreground">
              Completează detaliile cursului, apoi adaugă module și lecții.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-background rounded-2xl border border-border p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-navy mb-6">Informații de bază</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titlul cursului *</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Ex: Introducere în psihologia comportamentală"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descriere</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descrie pe scurt ce vor învăța cursanții..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagine de copertă</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-gold/50 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="mt-4 text-sm text-muted-foreground hover:text-destructive"
                        >
                          Elimină imaginea
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="w-16 h-16 rounded-xl bg-beige flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-charcoal font-medium mb-1">
                          Click pentru a încărca
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG până la 5MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-2xl border border-border p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-navy">Creează membership (opțional)</h2>
                  <p className="text-sm text-muted-foreground">
                    Transformă cursul într-un membership cu acces recurring
                  </p>
                </div>
                <Switch
                  checked={createMembership}
                  onCheckedChange={setCreateMembership}
                />
              </div>

              {createMembership && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor="membership-title">Titlu membership *</Label>
                    <Input
                      id="membership-title"
                      placeholder="Ex: Acces Premium la Psihologie"
                      value={membershipData.title}
                      onChange={(e) => setMembershipData({ ...membershipData, title: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="membership-price">Preț</Label>
                    <Input
                      id="membership-price"
                      placeholder="Ex: 50 lei/lună sau 500 lei/an"
                      value={membershipData.priceInfo}
                      onChange={(e) => setMembershipData({ ...membershipData, priceInfo: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="membership-benefits">Beneficii</Label>
                    <Textarea
                      id="membership-benefits"
                      placeholder="Acces la cursuri exclusive&#10;Comunitate privată&#10;Suport prioritar"
                      value={membershipData.benefits}
                      onChange={(e) => setMembershipData({ ...membershipData, benefits: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Un beneficiu pe linie. Cursul curent va fi inclus automat.
                    </p>
                  </div>

                  <div className="bg-beige/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-gold mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-navy mb-1">Comunitate inclusă automat</p>
                        <p className="text-muted-foreground">
                          Membership-ul va include acces la o comunitate privată pentru membrii tăi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!createMembership && (
                <div className="bg-beige/30 rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Activează pentru a crea un membership care include acest curs, cu comunitate și acces recurring.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-background rounded-2xl border border-border p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-navy">Module</h2>
                  <p className="text-sm text-muted-foreground">
                    Organizează lecțiile în module tematice
                  </p>
                </div>
              </div>

              <div className="bg-beige/50 rounded-xl p-8 text-center">
                <p className="text-muted-foreground">
                  Salvează cursul pentru a adăuga module și lecții.
                </p>
              </div>
            </div>

            <div className="lg:hidden">
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Se salvează..." : "Salvează cursul"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default CreateCourse;
