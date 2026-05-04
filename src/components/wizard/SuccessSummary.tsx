import { Check, Edit, Users, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SuccessSummaryProps {
  courseId: string;
  courseTitle: string;
  communityPlanId?: string;
  communityId?: string;
  communityName?: string;
  onClose: () => void;
}

const SuccessSummary = ({
  courseId,
  courseTitle,
  communityPlanId,
  communityId,
  communityName,
  onClose
}: SuccessSummaryProps) => {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-gold" />
      </div>
      
      <h2 className="text-2xl font-bold text-navy mb-3">
        🎉 Totul este gata!
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Ai creat cu succes toate componentele pentru platforma ta. Acum poți adăuga module și lecții la curs.
      </p>

      <div className="space-y-4 max-w-2xl mx-auto mb-8">
        {/* Course Card */}
        <div className="bg-background rounded-xl border border-border p-6 text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-navy mb-1">✅ Curs creat cu succes</h3>
              <p className="text-sm text-muted-foreground mb-3">{courseTitle}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/courses/${courseId}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editează curs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Community Card */}
        {communityId && communityPlanId && (
          <div className="bg-background rounded-xl border border-sky/30 p-6 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-sky" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy mb-1">✅ Curs adăugat în comunitate</h3>
                <p className="text-sm text-muted-foreground mb-3">{communityName || "Comunitatea ta"}</p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/community/${communityPlanId}`}>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Intră în comunitate
                    </Button>
                  </Link>
                  <Link href={`/dashboard/community/${communityPlanId}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Admin comunitate
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-beige/50 rounded-xl p-6 max-w-2xl mx-auto mb-8">
        <h3 className="font-semibold text-navy mb-3 flex items-center justify-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Următorii pași recomandați
        </h3>
        <ul className="text-sm text-muted-foreground text-left space-y-2 max-w-md mx-auto">
          <li className="flex items-start gap-2">
            <span className="text-gold font-bold">1.</span>
            <span>Adaugă module și lecții la curs (video, PDF-uri)</span>
          </li>
          {communityId && (
            <li className="flex items-start gap-2">
              <span className="text-gold font-bold">2.</span>
              <span>Creează prima postare în comunitate pentru a primi studenții</span>
            </li>
          )}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/dashboard/courses/${courseId}`}>
          <Button variant="hero" size="lg">
            <BookOpen className="w-4 h-4 mr-2" />
            Adaugă module și lecții
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="lg">
            Înapoi la Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessSummary;
