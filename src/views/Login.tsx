"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
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

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/dashboard";
  const { user, signIn, sessionError, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { isBlocked, recordFailure, recordSuccess } = useLoginRateLimit("creator");

  useEffect(() => {
    if (user && !authLoading) {
      const safe = returnTo.startsWith("/") ? returnTo : "/dashboard";
      router.replace(safe);
    }
  }, [user, authLoading, router, returnTo]);

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
    const safe = returnTo.startsWith("/") ? returnTo : "/dashboard";
    router.replace(safe);
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
              <h1 className="text-2xl font-bold text-navy mb-2">Bine ai revenit!</h1>
              <p className="text-muted-foreground mb-8">
                Autentifică-te pentru a accesa dashboard-ul
              </p>

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
                  variant="gold" 
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
                  <a
                    href="https://buy.stripe.com/bJe28r3CS78r8rm8WEaAw0i"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky hover:text-sky-light font-medium"
                  >
                    Activează abonamentul
                  </a>
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
              <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Creează cursuri <span className="text-gold">profesionale</span>
            </h2>
            <p className="text-beige/70 text-lg leading-relaxed">
              Organizează-ți conținutul în module clare și oferă cursanților 
              o experiență premium de învățare.
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

export default Login;