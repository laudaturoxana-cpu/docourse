"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Crown,
  Clock,
  AlertTriangle,
  Ban,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";

interface Creator {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  activity: string | null;
  plan_type: string | null;
  subscription_active: boolean;
  beta_tester: boolean;
  lifetime_access: boolean;
  created_at: string;
  course_count: number;
  stripe_status: string | null;
  trial_end: number | null;
}

function SubscriptionBadge({ creator }: { creator: Creator }) {
  if (creator.beta_tester || creator.lifetime_access) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold">
        <Crown className="w-3 h-3" /> Gratuit permanent
      </span>
    );
  }
  if (creator.stripe_status === "trialing") {
    const daysLeft = creator.trial_end
      ? Math.max(0, Math.ceil((creator.trial_end * 1000 - Date.now()) / 86400000))
      : null;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Clock className="w-3 h-3" />
        Trial{daysLeft !== null ? ` — ${daysLeft}z` : ""}
      </span>
    );
  }
  if (creator.stripe_status === "active" || (creator.subscription_active && !creator.stripe_status)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" /> Activ
      </span>
    );
  }
  if (creator.stripe_status === "past_due" || creator.stripe_status === "unpaid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
        <AlertTriangle className="w-3 h-3" /> Plată eșuată
      </span>
    );
  }
  if (creator.stripe_status === "canceled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
        <Ban className="w-3 h-3" /> Anulat
      </span>
    );
  }
  if (creator.stripe_status === "incomplete" || creator.stripe_status === "incomplete_expired") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <AlertCircle className="w-3 h-3" /> Incomplet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      <XCircle className="w-3 h-3" /> Inactiv
    </span>
  );
}

const Admin = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, isLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;

    loadCreators();

    const channel = supabase
      .channel("admin-profiles-watch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => { loadCreators(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const loadCreators = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-admin-creators");

      if (error) {
        console.error("get-admin-creators error:", error);
        return;
      }

      setCreators(data.creators || []);
    } finally {
      setLoadingData(false);
    }
  };

  const isVisible = (c: Creator) =>
    c.beta_tester ||
    c.lifetime_access ||
    c.stripe_status === "trialing" ||
    c.stripe_status === "active" ||
    (c.subscription_active && !c.stripe_status);

  const filteredCreators = creators.filter((c) => {
    if (!isVisible(c)) return false;
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      (c.full_name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.activity || "").toLowerCase().includes(q) ||
      (c.plan_type || "").toLowerCase().includes(q)
    );
  });

  const activeCreators = creators.filter(isVisible);
  const trialCount = activeCreators.filter((c) => c.stripe_status === "trialing").length;
  const paidCount = activeCreators.filter(
    (c) => c.stripe_status === "active" || c.beta_tester || c.lifetime_access ||
           (c.subscription_active && c.stripe_status !== "trialing" && !c.stripe_status)
  ).length;
  const totalCourses = activeCreators.reduce((acc, c) => acc + c.course_count, 0);

  const stats = [
    { label: "Total creatori", value: activeCreators.length, icon: Users, color: "navy" },
    { label: "Abonamente plătite", value: paidCount, icon: CheckCircle, color: "gold" },
    { label: "În trial (7 zile)", value: trialCount, icon: Clock, color: "sky" },
    { label: "Total cursuri", value: totalCourses, icon: BookOpen, color: "green" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <>
        

          <meta name="robots" content="noindex, nofollow" />
        
        <div className="min-h-screen bg-beige/30 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-8 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Acces interzis</h1>
            <p className="text-muted-foreground mb-6">Nu ai permisiunea de a accesa această pagină.</p>
            <Link href="/dashboard">
              <Button variant="outline">Înapoi la Dashboard</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      

        <meta name="robots" content="noindex, nofollow" />
      

      <div className="min-h-screen bg-beige/30">
        <header className="bg-navy text-primary-foreground px-4 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Logo size="md" className="[&_span]:text-primary-foreground [&_.text-gold]:text-gold" />
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-sm">
                <Shield className="w-4 h-4" />
                Admin Panel
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-beige hover:text-primary-foreground"
                onClick={loadCreators}
                disabled={loadingData}
              >
                <RefreshCw className={cn("w-4 h-4", loadingData && "animate-spin")} />
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-beige hover:text-primary-foreground hover:bg-navy-light">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Înapoi la Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-background rounded-2xl p-6 border border-border shadow-card">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    stat.color === "gold" && "bg-gold/10",
                    stat.color === "sky" && "bg-sky/10",
                    stat.color === "navy" && "bg-navy/10",
                    stat.color === "green" && "bg-green-50"
                  )}>
                    <stat.icon className={cn(
                      "w-6 h-6",
                      stat.color === "gold" && "text-gold",
                      stat.color === "sky" && "text-sky",
                      stat.color === "navy" && "text-navy",
                      stat.color === "green" && "text-green-600"
                    )} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Creators table */}
          <div className="bg-background rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-navy">Creatori înregistrați</h2>
                  <p className="text-sm text-muted-foreground">{activeCreators.length} creatori activi</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Caută după nume, activitate..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-72"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingData ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-beige/30">
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Creator</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Activitate</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Cursuri</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Înregistrat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCreators.map((creator) => {
                      return (
                        <tr key={creator.id} className="hover:bg-beige/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold shrink-0">
                                {creator.full_name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-navy">
                                    {creator.full_name || "Fără nume"}
                                  </p>
                                  {(creator.beta_tester || creator.lifetime_access) && (
                                    <Crown className="w-3.5 h-3.5 text-gold" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{creator.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-charcoal text-sm">{creator.activity || "—"}</td>
                          <td className="px-6 py-4">
                            {creator.lifetime_access || creator.beta_tester ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold">
                                <Crown className="w-3 h-3" /> Gratuit
                              </span>
                            ) : creator.plan_type ? (
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                creator.plan_type === "pro" ? "bg-navy/10 text-navy" : "bg-muted text-muted-foreground"
                              )}>
                                {creator.plan_type === "pro" ? "Pro" : "Starter"}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-charcoal text-sm font-medium">{creator.course_count}</td>
                          <td className="px-6 py-4">
                            <SubscriptionBadge creator={creator} />
                          </td>
                          <td className="px-6 py-4 text-charcoal text-sm">
                            {new Date(creator.created_at).toLocaleDateString("ro-RO")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {!loadingData && filteredCreators.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nu s-au găsit creatori</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Admin;
