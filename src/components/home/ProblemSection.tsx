import { FolderX, Link2Off, HelpCircle, CloudOff, DollarSign } from "lucide-react";

const problems = [
  {
    icon: CloudOff,
    title: "Video-uri pe YouTube nepublic",
    description: "Greu de organizat și de trimis",
  },
  {
    icon: FolderX,
    title: "PDF-uri în Drive",
    description: "Pierdute prin zeci de foldere",
  },
  {
    icon: Link2Off,
    title: "Linkuri împrăștiate",
    description: "Fără o structură clară",
  },
  {
    icon: HelpCircle,
    title: "Cursanți confuzi",
    description: '"Unde este lecția 3?"',
  },
  {
    icon: DollarSign,
    title: "Platforme scumpe și complicate",
    description: "Kajabi, Teachable, Thinkific — între 30 și 150€/lună, în engleză, cu setări interminabile",
    wide: true,
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 md:py-32 bg-beige/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
              Problema
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-6">
              Cea mai mare problemă nu este filmarea cursului.{" "}
              <span className="text-gold">Ci organizarea lui.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {problems.map((problem) => (
              <div
                key={problem.title}
                className={`group relative p-6 rounded-2xl bg-white border border-border/60 shadow-sm hover:border-destructive/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden${problem.wide ? " md:col-span-2" : ""}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-destructive/0 via-destructive/40 to-destructive/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-destructive/15 transition-colors">
                    <problem.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy text-lg mb-1">{problem.title}</h3>
                    <p className="text-muted-foreground">{problem.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-destructive/8 border border-destructive/15 text-sm text-destructive/70 line-through">
              Kajabi / Teachable — 39–150€/lună
            </div>
            <div className="text-xl text-muted-foreground font-light">→</div>
            <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl bg-navy text-primary-foreground shadow-lg">
              <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-base font-medium">
                DoCourse rezolvă definitiv haosul —{" "}
                <span className="text-gold font-bold">tot conținutul într-un singur loc</span>, elegant și ușor de folosit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
