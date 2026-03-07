"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Sparkles } from "lucide-react";

interface SampleDataStepProps {
  data: {
    protocolId?: string;
    goals: string[];
    loadSampleData: boolean;
  };
  onToggleSampleData: (load: boolean) => void;
  onBack: () => void;
}

export function SampleDataStep({ data, onToggleSampleData, onBack }: SampleDataStepProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolId: data.protocolId || null,
          loadSampleData: data.loadSampleData,
        }),
      });

      if (response.ok) {
        router.push("/chat");
      } else {
        alert("Failed to complete onboarding");
        setLoading(false);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Choose whether to start with sample data or a clean slate
      </p>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => onToggleSampleData(false)}
          className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
            !data.loadSampleData
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Start Fresh</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Begin with an empty timeline. Perfect if you want to track your own data from day one.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onToggleSampleData(true)}
          className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
            data.loadSampleData
              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Load Sample Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start with 30 days of example entries to explore features and see how insights work. You can delete this later.
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? "Setting up..." : "Complete Setup"}
        </button>
      </div>
    </div>
  );
}
