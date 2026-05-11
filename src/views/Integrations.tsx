"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Globe,
  Code2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/DashboardSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";

interface ApiKey {
  id: string;
  label: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

async function sha256hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  const random = Array.from(arr)
    .map((b) => chars[b % chars.length])
    .join("");
  return `dok_live_${random}`;
}

export default function Integrations() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [activeTab, setActiveTab] = useState<"keys" | "docs">("keys");
  const [docLang, setDocLang] = useState<"js" | "php" | "curl">("js");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const hasActiveSubscription =
    profile?.subscription_active || profile?.beta_tester || profile?.lifetime_access;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profile?.id) return;
    const fetchData = async () => {
      setLoading(true);
      const [{ data: keys }, { data: courseData }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("creator_api_keys")
          .select("id, label, key_prefix, created_at, last_used_at, is_active")
          .eq("creator_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("courses")
          .select("id, title, slug")
          .eq("creator_id", profile.id)
          .eq("is_published", true)
          .order("title"),
      ]);
      setApiKeys((keys as ApiKey[]) || []);
      setCourses(courseData || []);
      if (courseData?.[0]) setSelectedCourseId(courseData[0].id);
      setLoading(false);
    };
    fetchData();
  }, [profile?.id]);

  const handleCreateKey = async () => {
    if (!newKeyLabel.trim() || !profile?.id) return;
    setIsCreating(true);
    try {
      const fullKey = generateApiKey();
      const keyHash = await sha256hex(fullKey);
      const keyPrefix = fullKey.slice(0, 20);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("creator_api_keys").insert({
        creator_id: profile.id,
        label: newKeyLabel.trim(),
        key_prefix: keyPrefix,
        key_hash: keyHash,
        is_active: true,
      });

      if (error) throw error;

      setNewlyCreatedKey(fullKey);
      setNewKeyLabel("");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await (supabase as any)
        .from("creator_api_keys")
        .select("id, label, key_prefix, created_at, last_used_at, is_active")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false });
      setApiKeys((updated as ApiKey[]) || []);

      toast({ title: "Cheie generată!", description: "Copiaz-o acum — nu o vei mai vedea." });
    } catch (err) {
      console.error(err);
      toast({ title: "Eroare", description: "Nu s-a putut genera cheia.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("creator_api_keys")
      .update({ is_active: false })
      .eq("id", keyId);
    if (error) {
      toast({ title: "Eroare", description: "Nu s-a putut revoca cheia.", variant: "destructive" });
      return;
    }
    setApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k))
    );
    toast({ title: "Cheie revocată", description: "Cheia nu mai poate fi folosită." });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const exampleKey = "dok_live_CHEIA_TA_API";

  const codeExamples: Record<"js" | "php" | "curl", string> = {
    js: `// JavaScript / Node.js
// Apelează după ce clientul a plătit

const response = await fetch(
  "https://yldzsohmhxeewaqyhybp.supabase.co/functions/v1/external-enroll",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "${exampleKey}"
    },
    body: JSON.stringify({
      email: "student@exemplu.ro",
      course_id: "${selectedCourseId || "UUID_CURSULUI_TAU"}",
      name: "Prenume Nume"   // opțional
    })
  }
);

const data = await response.json();
// data.login_url → redirecționează clientul aici
if (data.success) {
  window.location.href = data.login_url;
}`,

    php: `<?php
// PHP — ex. după WooCommerce order complete

$response = wp_remote_post(
  "https://yldzsohmhxeewaqyhybp.supabase.co/functions/v1/external-enroll",
  [
    "headers" => [
      "Content-Type"  => "application/json",
      "x-api-key"     => "${exampleKey}",
    ],
    "body" => json_encode([
      "email"     => $order->get_billing_email(),
      "course_id" => "${selectedCourseId || "UUID_CURSULUI_TAU"}",
      "name"      => $order->get_billing_first_name()
    ]),
  ]
);

$data = json_decode(wp_remote_retrieve_body($response), true);
// $data["login_url"] → trimite link pe email sau redirecționează
?>`,

    curl: `# cURL — test rapid din terminal

curl -X POST \\
  https://yldzsohmhxeewaqyhybp.supabase.co/functions/v1/external-enroll \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${exampleKey}" \\
  -d '{
    "email": "student@exemplu.ro",
    "course_id": "${selectedCourseId || "UUID_CURSULUI_TAU"}",
    "name": "Prenume Nume"
  }'

# Răspuns așteptat:
# {
#   "success": true,
#   "login_url": "https://docourse.ro/student-login?token=...",
#   "student_id": "uuid",
#   "course_slug": "${selectedCourse?.slug || "slug-curs"}"
# }`,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige/30">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;
  if (!authLoading && profile && !hasActiveSubscription) return <SubscriptionRequired />;

  return (
    <div className="min-h-screen bg-beige/30 flex">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between shrink-0">
          <button className="lg:hidden p-2 text-charcoal" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block" />
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold">
            {profile?.full_name?.charAt(0) || "C"}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pb-mobile-nav">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <Globe className="w-5 h-5 text-gold" />
              <h1 className="text-2xl font-bold text-navy">Integrări API</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Conectează orice site extern (WordPress, Webflow, custom) cu DoCourse. Înscrie studenți automat după plată.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("keys")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "keys"
                  ? "border-gold text-gold"
                  : "border-transparent text-muted-foreground hover:text-navy"
              }`}
            >
              <Key className="w-4 h-4 inline mr-2" />
              Chei API
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "docs"
                  ? "border-gold text-gold"
                  : "border-transparent text-muted-foreground hover:text-navy"
              }`}
            >
              <Code2 className="w-4 h-4 inline mr-2" />
              Cum se integrează
            </button>
          </div>

          {/* ── TAB: CHEI API ── */}
          {activeTab === "keys" && (
            <div className="space-y-6 max-w-2xl">

              {/* Newly created key — one-time reveal */}
              {newlyCreatedKey && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Copiaz-o acum — nu o vei mai vedea!</p>
                      <p className="text-sm text-amber-700">Cheia se afișează o singură dată. Dacă o pierzi, trebuie să generezi una nouă.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm font-mono text-amber-900 break-all">
                      {newlyCreatedKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                      className="shrink-0"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <button
                    className="text-xs text-amber-600 underline mt-2"
                    onClick={() => setNewlyCreatedKey(null)}
                  >
                    Am copiat-o, ascunde
                  </button>
                </div>
              )}

              {/* Generate new key */}
              <div className="bg-background rounded-2xl border border-border p-5">
                <h2 className="font-semibold text-navy mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-gold" />
                  Generează cheie nouă
                </h2>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="key-label" className="text-xs mb-1.5 block">
                      Etichetă (ex: "Site WordPress", "WooCommerce")
                    </Label>
                    <Input
                      id="key-label"
                      placeholder="ex: Site roxanalaudatu.ro"
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                      disabled={isCreating}
                    />
                  </div>
                  <Button
                    variant="hero"
                    onClick={handleCreateKey}
                    disabled={isCreating || !newKeyLabel.trim()}
                    className="self-end"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    {isCreating ? "..." : "Generează"}
                  </Button>
                </div>
              </div>

              {/* Keys list */}
              <div className="bg-background rounded-2xl border border-border p-5">
                <h2 className="font-semibold text-navy mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-gold" />
                  Chei active
                </h2>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nicio cheie generată încă.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-navy text-sm">{key.label}</span>
                            <Badge
                              variant={key.is_active ? "default" : "secondary"}
                              className={`text-xs ${key.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                            >
                              {key.is_active ? "Activă" : "Revocată"}
                            </Badge>
                          </div>
                          <code className="text-xs text-muted-foreground font-mono">
                            {key.key_prefix}...
                          </code>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Creată: {new Date(key.created_at).toLocaleDateString("ro-RO")}
                            {key.last_used_at && (
                              <> · Ultima folosire: {new Date(key.last_used_at).toLocaleDateString("ro-RO")}</>
                            )}
                          </p>
                        </div>
                        {key.is_active && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevoke(key.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course IDs */}
              {courses.length > 0 && (
                <div className="bg-background rounded-2xl border border-border p-5">
                  <h2 className="font-semibold text-navy mb-1 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-gold" />
                    ID-urile cursurilor tale
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    Folosește aceste ID-uri în parametrul <code className="bg-muted px-1 rounded">course_id</code> din API.
                  </p>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy truncate">{course.title}</p>
                          <code className="text-xs text-muted-foreground font-mono">{course.id}</code>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(course.id);
                            toast({ title: "Copiat!", description: course.title });
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: DOCUMENTAȚIE ── */}
          {activeTab === "docs" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-background rounded-2xl border border-border p-5">
                <h2 className="font-semibold text-navy mb-2">Cum funcționează</h2>
                <ol className="space-y-2 text-sm text-charcoal list-decimal list-inside">
                  <li>Clientul cumpără cursul pe site-ul tău (Stripe, PayPal, orice).</li>
                  <li>Site-ul tău apelează API-ul DoCourse cu emailul clientului și ID-ul cursului.</li>
                  <li>DoCourse creează automat contul studentului (dacă nu există) și îl înscrie la curs.</li>
                  <li>API-ul returnează un <code className="bg-muted px-1 rounded">login_url</code> — redirecționezi clientul acolo sau îl trimiți pe email.</li>
                  <li>Studentul dă click și e direct autentificat, gata să acceseze cursul.</li>
                </ol>
              </div>

              {/* Code selector */}
              <div className="bg-background rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="font-semibold text-navy">Exemplu de cod</h2>
                  <div className="flex gap-2 items-center flex-wrap">
                    {courses.length > 0 && (
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1.5 text-charcoal bg-background"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    )}
                    {(["js", "php", "curl"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setDocLang(lang)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          docLang === lang
                            ? "bg-navy text-white"
                            : "bg-muted text-charcoal hover:bg-beige"
                        }`}
                      >
                        {lang === "js" ? "JavaScript" : lang === "php" ? "PHP / WordPress" : "cURL"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <pre className="bg-navy text-green-300 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed whitespace-pre">
                    {codeExamples[docLang]}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeExamples[docLang]);
                      toast({ title: "Cod copiat!" });
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Response format */}
              <div className="bg-background rounded-2xl border border-border p-5">
                <h2 className="font-semibold text-navy mb-3">Răspuns API</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <Badge className="bg-green-100 text-green-700 mb-2">200 OK</Badge>
                    <pre className="bg-muted rounded-lg p-3 text-xs font-mono">{`{
  "success": true,
  "student_id": "uuid",
  "course_slug": "${selectedCourse?.slug || "slug-curs"}",
  "login_url": "https://docourse.ro/student-login?token=..."
}`}</pre>
                  </div>
                  <div>
                    <Badge className="bg-red-100 text-red-700 mb-2">401 Unauthorized</Badge>
                    <pre className="bg-muted rounded-lg p-3 text-xs font-mono">{`{ "error": "Invalid or inactive API key" }`}</pre>
                  </div>
                  <div>
                    <Badge className="bg-orange-100 text-orange-700 mb-2">404 Not Found</Badge>
                    <pre className="bg-muted rounded-lg p-3 text-xs font-mono">{`{ "error": "Course not found or not published" }`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
