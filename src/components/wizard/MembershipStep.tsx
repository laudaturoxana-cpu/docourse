import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Crown, Check, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MembershipData {
  title: string;
  priceMonthly: string;
  priceYearly: string;
  benefits: string;
  includeCommunity: boolean;
  membershipOption: "include_course" | "without_course" | "free_with_community" | "skip";
}

interface MembershipStepProps {
  data: MembershipData;
  courseTitle: string;
  onChange: (field: keyof MembershipData, value: string | boolean) => void;
}

const MembershipStep = ({ data, courseTitle, onChange }: MembershipStepProps) => {
  const showForm = data.membershipOption === "include_course" || data.membershipOption === "without_course" || data.membershipOption === "free_with_community";

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-gold/10 rounded-xl">
        <Crown className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-navy mb-1">Ce este un membership?</p>
          <p className="text-muted-foreground">
            Un abonament lunar sau anual prin care studenții au acces la cursurile tale și la comunitatea privată. 
            Modelul preferat de creatori în 2026 pentru venit recurent stabil.
          </p>
        </div>
      </div>

      {/* Choice Options */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-navy">
          Vrei să creezi un membership pentru acest curs?
        </Label>
        
        <RadioGroup
          value={data.membershipOption}
          onValueChange={(value) => onChange('membershipOption', value)}
          className="space-y-3"
        >
          {/* Option 1: Include course */}
          <div 
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.membershipOption === "include_course" 
                ? "border-gold bg-gold/5" 
                : "border-border hover:border-gold/50"
            }`}
          >
            <RadioGroupItem value="include_course" id="include_course" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="include_course" className="cursor-pointer font-medium text-navy flex items-center gap-2">
                <Check className="w-4 h-4 text-gold" />
                Da, și include cursul „{courseTitle}"
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Recomandat! Studenții care cumpără membership-ul vor avea acces automat la acest curs.
              </p>
            </div>
          </div>

          {/* Option 2: Without course */}
          <div 
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.membershipOption === "without_course" 
                ? "border-gold bg-gold/5" 
                : "border-border hover:border-gold/50"
            }`}
          >
            <RadioGroupItem value="without_course" id="without_course" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="without_course" className="cursor-pointer font-medium text-navy">
                Da, dar fără acest curs
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Creezi un membership separat. Cursul poate fi vândut individual sau adăugat ulterior.
              </p>
            </div>
          </div>

          {/* Option 3: Free membership with community */}
          <div 
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.membershipOption === "free_with_community" 
                ? "border-gold bg-gold/5" 
                : "border-border hover:border-gold/50"
            }`}
          >
            <RadioGroupItem value="free_with_community" id="free_with_community" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="free_with_community" className="cursor-pointer font-medium text-navy flex items-center gap-2">
                <Check className="w-4 h-4 text-gold" />
                Membership gratuit cu comunitate gratuită
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Perfect pentru a crește o audiență. Oferă cursul și comunitatea gratuit pentru engagement.
              </p>
            </div>
          </div>

          {/* Option 4: Skip */}
          <div 
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.membershipOption === "skip" 
                ? "border-muted-foreground/50 bg-muted/20" 
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <RadioGroupItem value="skip" id="skip_membership" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="skip_membership" className="cursor-pointer font-medium text-navy flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground" />
                Nu, nu vreau membership
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Cursul va fi vândut individual (tripwire sau gratuit). Poți adăuga comunitate gratuită în pasul următor.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Membership Form - Show only if selected */}
      {showForm && (
        <div className="space-y-6 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="membership-title">Numele membership-ului *</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Alege un nume atractiv: „Gold Plan", „Acces Premium", „{courseTitle} Academy"</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="membership-title"
              placeholder={`Ex: ${courseTitle} Premium`}
              value={data.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="price-monthly">Preț lunar</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Când să alegi membership plătit? Când vrei venit lunar recurent și o comunitate activă similară cu Skool.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="price-monthly"
                placeholder="Ex: 50 lei/lună sau gratuit"
                value={data.priceMonthly}
                onChange={(e) => onChange('priceMonthly', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="price-yearly">Preț anual (opțional)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Oferă un discount pentru plata anuală - ex: 2 luni gratuite.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="price-yearly"
                placeholder="Ex: 500 lei/an"
                value={data.priceYearly}
                onChange={(e) => onChange('priceYearly', e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="benefits">Beneficii incluse</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Listează ce primește studentul: cursuri, comunitate, sesiuni live, materiale bonus etc.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="benefits"
              placeholder="Acces la toate cursurile&#10;Comunitate privată exclusivă&#10;Sesiuni live Q&A lunare&#10;Materiale bonus și template-uri&#10;Suport prioritar"
              value={data.benefits}
              onChange={(e) => onChange('benefits', e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Un beneficiu pe linie. Aceste beneficii vor fi afișate pe pagina de vânzare.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipStep;