"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Share2, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

interface CertificateData {
  id: string;
  certificate_number: string;
  issued_at: string;
  user_name: string;
  course_title: string;
  creator_name: string;
}

const Certificate = () => {
  const _params = useParams<{ certificateId: string }>();
  const certificateId = _params?.certificateId;
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) {
        setError("ID certificat lipsă");
        setLoading(false);
        return;
      }

      try {
        // Fetch certificate with related data
        const { data: cert, error: certError } = await supabase
          .from("certificates")
          .select("id, certificate_number, issued_at, user_id, course_id")
          .eq("id", certificateId)
          .single();

        if (certError || !cert) {
          setError("Certificatul nu a fost găsit");
          setLoading(false);
          return;
        }

        // Get course details
        const { data: course } = await supabase
          .from("courses")
          .select("title, creator_id")
          .eq("id", cert.course_id)
          .single();

        // Get user profile
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", cert.user_id)
          .single();

        // Get creator profile
        let creatorName = "DoCourse";
        if (course?.creator_id) {
          const { data: creatorProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", course.creator_id)
            .single();
          creatorName = creatorProfile?.full_name || "DoCourse";
        }

        setCertificate({
          id: cert.id,
          certificate_number: cert.certificate_number,
          issued_at: cert.issued_at ?? new Date().toISOString(),
          user_name: userProfile?.full_name || "Absolvent",
          course_title: course?.title || "Curs",
          creator_name: creatorName,
        });
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setError("Eroare la încărcarea certificatului");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificat - ${certificate?.course_title}`,
          text: `Am obținut certificatul pentru cursul "${certificate?.course_title}" pe DoCourse!`,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiat în clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy/5 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy/5 to-white">
        <div className="text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold text-navy mb-2">Certificat negăsit</h1>
          <p className="text-muted-foreground">{error || "Acest certificat nu există sau a fost șters."}</p>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(certificate.issued_at).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      


      

      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .certificate-container {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-navy/5 to-white py-8 px-4">
        {/* Action buttons - hidden when printing */}
        <div className="no-print max-w-4xl mx-auto mb-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Distribuie
          </Button>
          <Button onClick={handlePrint}>
            <Download className="w-4 h-4 mr-2" />
            Descarcă / Printează
          </Button>
        </div>

        {/* Certificate */}
        <div className="certificate-container max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Gold border frame */}
          <div className="border-8 border-gold/30 m-4 rounded-lg">
            <div className="border-4 border-gold/50 m-2 rounded-lg p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="w-12 h-12 text-gold" />
                  <h1 className="text-3xl md:text-4xl font-bold text-navy">DoCourse</h1>
                </div>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
              </div>

              {/* Certificate Title */}
              <div className="text-center mb-10">
                <p className="text-lg text-gray-500 uppercase tracking-widest mb-2">
                  Certificat de Absolvire
                </p>
                <h2 className="text-2xl md:text-3xl font-serif text-navy">
                  Se acordă prezentul certificat lui/ei
                </h2>
              </div>

              {/* Recipient Name */}
              <div className="text-center mb-10">
                <p className="text-4xl md:text-5xl font-serif font-bold text-navy border-b-2 border-gold/50 pb-4 mx-auto max-w-md">
                  {certificate.user_name}
                </p>
              </div>

              {/* Course Info */}
              <div className="text-center mb-10">
                <p className="text-lg text-gray-600 mb-4">
                  pentru finalizarea cu succes a cursului
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gold mb-2">
                  "{certificate.course_title}"
                </p>
                <p className="text-gray-500">
                  susținut de {certificate.creator_name}
                </p>
              </div>

              {/* Date and Certificate Number */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <p className="text-sm text-gray-500">Data emiterii</p>
                  <p className="text-lg font-semibold text-navy">{issuedDate}</p>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                    <Award className="w-20 h-20 text-gold/80" />
                  </div>
                  <p className="text-xs text-gray-400">Sigiliu digital</p>
                </div>

                <div className="text-center md:text-right mt-4 md:mt-0">
                  <p className="text-sm text-gray-500">Nr. Certificat</p>
                  <p className="text-lg font-mono font-semibold text-navy">
                    {certificate.certificate_number}
                  </p>
                </div>
              </div>

              {/* Verification note */}
              <div className="text-center mt-8 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Acest certificat poate fi verificat la: docourse.ro/certificate/{certificate.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - hidden when printing */}
        <div className="no-print max-w-4xl mx-auto mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 Sfat: Adaugă acest certificat pe profilul tău de LinkedIn pentru a-ți evidenția abilitățile!
          </p>
        </div>
      </div>
    </>
  );
};

export default Certificate;
