"use client";
import Link from "next/link";
;
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

const MembershipDisabled = () => {
  return (
    <>
      

      

      <div className="min-h-screen bg-beige/30 flex flex-col">
        <header className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
                Membership-urile sunt momentan inactive
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                În DoCourse folosim acum cursuri + comunități. Poți crea un curs și o comunitate dedicată cursanților tăi.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/courses">
                  <Button size="lg" variant="hero" className="w-full sm:w-auto">
                    Vezi cursurile
                  </Button>
                </Link>
                <Link href="/my-communities">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Comunitățile mele
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MembershipDisabled;
