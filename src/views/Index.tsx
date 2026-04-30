"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import ForWhoSection from "@/components/home/ForWhoSection";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingSection from "@/components/home/PricingSection";
import BlogSection from "@/components/home/BlogSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import FinalCTASection from "@/components/home/FinalCTASection";

const Index = () => {
  return (
    <>
      

        <meta 
          name="description" 
          content="Platformă cursuri online în România pentru creatori: simplă, rapidă, cu acces prin link și comunitate opțională." 
        />
        <meta name="keywords" content="platforma cursuri online, creare cursuri online, platforma cursuri online Romania, cursuri online" />
        <link rel="canonical" href="https://docourse.ro" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Pot crea un curs online fără experiență tehnică?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Da. DoCourse este gândită pentru începători, cu setup simplu și rapid.",
                },
              },
              {
                "@type": "Question",
                name: "Cursanții pot accesa fără cont?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Da. Poți trimite linkul direct cursantului, iar el intră imediat.",
                },
              },
              {
                "@type": "Question",
                name: "Pot activa comunitatea pentru cursuri?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Da. Comunitatea este opțională și se activează când vrei.",
                },
              },
              {
                "@type": "Question",
                name: "Cât durează să public un curs?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "După ce ai materialele, publicarea durează câteva minute.",
                },
              },
              {
                "@type": "Question",
                name: "Pot folosi domeniul meu?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Da. Cursurile pot fi livrate pe domeniul tău.",
                },
              },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "DoCourse",
                "url": "https://docourse.ro",
                "logo": "https://docourse.ro/favicon.ico"
              },
              {
                "@type": "WebSite",
                "name": "DoCourse",
                "url": "https://docourse.ro"
              },
              {
                "@type": "SoftwareApplication",
                "name": "DoCourse",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "url": "https://docourse.ro",
                "offers": {
                  "@type": "Offer",
                  "priceCurrency": "RON",
                  "price": "0",
                  "availability": "https://schema.org/InStock"
                }
              }
            ]
          })}
        </script>
      

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <ForWhoSection />
          <ProblemSection />
          <SolutionSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingSection />
          <BlogSection />
          <NewsletterSection />
          <FinalCTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
