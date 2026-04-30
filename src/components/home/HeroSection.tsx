"use client";

import { ArrowRight, Play, Sparkles, TrendingUp, Users, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import PlanSelectionDialog from "./PlanSelectionDialog";
import { useSearchParams, useRouter } from "next/navigation";

const HeroSection = () => {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const scrollToHowItWorks = () => {
    const element = document.getElementById("cum-functioneaza");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const shouldOpen = searchParams?.get("select-plan") === "1";
    if (shouldOpen) {
      setShowPlanDialog(true);
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <section className="relative pt-28 md:pt-36 pb-0 overflow-hidden bg-gradient-hero">
      <style>{`
        @keyframes blobMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.07); }
          66% { transform: translate(-20px, 15px) scale(0.96); }
        }
        @keyframes blobMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-35px, 20px) scale(1.04); }
          66% { transform: translate(20px, -30px) scale(0.95); }
        }
        @keyframes blobMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -15px) scale(1.06); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(212,175,55,0); }
        }
        @keyframes mockupFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .blob-1 { animation: blobMove1 9s ease-in-out infinite; }
        .blob-2 { animation: blobMove2 12s ease-in-out infinite; }
        .blob-3 { animation: blobMove3 7s ease-in-out infinite; }
        .badge-pulse { animation: badgePulse 2.8s ease-in-out infinite; }
        .mockup-float { animation: mockupFloat 5s ease-in-out infinite; }
        .bar-grow { animation: barGrow 0.8s ease-out forwards; transform-origin: bottom; }
        .bar-grow-1 { animation-delay: 0.2s; }
        .bar-grow-2 { animation-delay: 0.35s; }
        .bar-grow-3 { animation-delay: 0.5s; }
        .bar-grow-4 { animation-delay: 0.65s; }
        .bar-grow-5 { animation-delay: 0.8s; }
        .bar-grow-6 { animation-delay: 0.95s; }
      `}</style>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-[-8%] w-[550px] h-[550px] bg-gold/10 rounded-full blur-3xl blob-1" />
        <div className="absolute bottom-10 left-[-8%] w-[480px] h-[480px] bg-sky/10 rounded-full blur-3xl blob-2" />
        <div className="absolute top-1/2 left-[30%] w-80 h-80 bg-beige rounded-full blur-3xl opacity-40 blob-3" />

        {/* Floating particles */}
        <div className="absolute top-28 left-[12%] w-2.5 h-2.5 bg-gold/50 rounded-full animate-float" />
        <div className="absolute top-52 right-[18%] w-1.5 h-1.5 bg-sky/60 rounded-full animate-float delay-300" />
        <div className="absolute top-72 left-[35%] w-1 h-1 bg-gold/40 rounded-full animate-float delay-500" />
        <div className="absolute bottom-48 left-[22%] w-2 h-2 bg-gold/30 rounded-full animate-float delay-200" />
        <div className="absolute bottom-32 right-[12%] w-2 h-2 bg-sky/40 rounded-full animate-float delay-400" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231C2A3A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold/10 border border-gold/25 text-gold text-sm font-medium mb-8 animate-fade-up badge-pulse">
            <Sparkles className="w-4 h-4" />
            🇷🇴 Platformă românească pentru creatori
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6 md:mb-8 animate-fade-up px-2">
            Livrează cursuri online{" "}
            <span className="text-gold">profesionist</span>.{" "}
            <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-charcoal/70">
              Simplu, clar, fără stres tehnic.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-charcoal/80 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-up delay-100 px-2">
            Cursuri, audio, PDF-uri, comunitate și acces controlat —{" "}
            <span className="font-semibold text-navy">totul într-un singur loc, la 9€/lună.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-200 px-4 sm:px-0">
            <Button
              variant="hero"
              size="xl"
              className="group w-full sm:w-auto flex-col py-4 h-auto"
              onClick={() => setShowPlanDialog(true)}
            >
              <span className="text-base sm:text-lg">Începe 7 zile gratuit</span>
              <span className="text-xs sm:text-sm opacity-80 font-normal">apoi 9€/lună sau 90€/an</span>
            </Button>
            <Button
              variant="hero-secondary"
              size="xl"
              onClick={scrollToHowItWorks}
              className="group w-full sm:w-auto"
            >
              <Play className="mr-2 w-5 h-5" />
              Vezi cum funcționează
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 md:mt-14 pt-8 border-t border-border/50 animate-fade-up delay-300">
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 uppercase tracking-wider">De încredere pentru creatori din România</p>
            <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-xs sm:max-w-md mx-auto">
              {[
                { label: "Cursuri", sub: "Nelimitate", path: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
                { label: "Fișiere", sub: "Nelimitate", path: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
                { label: "Acces", sub: "Public / privat", path: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center gap-2 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path} />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-navy text-xs sm:text-sm">{item.sub}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product mockup */}
        <div className="mt-16 md:mt-20 animate-fade-up delay-400 max-w-5xl mx-auto mockup-float">
          {/* Browser chrome */}
          <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(28,42,58,0.35)] border border-navy/10">
            {/* Title bar */}
            <div className="bg-navy px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-navy-light/60 rounded-md px-4 py-1 flex items-center gap-2 min-w-0 max-w-[260px] w-full">
                  <div className="w-3 h-3 rounded-full bg-green-400/60 flex-shrink-0" />
                  <span className="text-beige/60 text-xs truncate">app.docourse.ro/dashboard</span>
                </div>
              </div>
              <div className="w-16" />
            </div>

            {/* Dashboard content */}
            <div className="bg-[#f7f5f0] p-4 md:p-6">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="h-4 w-32 bg-navy/15 rounded-md mb-1.5" />
                  <div className="h-3 w-24 bg-navy/8 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-28 bg-gold/20 rounded-lg border border-gold/30 flex items-center justify-center gap-1.5 px-3">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    <div className="h-2.5 w-14 bg-gold/50 rounded" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center">
                    <span className="text-gold text-xs font-bold">R</span>
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { icon: Users, label: "Total cursanți", value: "247", sub: "pe toate cursurile", gradient: "from-amber-50 to-yellow-50", border: "border-amber-200/60", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
                  { icon: TrendingUp, label: "Înscriși azi", value: "+12", sub: "ultimele 24h", gradient: "from-emerald-50 to-green-50", border: "border-emerald-200/60", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
                  { icon: BookOpen, label: "Cursuri active", value: "5", sub: "3 publicate", gradient: "from-blue-50 to-sky-50", border: "border-blue-200/60", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                  { icon: CheckCircle2, label: "Rată finalizare", value: "74%", sub: "media cursurilor", gradient: "from-violet-50 to-purple-50", border: "border-violet-200/60", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
                ].map((card, i) => (
                  <div key={i} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-3 border ${card.border}`}>
                    <div className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center mb-2`}>
                      <card.icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                    </div>
                    <div className="text-lg font-bold text-navy leading-none mb-0.5">{card.value}</div>
                    <div className="text-[10px] font-medium text-navy/70 leading-tight">{card.label}</div>
                    <div className="text-[9px] text-navy/40 mt-0.5">{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Chart + course list row */}
              <div className="grid md:grid-cols-5 gap-3">
                {/* Chart */}
                <div className="md:col-span-3 bg-white rounded-xl p-4 border border-border/40 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-gold" />
                    <div className="h-3 w-36 bg-navy/12 rounded" />
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[35, 55, 42, 70, 48, 85, 62, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end">
                        <div
                          className={`bg-gold/70 rounded-t-sm bar-grow bar-grow-${Math.min(i + 1, 6)}`}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug"].map((m) => (
                      <span key={m} className="text-[8px] text-navy/30 flex-1 text-center">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Course list */}
                <div className="md:col-span-2 bg-white rounded-xl p-4 border border-border/40 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-gold" />
                    <div className="h-3 w-24 bg-navy/12 rounded" />
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { title: "Curs Mindfulness", students: 89, pct: 72 },
                      { title: "Coaching & Leadership", students: 64, pct: 58 },
                      { title: "Nutriție funcțională", students: 94, pct: 81 },
                    ].map((course, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-navy/80 truncate flex-1 mr-2">{course.title}</span>
                          <span className="text-[9px] text-navy/40 flex-shrink-0">{course.students} cursanți</span>
                        </div>
                        <div className="h-1.5 bg-beige rounded-full overflow-hidden">
                          <div className="h-full bg-gold/70 rounded-full" style={{ width: `${course.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave — pushed below the mockup */}
      <div className="mt-[-2px]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path
            d="M0 80L60 73C120 67 240 53 360 47C480 40 600 40 720 43C840 47 960 53 1080 57C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>

      <PlanSelectionDialog open={showPlanDialog} onOpenChange={setShowPlanDialog} />
    </section>
  );
};

export default HeroSection;
