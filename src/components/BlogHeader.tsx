import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const BlogHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 md:h-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-charcoal hover:text-navy font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Înapoi la site</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default BlogHeader;
