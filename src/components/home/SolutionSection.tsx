import { Play, File, Volume2 } from "lucide-react";

const features = [
  {
    emoji: "🎬",
    title: "Video, audio, PDF, Word, imagini",
    description: "Orice tip de fișier, totul într-un singur loc. Fișierele audio se ascultă direct în platformă. PDF-urile se văd în browser, instant.",
    wide: true,
  },
  {
    emoji: "📂",
    title: "Module și lecții clare",
    description: "Organizare profesională a conținutului, structurată logic, ușor de parcurs de cursanți.",
  },
  {
    emoji: "🔓",
    title: "Două moduri de acces",
    description: "Link simplu fără cont sau curs privat cu login — tu alegi ce se potrivește.",
  },
  {
    emoji: "📅",
    title: "Acces programat pe date",
    description: "Programezi exact când devine disponibilă fiecare lecție sau modul. Ca LearnDash, Kajabi sau Thinkific — dar la 9€/lună.",
  },
  {
    emoji: "📶",
    title: "Parcurgere secvențială",
    description: "Activezi deblocarea progresivă. Cursanții avansează pas cu pas, în ritmul pe care îl setezi tu.",
  },
  {
    emoji: "💬",
    title: "Comunitate inclusă",
    description: "Curs și comunitate în același loc. Fără Facebook Groups, fără WhatsApp extern.",
  },
  {
    emoji: "📧",
    title: "Email marketing inclus",
    description: "Creezi liste de abonați, trimiți emailuri și îți construiești audiența direct din platformă. Fără Mailchimp, fără costuri extra.",
  },
  {
    emoji: "🎯",
    title: "Funnel complet cu AI",
    description: "Pagină de captură + pagină de mulțumire legate de lista ta de email. Perfect pentru lead magnet gratuit — ghid, webinar, mini-curs.",
  },
  {
    emoji: "🔗",
    title: "URL-uri curate și personalizabile",
    description: "Cursul tău are o adresă simplă, clară, ușor de distribuit. O personalizezi tu.",
  },
  {
    emoji: "🇷🇴",
    title: "Creat în România",
    description: "Pentru creatori români. Fără plugin-uri. Fără WordPress. Fără surprize.",
    wide: true,
  },
];

const mockModules = [
  {
    title: "Modul 1: Introducere",
    lessons: [
      { title: "Bine ai venit!", icon: Play, type: "Video" },
      { title: "Ghid de start", icon: File, type: "PDF" },
    ],
  },
  {
    title: "Modul 2: Conținut principal",
    lessons: [
      { title: "Lecția 1: Fundamentele", icon: Play, type: "Video" },
      { title: "Meditație ghidată", icon: Volume2, type: "Audio" },
    ],
  },
];

const SolutionSection = () => {
  return (
    <section className="py-24 md:py-36 bg-background">
      <style>{`
        @keyframes featureReveal {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feature-card {
          animation: featureReveal 0.5s ease-out both;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
              Soluția
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-6 px-2">
              Tot cursul tău într-o platformă{" "}
              <span className="text-gold">simplă</span>. Clară.{" "}
              <span className="text-gold">Profesională</span>.
            </h2>
          </div>

          {/* Bento features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={`feature-card group relative p-5 md:p-6 rounded-2xl bg-card border border-border hover:border-gold/40 hover:shadow-medium transition-all duration-300 hover:-translate-y-1${feature.wide ? " sm:col-span-2 lg:col-span-2" : ""}`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Gold top line on hover */}
                <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />

                <div className="text-3xl mb-3 leading-none">{feature.emoji}</div>
                <h3 className="font-semibold text-navy text-base md:text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Visual showcase - Course preview */}
          <div className="mt-12 md:mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-beige rounded-2xl p-4 sm:p-6 md:p-8 border border-border overflow-hidden shadow-soft">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-gold/50" />
                <div className="w-3 h-3 rounded-full bg-sky/50" />
                <div className="flex-1 bg-background/60 rounded-md h-5 mx-2 px-3 flex items-center">
                  <span className="text-xs text-muted-foreground">docourse.ro/cursul-meu-de-mindfulness</span>
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="bg-background rounded-xl p-4 sm:p-5 md:p-6 shadow-soft">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                  <div>
                    <h4 className="text-navy font-bold text-lg md:text-xl">Cursul meu de mindfulness</h4>
                    <p className="text-muted-foreground text-sm">8 lecții • 2 module • Acces privat</p>
                  </div>
                  <span className="px-3 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full w-fit">✓ Publicat</span>
                </div>

                {/* Modules */}
                <div className="space-y-4">
                  {mockModules.map((module, idx) => (
                    <div key={idx} className="bg-beige/30 rounded-lg p-3 sm:p-4">
                      <h5 className="font-semibold text-navy text-sm md:text-base mb-3">{module.title}</h5>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIdx) => (
                          <div key={lessonIdx} className="flex items-center gap-3 bg-background rounded-lg p-2.5 sm:p-3">
                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                              <lesson.icon className="w-4 h-4 text-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-navy text-sm font-medium truncate">{lesson.title}</p>
                            </div>
                            <span className="text-xs text-muted-foreground hidden sm:block">{lesson.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
