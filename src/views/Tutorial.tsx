"use client";
import Navbar from '../components/funnel/Navbar';
import Footer from '../components/funnel/Footer';
import FormInscriere from '../components/funnel/FormInscriere';
import Divider from '../components/funnel/Divider';

export default function Tutorial() {
  return (
    <div className="font-sans">
      <Navbar />

      {/* HERO */}
      <section className="bg-[#F3EDE1] py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h1
            className="text-[#1B2A4A] text-4xl md:text-5xl leading-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Uită-te cum am construit un site profesional cu AI în câteva ore — live, cu o clientă reală.
          </h1>
          <p className="text-[#3D4F6B] text-lg mb-2">2 minute. Prompt real. Rezultat final.</p>
          <p className="text-[#B8965A] font-medium mb-8">Gratuit. Acces instant.</p>
          <FormInscriere
            redirectTo="/multumesc-tutorial"
            ctaText="VREAU SĂ VĂD DEMO-UL GRATUIT"
            placeholder="Adresa ta de email"
          />
          <p className="text-xs text-[#3D4F6B] mt-3 text-center">
            Primești linkul de acces imediat pe email. Intri în comunitate și vezi demo-ul live.
          </p>
        </div>

        <Divider className="my-12" />
      </section>

      {/* CE VEDE */}
      <section className="bg-white py-16 px-4">
        <h2
          className="text-center text-[#1B2A4A] text-2xl mb-8"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          În 2 minute vei vedea:
        </h2>
        <div className="max-w-sm mx-auto space-y-4">
          {[
            'Promptul exact pe care l-am folosit',
            'Cum gândește AI-ul în timp real',
            'Site-ul final al Smarandei — live',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#B8965A] text-white text-xs flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-[#3D4F6B] text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
