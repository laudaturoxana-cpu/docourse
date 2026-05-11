import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import BlogHeader from "@/components/BlogHeader";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

// Articole statice - nu necesită bază de date
const blogPosts = [
  {
    slug: "cum-sa-creezi-si-sa-vinzi-curs-online-ghid-complet",
    title: "Cum să creezi și să vinzi un curs online în 2025 – Ghid complet",
    excerpt: "Află pas cu pas cum să îți transformi expertiza într-un curs online profitabil. De la alegerea temei, la crearea conținutului și vânzarea efectivă – totul într-un singur ghid.",
    date: "23 februarie 2025",
    readTime: "12 min",
  },
  {
    slug: "platforma-simpla-cursuri-online",
    title: "Platformă simplă pentru cursuri online – Ghid pentru începători",
    excerpt: "Cum să îți publici primul curs online fără cunoștințe tehnice. Platformă intuitivă, fără setări complicate, gata de utilizare în câteva minute.",
    date: "23 februarie 2025",
    readTime: "8 min",
  },
  {
    slug: "alternativa-teachable-romania",
    title: "Alternativa Teachable pentru România – Comparație completă 2025",
    excerpt: "Compară DoCourse cu Teachable și descoperă de ce o platformă locală poate fi alegerea mai bună pentru creatorii de cursuri din România.",
    date: "23 februarie 2025",
    readTime: "10 min",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
        <BlogHeader />
        <main>
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-beige/60 to-background">
            <div className="container mx-auto px-4 py-16 lg:py-24 pt-24 lg:pt-32">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-wider text-gold font-semibold mb-3">
                  Blog
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Ghiduri pentru creatori de cursuri online
                </h1>
                <p className="text-lg text-muted-foreground">
                  Articole practice cu sfaturi, strategii și pași clari pentru a crea și vinde cursuri digitale.
                </p>
              </div>
            </div>
          </section>

          {/* Blog Posts Grid */}
          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-background border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-medium transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span>{post.readTime} citire</span>
                    </div>
                    <h2 className="text-xl font-semibold text-navy mb-2 group-hover:text-gold transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="text-sm text-gold font-semibold inline-flex items-center gap-2">
                      Citește articolul <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Link to Resources */}
          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-navy mb-3">
                Caută ghiduri specifice?
              </h2>
              <p className="text-muted-foreground mb-6">
                Explorează toate resursele noastre pentru creatori de cursuri online.
              </p>
              <Link
                href="/resurse"
                className="inline-flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-semibold hover:bg-gold/90 transition-colors"
              >
                Vezi toate resursele <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          <FinalCTASection />
        </main>
        <Footer />
      </div>
  );
};

export default Blog;
