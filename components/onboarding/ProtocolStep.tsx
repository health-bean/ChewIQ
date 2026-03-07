"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface Protocol {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ProtocolStepProps {
  selectedProtocolId?: string;
  onSelect: (protocolId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProtocolStep({ selectedProtocolId, onSelect, onNext, onBack }: ProtocolStepProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/protocols")
      .then((res) => res.json())
      .then((data) => {
        setProtocols(data.protocols || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    if (selectedProtocolId) {
      onNext();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-2">Choose Your Protocol</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Select an elimination diet protocol to get started. You can change this later.
      </p>

      {loading ? (
        <div className="text-center py-8">Loading protocols...</div>
      ) : (
        <div className="space-y-3 mb-8">
          <button
            onClick={() => onSelect("")}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedProtocolId === ""
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold">No Protocol</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Track freely without protocol restrictions
            </div>
          </button>

          {protocols.map((protocol) => (
            <button
              key={protocol.id}
              onClick={() => onSelect(protocol.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedProtocolId === protocol.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold">{protocol.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {protocol.description}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedProtocolId === undefined}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
