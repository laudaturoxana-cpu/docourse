"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Users } from "lucide-react";
import { z } from "zod";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/browser";
import { useLoginRateLimit } from "@/hooks/useLoginRateLimit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email invalid" }),
  password: z.string().min(8, { message: "Parola trebuie să aibă cel puțin 8 caractere" })
});

const StudentLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams?.get("redirect") || "/student";
  const redirectTo = rawRedirect.startsWith("/") ? rawRedirect : "/student";
  const { user, signIn, sessionError, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { isBlocked, recordFailure, recordSuccess } = useLoginRateLimit("student");

  useEffect(() => {
    if (user && !authLoading) {
      router.replace(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  useEffect(() => {
    if (sessionError) {
      toast({ title: "Acces blocat", description: sessionError, variant: "destructive" });
      setIsLoading(false);
    }
  }, [sessionError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { blocked, secondsLeft } = isBlocked();
    if (blocked) {
      toast({
        title: "Prea multe încercări",
        description: `Încearcă din nou în ${secondsLeft} secunde.`,
        variant: "destructive",
      });
      return;
    }

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Eroare de validare",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      const { blocked: nowBlocked, secondsLeft: secs } = recordFailure();
      let message = "A apărut o eroare la autentificare.";
      if (error.message.includes("Invalid login credentials")) {
        message = nowBlocked
          ? `Email sau parolă incorectă. Prea multe încercări — încearcă din nou în ${secs} secunde.`
          : "Email sau parolă incorectă.";
      }
      toast({
        title: "Eroare",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    recordSuccess();

    toast({
      title: "Bine ai venit!",
      description: "Te-ai autentificat cu succes.",
    });

    // Dacă vine de la un link de curs, înscrie automat și trimite la dashboard
    const courseMatch = redirectTo.match(/^\/course\/([^/?#]+)/);
    if (courseMatch) {
      const slug = courseMatch[1];
      try {
        const { data: courseData } = await supabase
          .rpc("get_course_by_slug" as never, { _slug: slug } as never);
        const rows = courseData as Array<{ id: string }> | null;
        if (rows && rows.length > 0) {
          await supabase.rpc("enroll_in_course" as never, { _course_id: rows[0].id } as never);
        }
      } catch {
        // enrollment silențios
      }
      router.replace("/student");
    } else {
      router.replace(redirectTo);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail || !resetEmail.includes("@")) {
      toast({
        title: "Email invalid",
        description: "Te rog introdu o adresă de email validă.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setResetLoading(false);

    if (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare. Încearcă din nou.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email trimis!",
      description: `Am trimis un link de resetare parolă la ${resetEmail}. Verifică inbox-ul.`,
    });

    setShowForgotPassword(false);
    setResetEmail("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      


      

      <div className="min-h-screen bg-beige/30 flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Link href="/" className="inline-block mb-8">
              <Logo size="lg" />
            </Link>

            <div className="bg-background rounded-2xl p-8 shadow-soft border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-navy">Bine ai revenit!</h1>
                  <p className="text-muted-foreground text-sm">
                    Autentifică-te pentru a accesa comunitatea
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="tu@exemplu.ro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Parolă</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-sky hover:text-sky-light transition-colors"
                    >
                      Ai uitat parola?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Se încarcă..." : "Autentifică-te"}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Nu ai cont încă?{" "}
                  <Link href={`/student-register?redirect=${encodeURIComponent(redirectTo)}`}
                    className="text-sky hover:text-sky-light font-medium"
                  >
                    Creează cont gratuit
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Decoration */}
        <div className="hidden lg:flex flex-1 bg-navy items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-48 h-48 bg-sky/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-8">
              <Users className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Comunitate <span className="text-gold">interactivă</span>
            </h2>
            <p className="text-beige/70 text-lg leading-relaxed">
              Conectează-te cu alți cursanți, pune întrebări și împărtășește experiențele tale.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetează parola</DialogTitle>
            <DialogDescription>
              Introdu adresa ta de email și îți vom trimite un link pentru a-ți reseta parola.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@exemplu.ro"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
              >
                Anulează
              </Button>
              <Button
                type="submit"
                variant="gold"
                disabled={resetLoading}
                className="flex-1"
              >
                {resetLoading ? "Se trimite..." : "Trimite link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentLogin;
