import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { supabase } from "@/lib/supabase/browser";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Te rog introdu o adresă de email validă.");
      return;
    }

    setStatus("loading");

    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: email.trim().toLowerCase() },
      });

      if (error || data?.error) {
        setStatus("error");
        setErrorMessage(data?.error || "A apărut o eroare. Încearcă din nou.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("A apărut o eroare. Încearcă din nou.");
    }
  };

  return (
    <section className="py-16 md:py-20 bg-beige/40">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            Newsletter
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
            Sfaturi pentru creatori de cursuri
          </h2>

          <p className="text-muted-foreground mb-8">
            Primești ghiduri, strategii și idei pentru a-ți crește afacerea cu cursuri online.
            Fără spam, doar conținut util.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-3 text-green-600 bg-green-50 rounded-xl p-6">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-medium">Mulțumim! Te-ai abonat cu succes.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Adresa ta de email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className="flex-1 h-12 px-4 rounded-xl border-border bg-white"
                disabled={status === "loading"}
              />
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="group whitespace-nowrap"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  "Se trimite..."
                ) : (
                  <>
                    Abonează-te
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {status === "error" && (
            <p className="text-red-500 text-sm mt-3">{errorMessage}</p>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Poți renunța oricând. Datele tale sunt în siguranță.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
