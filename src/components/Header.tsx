"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import PlanSelectionDialog from "./home/PlanSelectionDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#pentru-cine"
              className="text-charcoal hover:text-navy font-medium transition-colors"
            >
              Pentru cine
            </Link>
            <Link
              href="/#cum-functioneaza"
              className="text-charcoal hover:text-navy font-medium transition-colors"
            >
              Cum funcționează
            </Link>
            <Link
              href="/#pret"
              className="text-charcoal hover:text-navy font-medium transition-colors"
            >
              Preț
            </Link>
            <Link
              href="/blog"
              className="text-charcoal hover:text-navy font-medium transition-colors"
            >
              Blog
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Autentificare
              </Button>
            </Link>
            <Button 
              variant="gold" 
              size="sm"
              onClick={() => setShowPlanDialog(true)}
            >
              7 zile gratuit
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-charcoal"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link
                href="/#pentru-cine"
                onClick={() => setIsMenuOpen(false)}
                className="text-charcoal hover:text-navy font-medium py-2"
              >
                Pentru cine
              </Link>
              <Link
                href="/#cum-functioneaza"
                onClick={() => setIsMenuOpen(false)}
                className="text-charcoal hover:text-navy font-medium py-2"
              >
                Cum funcționează
              </Link>
              <Link
                href="/#pret"
                onClick={() => setIsMenuOpen(false)}
                className="text-charcoal hover:text-navy font-medium py-2"
              >
                Preț
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="text-charcoal hover:text-navy font-medium py-2"
              >
                Blog
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Autentificare
                  </Button>
                </Link>
                <Button 
                  variant="gold" 
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowPlanDialog(true);
                  }}
                >
                  7 zile gratuit
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      <PlanSelectionDialog 
        open={showPlanDialog} 
        onOpenChange={setShowPlanDialog} 
      />
    </header>
  );
};

export default Header;