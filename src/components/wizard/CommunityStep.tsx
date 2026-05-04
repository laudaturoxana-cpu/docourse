"use client";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users, Link2, Clock, Lightbulb, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "@/hooks/useAuth";

interface ExistingCommunity {
  membershipPlanId: string;
  communityId: string;
  communityName: string;
}

interface CommunityStepProps {
  communityOption: "link" | "skip";
  selectedMembershipPlanId: string | null;
  selectedCommunityId: string | null;
  onOptionChange: (option: "link" | "skip") => void;
  onSelectCommunity: (membershipPlanId: string, communityId: string, communityName: string) => void;
}

const CommunityStep = ({
  communityOption,
  selectedMembershipPlanId,
  selectedCommunityId,
  onOptionChange,
  onSelectCommunity,
}: CommunityStepProps) => {
  const { profile } = useAuth();
  const [communities, setCommunities] = useState<ExistingCommunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!profile?.id) return;
      setIsLoading(true);

      const { data } = await supabase
        .from("membership_plans")
        .select("id, title, community_groups(id, name)")
        .eq("creator_id", profile.id);

      const result: ExistingCommunity[] = [];
      for (const plan of data || []) {
        const raw = (plan as unknown as { id: string; title: string; community_groups: { id: string; name: string } | { id: string; name: string }[] | null }).community_groups;
        const groups: { id: string; name: string }[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
        for (const group of groups) {
          result.push({
            membershipPlanId: plan.id,
            communityId: group.id,
            communityName: group.name,
          });
        }
      }

      setCommunities(result);
      setIsLoading(false);
    };

    fetchCommunities();
  }, [profile?.id]);

  return (
    <div className="space-y-6">
      {/* Sfat */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 mb-1">Sfat util</p>
          <p className="text-amber-700">
            Dacă cursul nu are încă lecții sau module adăugate, e mai bine să îl legi de comunitate
            mai târziu, după ce ai adăugat conținut — cursanții au astfel ceva de explorat din prima zi.
            Dacă este un curs mic și poți adăuga modulele acum, poți bifa opțiunea de mai jos.
          </p>
        </div>
      </div>

      {/* Alegere */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-navy">
          Vrei să legi cursul de comunitatea ta?
        </Label>

        <RadioGroup
          value={communityOption}
          onValueChange={(v) => onOptionChange(v as "link" | "skip")}
          className="space-y-3"
        >
          {/* Opțiunea: Da */}
          <div
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              communityOption === "link"
                ? "border-sky bg-sky/5"
                : "border-border hover:border-sky/40"
            }`}
            onClick={() => onOptionChange("link")}
          >
            <RadioGroupItem value="link" id="opt_link" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="opt_link" className="cursor-pointer font-medium text-navy flex items-center gap-2">
                <Link2 className="w-4 h-4 text-sky" />
                Da, leagă cursul de o comunitate acum
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Cursanții care cumpără cursul vor primi automat acces în comunitate.
              </p>
            </div>
          </div>

          {/* Opțiunea: Mai târziu */}
          <div
            className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              communityOption === "skip"
                ? "border-muted-foreground/50 bg-muted/20"
                : "border-border hover:border-muted-foreground/30"
            }`}
            onClick={() => onOptionChange("skip")}
          >
            <RadioGroupItem value="skip" id="opt_skip" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="opt_skip" className="cursor-pointer font-medium text-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Nu acum, adaug mai târziu
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Poți lega cursul de o comunitate oricând din setările cursului.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Lista de comunități existente */}
      {communityOption === "link" && (
        <div className="space-y-3 pt-2 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
          <Label className="text-sm font-semibold text-navy">Selectează comunitatea:</Label>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <div className="w-4 h-4 border-2 border-sky border-t-transparent rounded-full animate-spin" />
              Se încarcă comunitățile...
            </div>
          )}

          {!isLoading && communities.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-charcoal mb-1">Nu ai nicio comunitate creată încă</p>
                <p className="text-muted-foreground">
                  Creează o comunitate din Dashboard → Comunități, apoi revino să legi cursul.
                </p>
              </div>
            </div>
          )}

          {!isLoading && communities.length > 0 && (
            <div className="space-y-2">
              {communities.map((c) => {
                const isSelected = selectedCommunityId === c.communityId;
                return (
                  <div
                    key={c.communityId}
                    onClick={() => onSelectCommunity(c.membershipPlanId, c.communityId, c.communityName)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-sky bg-sky/5"
                        : "border-border hover:border-sky/40"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-sky/20" : "bg-muted"
                    }`}>
                      <Users className={`w-5 h-5 ${isSelected ? "text-sky" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${isSelected ? "text-navy" : "text-charcoal"}`}>
                        {c.communityName}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-sky flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityStep;
