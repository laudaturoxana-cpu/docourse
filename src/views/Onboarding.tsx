"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, PartyPopper, CheckCircle } from "lucide-react";
import { z } from "zod";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { fbTrack } from "@/lib/fbpixel";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Numele trebuie să aibă cel puțin 2 caractere" }),
  activity: z.string().trim().min(2, { message: "Te rugăm să completezi activitatea" }),
  email: z.string().trim().email({ message: "Email invalid" }),
  password: z.string().min(8, { message: "Parola trebuie să aibă cel puțin 8 caractere" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"]
});

const Onboarding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const { user, signUp, signIn, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    activity: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only redirect if user was already logged in when page loaded
    // Don't redirect during signup process (isLoading handles that)
    if (user && !authLoading && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router, isLoading]);

  // Fire Lead event when landing on this page (after selecting subscription)
  useEffect(() => {
    fbTrack("Lead", { content_name: "Free Trial Creator", currency: "RON", value: 0 });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Eroare de validare",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error, userId: newUserId } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      activity: formData.activity,
      role: 'creator'
    });

    if (error) {
      console.error("Signup error details:", error);

      // Emailul există deja — îl logăm automat
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (!signInError) {
          if (sessionId) {
            const { data: { user: existingUser } } = await supabase.auth.getUser();
            if (existingUser) {
              await fetch("/api/activate-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, userId: existingUser.id }),
              });
            }
          }
          toast({ title: "Bine ai revenit!", description: "Te-am autentificat automat." });
          router.push(sessionId ? "/dashboard" : "/pricing");
          setIsLoading(false);
          return;
        }
        toast({
          title: "Email deja înregistrat",
          description: "Ai deja un cont cu acest email. Mergi la autentificare.",
          variant: "destructive",
        });
        setIsLoading(false);
        router.push("/login");
        return;
      }

      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la crearea contului.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Activăm planul folosind userId-ul din signUp direct (nu getUser care poate fi null)
    if (sessionId && newUserId) {
      await fetch("/api/activate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: newUserId }),
      });
    }

    setIsLoading(false);

    toast({
      title: "Cont creat cu succes!",
      description: "Bine ai venit în DoCourse!",
    });
    router.push(sessionId ? "/dashboard" : "/pricing");
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
      


      

      <div className="min-h-screen bg-beige/30 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center" />
          </div>

          {sessionId && (
            <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6 mb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold text-navy mb-2">
                🎉 Felicitări, abonamentul tău este activ!
              </h1>
              <p className="text-charcoal">
                Începe prin a-ți crea contul de Creator DoCourse.
              </p>
            </div>
          )}

          <div className="bg-background rounded-2xl p-8 shadow-soft border border-border">
            <h2 className="text-xl font-bold text-navy mb-6">Creează-ți contul</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nume complet</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Ion Popescu"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activitate</Label>
                <Input
                  id="activity"
                  name="activity"
                  type="text"
                  placeholder="Ex: psiholog, coach, trainer"
                  value={formData.activity}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@exemplu.ro"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parolă</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minim 8 caractere"
                    value={formData.password}
                    onChange={handleChange}
                    required
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmă parola</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repetă parola"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Se creează contul..." : "Creează contul"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Ce primești:</p>
              <ul className="space-y-2">
                {["Cursuri nelimitate", "Lecții și module nelimitate", "Link unic pentru studenți"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-charcoal">
                    <CheckCircle className="w-4 h-4 text-gold" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Ai deja cont?{" "}
                <Link href="/login" className="text-sky hover:text-sky-light font-medium">
                  Autentifică-te
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Onboarding;
