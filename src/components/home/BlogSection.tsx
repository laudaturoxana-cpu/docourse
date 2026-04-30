import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Articole statice - nu necesită bază de date
const blogPosts = [
  {
    id: "1",
    title: "Cum să creezi și să vinzi un curs online – Ghid complet",
    excerpt: "Ghid pas cu pas pentru a-ți transforma expertiza într-un curs online profitabil.",
    slug: "cum-sa-creezi-si-sa-vinzi-curs-online-ghid-complet",
  },
  {
    id: "2",
    title: "Platformă simplă pentru cursuri online",
    excerpt: "Pentru începători: publicare rapidă, fără setări complicate.",
    slug: "platforma-simpla-cursuri-online",
  },
  {
    id: "3",
    title: "Alternativa Teachable pentru România",
    excerpt: "Compară opțiunile și vezi de ce DoCourse e mai potrivită.",
    slug: "alternativa-teachable-romania",
  },
];

const BlogSection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Blog & Ghiduri</p>
          <h2 className="text-2xl font-bold text-navy">Resurse pentru creatori</h2>
        </div>
        <Link href="/blog" className="hidden sm:inline-flex">
          <Button variant="outline" size="sm">
            Vezi blogul
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-background border border-border rounded-2xl p-6 shadow-card hover:shadow-medium transition-shadow"
          >
            <h3 className="text-lg font-semibold text-navy mb-2 group-hover:text-gold transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
            <div className="text-sm text-gold font-semibold inline-flex items-center gap-2">
              Citește articolul <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 sm:hidden">
        <Link href="/blog">
          <Button variant="outline" size="sm">
            Vezi blogul
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default BlogSection;
