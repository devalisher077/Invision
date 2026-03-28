import React from "react";
import { Check } from "lucide-react";

interface Step {
  label: string;
  status: "completed" | "active" | "pending";
}

interface ProgressStepsProps {
  steps: Step[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps }) => {
  return (
    <div className="space-y-1">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all ${
                step.status === "completed"
                  ? "progress-step-completed"
                  : step.status === "active"
                  ? "progress-step-active"
                  : "progress-step-pending"
              }`}
            >
              {step.status === "completed" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-4 ${
                  step.status === "completed" ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
          <span
            className={`text-sm pt-1 ${
              step.status === "active"
                ? "font-semibold text-foreground"
                : step.status === "completed"
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
