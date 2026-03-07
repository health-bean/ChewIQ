"use client";

import { ChevronRight } from "lucide-react";

const GOAL_OPTIONS = [
  "Identify food triggers",
  "Reduce inflammation",
  "Improve energy levels",
  "Better sleep quality",
  "Manage chronic pain",
  "Reduce brain fog",
  "Improve digestion",
  "Track symptom patterns",
];

interface GoalsStepProps {
  selectedGoals: string[];
  onUpdate: (goals: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GoalsStep({ selectedGoals, onUpdate, onNext, onBack }: GoalsStepProps) {
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      onUpdate(selectedGoals.filter((g) => g !== goal));
    } else {
      onUpdate([...selectedGoals, goal]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-2">What Are Your Goals?</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Select all that apply. This helps us personalize your experience.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {GOAL_OPTIONS.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedGoals.includes(goal)
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedGoals.includes(goal)
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {selectedGoals.includes(goal) && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <span className="font-medium">{goal}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
