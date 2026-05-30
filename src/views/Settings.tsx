"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Upload, Briefcase, Loader2, CreditCard, XCircle, Pencil, CheckCircle2, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";
import PlanSelectionDialog from "@/components/home/PlanSelectionDialog";

const Settings = () => {
  const router = useRouter();
  const { user, profile, refreshProfile, signOut, isLoading: authLoading } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [activity, setActivity] = useState(profile?.activity || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setActivity(profile.activity || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imaginea trebuie să fie mai mică de 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Doar imagini PNG sau JPG sunt permise");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add timestamp to bust cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithTimestamp })
        .eq("id", profile?.id ?? "");

      if (updateError) throw updateError;

      setAvatarUrl(urlWithTimestamp);
      await refreshProfile();
      toast.success("Imaginea de profil a fost actualizată!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Eroare la încărcarea imaginii");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          activity: activity || null
        })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profil actualizat cu succes!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Eroare la actualizarea profilului");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.email) return;

    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { email: user.email }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast.error("Nu s-a putut deschide portalul Stripe. Mergi la Prețuri pentru a-ți gestiona abonamentul.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.email) return;

    setIsCancellingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { email: user.email }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Abonamentul a fost anulat cu succes! Vei fi deconectat.");
        // Sign out and redirect to home
        await signOut();
        router.push("/");
        return;
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error(`Eroare la anularea abonamentului: ${errorMessage}. Te rugăm să ne contactezi la contact@docourse.ro`);
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Introdu o adresă de email validă.");
      return;
    }
    if (newEmail === user?.email) {
      toast.error("Acesta este deja emailul tău curent.");
      return;
    }

    setIsSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      setEmailChangeSent(true);
      setIsChangingEmail(false);
      setNewEmail("");
      toast.success("Email de confirmare trimis! Verifică noul email și apasă linkul de confirmare.");
    } catch (error) {
      console.error("Error changing email:", error);
      const msg = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error(`Eroare: ${msg}`);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await signOut();
      router.push("/");
      toast.success("Contul tău a fost șters. La revedere!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Eroare necunoscută";
      toast.error(`Eroare: ${msg}`);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const hasChanges = fullName !== (profile?.full_name || "") || activity !== (profile?.activity || "");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      


      

      <div className="min-h-screen flex flex-col bg-beige/20">
        <main className="flex-1 container mx-auto px-4 pt-8 pb-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Dashboard
              </Button>
            </Link>

            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Setări Profil
              </h1>
              <p className="text-muted-foreground mb-8">
                Actualizează informațiile tale personale
              </p>

              <div className="space-y-6">
                {/* Avatar section */}
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="relative">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gold/20 border-2 border-gold/30 flex items-center justify-center text-gold font-semibold text-2xl">
                        {profile?.full_name?.charAt(0) || "C"}
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="w-6 h-6 animate-spin text-gold" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Imagine profil
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      PNG, JPG până la 2MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploadingAvatar ? "Se încarcă..." : "Încarcă imagine"}
                    </Button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gold" />
                    Nume complet
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Introduceți numele complet"
                    className="bg-background"
                  />
                </div>

                {/* Activity/Title */}
                <div className="space-y-2">
                  <Label htmlFor="activity" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gold" />
                    Titlu / Activitate
                  </Label>
                  <Input
                    id="activity"
                    type="text"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="Ex: Trainer, Coach, Mentor, Consultant"
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Titulatura ta va apărea în profilul public și în comunități
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold" />
                    Email de autentificare
                  </Label>

                  {emailChangeSent ? (
                    <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800">
                        Email de confirmare trimis. Verifică inbox-ul noului email și apasă linkul pentru a confirma schimbarea.
                      </p>
                    </div>
                  ) : isChangingEmail ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        <span>Email curent:</span>
                        <span className="font-medium text-foreground">{user?.email}</span>
                      </div>
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Noul tău email"
                        className="bg-background"
                        disabled={isSavingEmail}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleChangeEmail}
                          disabled={isSavingEmail || !newEmail}
                        >
                          {isSavingEmail ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se trimite...</>
                          ) : (
                            <><CheckCircle2 className="w-4 h-4 mr-2" />Confirmă schimbarea</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setIsChangingEmail(false); setNewEmail(""); }}
                          disabled={isSavingEmail}
                        >
                          Anulează
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vei primi un email de confirmare la noua adresă.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsChangingEmail(true)}
                        className="flex-shrink-0"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Schimbă
                      </Button>
                    </div>
                  )}
                </div>

                {/* Subscription Management */}
                {!profile?.beta_tester && !profile?.lifetime_access && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <Label className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gold" />
                      Abonament
                    </Label>
                    <div className="bg-beige/30 border border-border/60 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">
                              {profile?.subscription_active
                                ? profile?.plan_type === "pro" ? "Plan Pro" : "Plan Starter"
                                : "Fără Abonament"}
                            </p>
                            {profile?.subscription_active && profile?.plan_type === "pro" && (
                              <span className="inline-flex items-center gap-1 bg-gold text-background text-xs font-bold px-2 py-0.5 rounded-full">
                                <Zap className="w-3 h-3" /> Pro
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profile?.subscription_active
                              ? profile?.plan_type === "pro"
                                ? "Ai acces la toate funcționalitățile, inclusiv sales page cu AI."
                                : "Gestionează-ți abonamentul sau fă upgrade la Pro."
                              : "Nu ai un abonament activ."}
                          </p>
                          {profile?.subscription_active && profile?.plan_type !== "pro" && (
                            <Button size="sm" variant="outline" className="mt-2 border-gold/50 text-gold hover:bg-gold/10 text-xs" onClick={() => setShowPlanDialog(true)}>
                              <Zap className="w-3 h-3 mr-1" /> Upgrade la Pro — 29€/lună
                            </Button>
                          )}
                        </div>
                      </div>
                      {!profile?.subscription_active && !profile?.lifetime_access && (
                        <div className="flex flex-col sm:flex-row gap-3 mt-3">
                          <Button size="sm" className="bg-gold hover:bg-gold/90 text-navy font-semibold" onClick={() => setShowPlanDialog(true)}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Cumpără abonament
                          </Button>
                        </div>
                      )}
                      {profile?.subscription_active && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManageSubscription}
                            disabled={isLoadingPortal}
                          >
                            {isLoadingPortal ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Se încarcă...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Gestionează abonamentul
                              </>
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                disabled={isCancellingSubscription}
                              >
                                {isCancellingSubscription ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Se anulează...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Anulează abonamentul
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Anulezi abonamentul?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ești sigur că vrei să anulezi abonamentul? Vei pierde accesul la toate funcționalitățile premium imediat după anulare.
                                  <br /><br />
                                  <strong>Nu vei mai fi taxat după anulare.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Păstrează abonamentul</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleCancelSubscription}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Da, anulează acum
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Beta Tester Notice */}
                {(profile?.beta_tester || profile?.lifetime_access) && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gold" />
                        Acces Gratuit Permanent
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ai acces complet la platformă fără abonament.
                      </p>
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isLoading || !fullName || !hasChanges}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Se salvează..." : "Salvează modificările"}
                  </Button>
                </div>

                {/* Danger zone */}
                <div className="pt-6 border-t border-destructive/20">
                  <h3 className="text-sm font-semibold text-destructive mb-1 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Zona de pericol
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ștergerea contului este ireversibilă. Toate datele tale — cursuri, comunități, abonament — vor fi șterse permanent.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm"
                        className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={isDeletingAccount}>
                        {isDeletingAccount
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se șterge...</>
                          : <><Trash2 className="w-4 h-4 mr-2" />Șterge contul meu</>}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Această acțiune <strong>nu poate fi anulată</strong>. Contul tău și toate datele asociate — profilul, cursurile, comunitățile, istoricul de plăți — vor fi șterse permanent.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Da, șterge contul definitiv
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <PlanSelectionDialog open={showPlanDialog} onOpenChange={setShowPlanDialog} />
    </>
  );
};

export default Settings;