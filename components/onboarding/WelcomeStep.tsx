"use client";

import { Sparkles } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Welcome to ChewIQ</h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Your personal health tracking companion for understanding how food, lifestyle, and symptoms connect.
      </p>
      
      <div className="space-y-4 text-left mb-8">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Track Everything</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Log food, symptoms, supplements, exercise, and more through natural conversation
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Discover Patterns</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered insights reveal correlations between your choices and how you feel
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Follow Protocols</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get guidance on elimination diets like AIP, Low Histamine, and more
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}
