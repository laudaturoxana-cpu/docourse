"use client";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WaBubble = ({
  text,
  time,
  className,
}: {
  text: string;
  time?: string;
  className?: string;
}) => (
  <div className={cn("flex justify-end", className)}>
    <div className="max-w-[85%] bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
      <p className="text-[13px] text-gray-800 leading-relaxed">{text}</p>
      {time && <p className="text-[10px] text-gray-500 text-right mt-1">{time}</p>}
    </div>
  </div>
);

const FbCard = ({
  name,
  quote,
  delay,
}: {
  name: string;
  quote: string;
  delay: number;
}) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-700",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="bg-[#F0F2F5] px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold shrink-0">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-900 leading-none">{name}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">via Facebook</p>
        </div>
        <div className="ml-auto">
          <FbIcon />
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">{quote}</p>
      </div>
    </div>
  );
};

const WaCard = ({
  initials,
  name,
  messages,
  delay,
  featured,
}: {
  initials: string;
  name?: string;
  messages: { text: string; time?: string }[];
  delay: number;
  featured?: boolean;
}) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-700",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* WA header */}
      <div className="bg-[#075E54] px-4 py-2.5 flex items-center gap-2">
        <div className={cn(
          "rounded-full flex items-center justify-center text-white font-bold shrink-0",
          featured ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs"
        )}
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-white text-[13px] font-medium leading-none">{name ?? "WhatsApp"}</p>
        </div>
        <WaIcon />
      </div>
      {/* Chat background */}
      <div
        className="px-3 py-3 space-y-2"
        style={{ background: "#E5DDD5" }}
      >
        {messages.map((m, i) => (
          <WaBubble key={i} text={m.text} time={m.time} />
        ))}
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const { ref: headerRef, inView: headerIn } = useInView();

  return (
    <section className="py-16 md:py-28 bg-beige/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={cn(
            "text-center mb-12 transition-all duration-700 ease-out",
            headerIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-sm uppercase tracking-widest text-gold font-semibold mb-3">
            Ce spun creatorii
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Cuvintele lor, nemodificate
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mesaje reale de la creatori care folosesc DoCourse — din Facebook și WhatsApp.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* FB — Smaranda */}
          <FbCard
            name="Smaranda Andriciuc"
            quote="Și eu recomand DoCourse.ro by Roxana Lăudatu. E simpla, accesibila și Roxana te ajută foarte prompt cu orice ai nevoie."
            delay={0}
          />

          {/* FB — Alina Chiteala */}
          <FbCard
            name="Alina Chiteala"
            quote="Recomand Roxana Laudatu. Platforma ei e geniala. Este perfectă, intuitivă, simplă dar cu funcții absolut necesare. Bravo!"
            delay={100}
          />

          {/* WA — Scurt, multiple bule */}
          <WaCard
            initials="CP"
            messages={[
              { text: "am reusit sa creez si comunitate 🎉", time: "16:26" },
              { text: "merge super", time: "16:26" },
              { text: "si e foarte intuitiva", time: "16:26" },
              { text: "imi place ca pasii sunt foarte usor de urmati", time: "16:26" },
              { text: "fara complicatii. functioneaza bine", time: "16:27" },
            ]}
            delay={200}
          />

          {/* WA — Testimonial lung (featured, span 2) */}
          <div
            className="md:col-span-2 lg:col-span-2"
          >
            <WaCard
              initials="DB"
              name="Daniela Bostan"
              featured
              messages={[
                {
                  text: "Mi-am făcut cont pe docourse.ro, am testat un pic și apoi am mers către Roxana cu niște solicitări și propuneri iar ea a implementat absolut tot, și super rapid, și super eficient.",
                  time: "10:42",
                },
                {
                  text: "Mi se pare amazing ce faci, Roxana, și ce oferi. Sunt îndrăgostită de DoCourse și super entuziasmată. A fost cea mai bună decizie ever!",
                  time: "10:43",
                },
              ]}
              delay={150}
            />
          </div>

          {/* WA — KS */}
          <WaCard
            initials="KS"
            messages={[
              {
                text: "Vreau să vă spun că am început să folosesc platforma docourse.ro și îmi place foarte mult cum e gândită. E foarte ușor de folosit urmând pașii. Am încărcat cu ușurință și materiale pdf și video.",
                time: "18:51",
              },
              {
                text: "Felicitări Roxana pentru această platformă!!! 🤍✨",
                time: "18:51",
              },
            ]}
            delay={250}
          />

          {/* WA — Daniela Bostan — a doua */}
          <WaCard
            initials="DB"
            name="Daniela Bostan"
            messages={[
              {
                text: "Nu cred că ai idee cât ești de prețioasă pentru noi... Toate informațiile, susținerea pe care ne-o dai.. Aproape nu-mi vine să cred.",
                time: "14:13",
              },
            ]}
            delay={300}
          />

          {/* WA — Alina Bârcă */}
          <WaCard
            initials="AB"
            name="Alina Bârcă"
            messages={[
              {
                text: "Daaa, și eu o recomand cu încredere pe Roxana! ❤️ Si abia aștept aplicația DoCourse! 🥰",
                time: "13:06",
              },
            ]}
            delay={350}
          />

        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Peste <span className="font-semibold text-navy">50+ creatori</span> din România construiesc cu DoCourse
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
