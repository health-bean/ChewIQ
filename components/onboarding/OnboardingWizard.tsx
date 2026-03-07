"use client";

import { useState } from "react";
import { WelcomeStep } from "./WelcomeStep";
import { ProtocolStep } from "./ProtocolStep";
import { GoalsStep } from "./GoalsStep";
import { TutorialStep } from "./TutorialStep";
import { SampleDataStep } from "./SampleDataStep";

type Step = "welcome" | "protocol" | "goals" | "tutorial" | "sample-data";

interface OnboardingData {
  protocolId?: string;
  goals: string[];
  loadSampleData: boolean;
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    loadSampleData: false,
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    const steps: Step[] = ["welcome", "protocol", "goals", "tutorial", "sample-data"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["welcome", "protocol", "goals", "tutorial", "sample-data"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {currentStep === "welcome" && (
        <WelcomeStep onNext={nextStep} />
      )}
      {currentStep === "protocol" && (
        <ProtocolStep
          selectedProtocolId={data.protocolId}
          onSelect={(protocolId) => updateData({ protocolId })}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === "goals" && (
        <GoalsStep
          selectedGoals={data.goals}
          onUpdate={(goals) => updateData({ goals })}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {currentStep === "tutorial" && (
        <TutorialStep onNext={nextStep} onBack={prevStep} />
      )}
      {currentStep === "sample-data" && (
        <SampleDataStep
          data={data}
          onToggleSampleData={(loadSampleData) => updateData({ loadSampleData })}
          onBack={prevStep}
        />
      )}
    </div>
  );
}
