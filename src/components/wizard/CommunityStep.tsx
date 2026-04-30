import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Users, Unlock, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CommunityData {
  name: string;
  accessType: "free";
  communityOption: "free" | "skip";
}

interface CommunityStepProps {
  data: CommunityData;
  courseTitle: string;
  onChange: (field: keyof CommunityData, value: string) => void;
}

const CommunityStep = ({ data, courseTitle, onChange }: CommunityStepProps) => {
  const showForm = data.communityOption === "free";

  // Set access type based on community option
  const handleOptionChange = (value: string) => {
    onChange('communityOption', value);
    if (value === "free") {
      onChange('accessType', "free");
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-sky/10 rounded-xl">
        <Users className="w-5 h-5 text-sky mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-navy mb-1">Ce este o comunitate?</p>
          <p className="text-muted-foreground">
            Un spațiu privat unde membrii pot posta, întreba, comenta, la fel ca într-un grup Facebook, 
            dar mult mai profesionist. Crește engagement-ul și ajută studenții să rămână activi.
          </p>
        </div>
      </div>

      {/* Choice Options */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-navy">
          Vrei să creezi o comunitate?
        </Label>
        
        <RadioGroup
          value={data.communityOption}
          onValueChange={handleOptionChange}
          className="space-y-3"
        >
          {/* Option 1: Free Community */}
          <div 
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.communityOption === "free" 
                ? "border-green-500 bg-green-50" 
                : "border-border hover:border-green-300"
            }`}
          >
            <RadioGroupItem value="free" id="free_community" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="free_community" className="cursor-pointer font-medium text-navy flex items-center gap-2">
                <Unlock className="w-4 h-4 text-green-600" />
                Comunitate pentru curs
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Creezi un spațiu dedicat cursului, unde cursanții pot discuta, pune întrebări și primi suport.
              </p>
            </div>
          </div>

          {/* Option 2: Skip */}
          <div 
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              data.communityOption === "skip" 
                ? "border-muted-foreground/50 bg-muted/20" 
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <RadioGroupItem value="skip" id="skip_community" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="skip_community" className="cursor-pointer font-medium text-navy flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground" />
                Fără comunitate
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Cursul va fi disponibil fără comunitate. Poți adăuga una oricând mai târziu.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Community Form - Show only if selected */}
      {showForm && (
        <div className="space-y-6 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="community-name">Nume comunitate</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Numele va fi vizibil pentru toți membrii. Ex: „Comunitatea {courseTitle}"</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="community-name"
              placeholder={`Ex: Comunitatea ${courseTitle}`}
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="h-12"
            />
          </div>

          {/* Access Type Summary */}
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-sm">
              <Unlock className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-700">Comunitate dedicată cursului</span>
              <span className="text-green-600">- acces pe bază de link, fără cont</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityStep;
