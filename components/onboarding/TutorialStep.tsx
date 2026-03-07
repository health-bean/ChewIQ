"use client";

import { MessageSquare, Calendar, TrendingUp, ChevronRight } from "lucide-react";

interface TutorialStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function TutorialStep({ onNext, onBack }: TutorialStepProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-2">How FILO Works</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Three simple ways to track your health journey
      </p>

      <div className="space-y-6 mb-8">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Chat</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Talk naturally: &quot;I had salmon and broccoli for lunch&quot; or &quot;Feeling a headache, severity 6&quot;
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Timeline</h3>
            <p className="text-gray-600 dark:text-gray-400">
              View your daily entries in chronological order. See what you ate, how you felt, and when.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Insights</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover patterns and correlations. See which foods trigger symptoms and what helps you feel better.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Pro tip:</strong> The more you track, the better insights you get. Aim for at least 2 weeks of consistent logging.
        </p>
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
