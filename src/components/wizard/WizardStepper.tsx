import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
}

const WizardStepper = ({ steps, currentStep }: WizardStepperProps) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 mb-2",
                    isCompleted && "bg-gold text-white",
                    isCurrent && "bg-gold/20 text-gold border-2 border-gold",
                    !isCompleted && !isCurrent && "bg-beige text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : step.id}
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-sm font-medium mb-1",
                    isCurrent && "text-gold",
                    !isCurrent && "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-border mx-4 -mt-12">
                  <div 
                    className={cn(
                      "h-full bg-gold transition-all duration-300",
                      isCompleted ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardStepper;
