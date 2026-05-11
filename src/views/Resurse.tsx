"use client";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const Resurse = () => {
  const resources = [
    {
      title: "Cum să creezi un curs online care se vinde",
      excerpt: "Ghid rapid cu pași clari, structură și greșeli de evitat.",
      href: "/cum-sa-creezi-un-curs-online",
    },
    {
      title: "Platformă simplă pentru cursuri online",
      excerpt: "Pentru începători: publicare rapidă, fără setări complicate.",
      href: "/platforma-simpla-cursuri-online",
    },
    {
      title: "Platformă cursuri online în România",
      excerpt: "De ce DoCourse este o platformă locală potrivită.",
      href: "/platforma-cursuri-online",
    },
    {
      title: "Alternativa Teachable România",
      excerpt: "Compară opțiunile și vezi de ce DoCourse e mai potrivită.",
      href: "/alternativa-teachable-romania",
    },
    {
      title: "Alternativa Kajabi mai ieftină",
      excerpt: "Soluție simplă pentru creatori români.",
      href: "/alternativa-kajabi-ieftina",
    },
    {
      title: "Platformă cursuri cu comunitate",
      excerpt: "Curs + comunitate într-un singur loc.",
      href: "/platforma-cursuri-cu-comunitate",
    },
    {
      title: "Platformă cursuri pentru coachi",
      excerpt: "Pentru mentori, coachi și formatori.",
      href: "/platforma-cursuri-coaching",
    },
    {
      title: "Platformă cursuri pentru mentori",
      excerpt: "Programe de mentoring cu suport clar.",
      href: "/platforma-cursuri-mentori",
    },
    {
      title: "Platformă cursuri pentru psihologi",
      excerpt: "Pentru psihologi și terapeuți, cu suport clar.",
      href: "/platforma-cursuri-psihologi",
    },
    {
      title: "Platformă cursuri pentru educatori",
      excerpt: "Lecții structurate și resurse PDF.",
      href: "/platforma-cursuri-educatori",
    },
    {
      title: "Platformă cursuri pentru traineri",
      excerpt: "Training online cu acces rapid.",
      href: "/platforma-cursuri-traineri",
    },
    {
      title: "Platformă cursuri pe domeniu propriu",
      excerpt: "Brandul tău, livrare rapidă.",
      href: "/platforma-cursuri-domeniu-propriu",
    },
    {
      title: "Platformă cursuri white label România",
      excerpt: "Identitate vizuală proprie.",
      href: "/platforma-cursuri-white-label-romania",
    },
    {
      title: "Platformă cursuri online ieftină",
      excerpt: "Începi cu buget mic și publici rapid.",
      href: "/platforma-cursuri-online-ieftina",
    },
    {
      title: "Hosting cursuri online România",
      excerpt: "Găzduire inclusă pentru cursuri.",
      href: "/hosting-cursuri-online-romania",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <section className="bg-gradient-to-b from-beige/60 to-background">
            <div className="container mx-auto px-4 py-16 lg:py-24">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Resurse & Ghiduri
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Resurse pentru creatori de cursuri online
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Ghiduri clare, comparații și pași practici pentru a lansa cursuri online rapide și simple.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-2">
              {resources.map((item) => (
                <Link key={item.title}
                  href={item.href}
                  className="group bg-background border border-border rounded-2xl p-6 shadow-card hover:shadow-medium transition-shadow"
                >
                  <h2 className="text-lg font-semibold text-navy mb-2 group-hover:text-gold transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
          <FinalCTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Resurse;
