"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Button } from "../ui/button";
import PlanSelectionDialog from "./PlanSelectionDialog";
import { useSearchParams, useRouter } from "next/navigation";

const HeroClientControls = () => {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const shouldOpen = searchParams?.get("select-plan") === "1";
    if (shouldOpen) {
      setShowPlanDialog(true);
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-200 px-4 sm:px-0">
        <Button
          variant="hero"
          size="xl"
          className="group w-full sm:w-auto flex-col py-4 h-auto"
          onClick={() => setShowPlanDialog(true)}
        >
          <span className="text-base sm:text-lg">Începe 7 zile gratuit</span>
          <span className="text-xs sm:text-sm opacity-80 font-normal">apoi 9€/lună sau 90€/an</span>
        </Button>
        <Button
          variant="hero-secondary"
          size="xl"
          className="group w-full sm:w-auto"
          asChild
        >
          <a href="#cum-functioneaza">
            <Play className="mr-2 w-5 h-5" />
            Vezi cum funcționează
          </a>
        </Button>
      </div>
      <PlanSelectionDialog open={showPlanDialog} onOpenChange={setShowPlanDialog} />
    </>
  );
};

export default HeroClientControls;
