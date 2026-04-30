"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail, Send, CheckCircle2, MessageSquare, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validare
    if (!formData.name.trim()) {
      setStatus("error");
      setErrorMessage("Te rog introdu numele tău.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setStatus("error");
      setErrorMessage("Te rog introdu o adresă de email validă.");
      return;
    }
    if (!formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Te rog scrie un mesaj.");
      return;
    }

    setStatus("loading");

    try {
      // Pentru moment, salvăm în localStorage
      // În producție: integrare cu email service (SendGrid, Resend, etc.)
      const messages = JSON.parse(localStorage.getItem("contact_messages") || "[]");
      messages.push({
        ...formData,
        date: new Date().toISOString(),
      });
      localStorage.setItem("contact_messages", JSON.stringify(messages));

      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("A apărut o eroare. Încearcă din nou.");
    }
  };

  return (
    <>
      

        <meta
          name="description"
          content="Contactează echipa DoCourse pentru întrebări, suport tehnic sau parteneriate. Răspundem în maxim 24 de ore."
        />
        <meta name="keywords" content="contact docourse, suport cursuri online, întrebări platformă cursuri" />
        <link rel="canonical" href="https://docourse.ro/contact" />
      

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-beige/60 to-background">
            <div className="container mx-auto px-4 py-16 lg:py-24 pt-24 lg:pt-32">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm uppercase tracking-wider text-gold font-semibold mb-3">
                  Contact
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Hai să vorbim
                </h1>
                <p className="text-lg text-muted-foreground">
                  Ai întrebări despre platformă? Vrei să afli mai multe? Scrie-ne și îți răspundem cât mai curând.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-12 lg:grid-cols-5">
                {/* Contact Info */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-navy mb-4">Informații de contact</h2>
                    <p className="text-muted-foreground">
                      Suntem aici să te ajutăm. Alege metoda preferată de contact sau completează formularul.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Email</h3>
                        <a
                          href="mailto:contact@docourse.ro"
                          className="text-muted-foreground hover:text-gold transition-colors"
                        >
                          contact@docourse.ro
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Timp de răspuns</h3>
                        <p className="text-muted-foreground">
                          Răspundem în maxim 24 de ore, de obicei mai repede.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Suport tehnic</h3>
                        <p className="text-muted-foreground">
                          Pentru probleme tehnice, include cât mai multe detalii în mesaj.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-3">
                  <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-card">
                    {status === "success" ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-navy mb-2">Mesaj trimis cu succes!</h3>
                        <p className="text-muted-foreground mb-6">
                          Îți mulțumim pentru mesaj. Te vom contacta în curând.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setStatus("idle")}
                        >
                          Trimite alt mesaj
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nume *</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="Numele tău"
                              value={formData.name}
                              onChange={handleChange}
                              className="h-12"
                              disabled={status === "loading"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="email@exemplu.ro"
                              value={formData.email}
                              onChange={handleChange}
                              className="h-12"
                              disabled={status === "loading"}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subiect</Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Despre ce e vorba?"
                            value={formData.subject}
                            onChange={handleChange}
                            className="h-12"
                            disabled={status === "loading"}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Mesaj *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Scrie-ne mesajul tău aici..."
                            value={formData.message}
                            onChange={handleChange}
                            className="min-h-[150px] resize-none"
                            disabled={status === "loading"}
                          />
                        </div>

                        {status === "error" && (
                          <p className="text-red-500 text-sm">{errorMessage}</p>
                        )}

                        <Button
                          type="submit"
                          variant="hero"
                          size="lg"
                          className="w-full group"
                          disabled={status === "loading"}
                        >
                          {status === "loading" ? (
                            "Se trimite..."
                          ) : (
                            <>
                              Trimite mesajul
                              <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          Prin trimiterea formularului, ești de acord cu{" "}
                          <Link href="/politica-de-confidentialitate" className="text-gold hover:underline">
                            Politica de Confidențialitate
                          </Link>
                          .
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Quick Links */}
          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/30 rounded-2xl p-8 text-center max-w-3xl mx-auto">
              <h2 className="text-xl font-bold text-navy mb-3">
                Ai întrebări frecvente?
              </h2>
              <p className="text-muted-foreground mb-6">
                Poate găsești răspunsul în resursele noastre sau în articolele de pe blog.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/resurse"
                  className="inline-flex items-center gap-2 bg-white border border-border px-6 py-3 rounded-xl font-semibold text-navy hover:border-gold transition-colors"
                >
                  Vezi resursele
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-semibold hover:bg-gold/90 transition-colors"
                >
                  Citește blogul
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
