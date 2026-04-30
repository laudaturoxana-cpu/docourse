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
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { fbTrack } from "@/lib/fbpixel";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Numele trebuie să aibă cel puțin 2 caractere" }),
  email: z.string().trim().email({ message: "Email invalid" }),
  password: z.string().min(8, { message: "Parola trebuie să aibă cel puțin 8 caractere" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Parolele nu coincid",
  path: ["confirmPassword"]
});

const StudentRegister = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/student";
  const { user, signUp, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.replace(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  // Fire Lead event when landing on registration page
  useEffect(() => {
    fbTrack("Lead", { content_name: "Student Registration", currency: "RON", value: 0 });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Eroare de validare",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      role: 'student'
    });

    if (error) {
      console.error("Signup error:", error);
      let message = "A apărut o eroare la crearea contului.";
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        message = "Acest email este deja înregistrat. Te rugăm să te autentifici.";
      } else if (error.message) {
        message = `Eroare: ${error.message}`;
      }
      toast({
        title: "Eroare",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Cont creat cu succes!",
      description: "Bine ai venit! Cursul tău te așteaptă.",
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
        // enrollment silențios — cursul rămâne accesibil prin link
      }
      router.replace("/student");
    } else {
      router.replace(redirectTo);
    }
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
                  <h1 className="text-2xl font-bold text-navy">Creează cont gratuit</h1>
                  <p className="text-muted-foreground text-sm">
                    Accesează comunitatea și conectează-te cu ceilalți
                  </p>
                </div>
              </div>

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
                  {isLoading ? "Se creează contul..." : "Creează cont"}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Ai deja cont?{" "}
                  <Link href={`/student-login?redirect=${encodeURIComponent(redirectTo)}`}
                    className="text-sky hover:text-sky-light font-medium"
                  >
                    Autentifică-te
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
    </>
  );
};

export default StudentRegister;
