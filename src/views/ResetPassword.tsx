"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { z } from "zod";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";

const passwordSchema = z.object({
  password: z.string().min(8, { message: "Parola trebuie să aibă cel puțin 8 caractere" }),
  confirmPassword: z.string().min(8, { message: "Confirmă parola" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu se potrivesc",
  path: ["confirmPassword"]
});

const ResetPassword = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      setHasValidToken(true);
    } else {
      setTimeout(() => {
        toast({
          title: "Link invalid sau expirat",
          description: "Te rugăm să solici un nou link de resetare parolă.",
          variant: "destructive",
        });
        router.push("/login");
      }, 2000);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = passwordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      toast({
        title: "Eroare de validare",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare la resetarea parolei. Încearcă din nou.",
        variant: "destructive",
      });
      return;
    }

    setIsSuccess(true);

    toast({
      title: "Succes!",
      description: "Parola ta a fost resetată cu succes.",
    });

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  };

  if (!hasValidToken) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <>
        

        
        <div className="min-h-screen bg-beige/30 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-background rounded-2xl p-8 shadow-soft border border-border text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-navy mb-2">Parola resetată cu succes!</h1>
              <p className="text-muted-foreground mb-6">
                Te redirecționăm către pagina de autentificare...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin w-4 h-4 border-2 border-gold border-t-transparent rounded-full" />
                <span>Redirecționare...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      

      

      <div className="min-h-screen bg-beige/30 flex">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Logo size="lg" />
            </div>

            <div className="bg-background rounded-2xl p-8 shadow-soft border border-border">
              <h1 className="text-2xl font-bold text-navy mb-2">Setează parolă nouă</h1>
              <p className="text-muted-foreground mb-8">
                Introdu parola ta nouă mai jos. Asigură-te că are cel puțin 8 caractere.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Parolă nouă</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <p className="text-xs text-muted-foreground">Minim 8 caractere</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmă parola</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-charcoal transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? "Se procesează..." : "Resetează parola"}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Îți amintești parola?{" "}
                  <button onClick={() => router.push("/login")} className="text-sky hover:text-sky-light font-medium">
                    Autentifică-te
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-navy items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-48 h-48 bg-sky/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Securizează-ți <span className="text-gold">contul</span>
            </h2>
            <p className="text-beige/70 text-lg leading-relaxed">
              Alege o parolă puternică pentru a-ți proteja cursurile și datele personale.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
