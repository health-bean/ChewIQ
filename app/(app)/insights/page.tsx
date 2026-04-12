'use client';

import { useState, useEffect, useCallback } from 'react';
import { DayView } from '@/components/insights/DayView';
import { AlertStack } from '@/components/insights/AlertStack';
import { PatternCard } from '@/components/insights/PatternCard';
import { ProgressCard } from '@/components/insights/ProgressCard';
import { Spinner, Card } from '@/components/ui';
import type { DayComposite, InsightsOutput, InsightAlert } from '@/lib/insights/types';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [composite, setComposite] = useState<DayComposite | null>(null);
  const [patterns, setPatterns] = useState<InsightsOutput | null>(null);
  const [alerts, setAlerts] = useState<InsightAlert[]>([]);
  const [showAllPatterns, setShowAllPatterns] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dayRes, alertsRes, patternsRes] = await Promise.all([
          fetch(`/api/insights/day?date=${today}`),
          fetch('/api/insights/alerts'),
          fetch('/api/insights/patterns?days=90'),
        ]);

        if (dayRes.ok) {
          const data = await dayRes.json();
          if (data) setComposite(data);
        }
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (patternsRes.ok) setPatterns(await patternsRes.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [today]);

  const handleDismissAlert = useCallback(async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await fetch(`/api/insights/alerts/${id}`, { method: 'PATCH' });
  }, []);

  const consistency = patterns?.dataStatus
    ? `${patterns.dataStatus.daysTracked} of last ${patterns.dataStatus.daysAnalyzed} days`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  const hasPatterns = patterns && (patterns.triggers.length > 0 || patterns.helpers.length > 0);
  const hasProgress = patterns && patterns.progress.length > 0;
  const topTriggers = patterns?.triggers.slice(0, showAllPatterns ? undefined : 5) ?? [];
  const topHelpers = patterns?.helpers.slice(0, showAllPatterns ? undefined : 3) ?? [];

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="py-4">
        <h1 className="font-display text-2xl text-warm-900">Insights</h1>
        {patterns?.dataStatus && (
          <p className="text-xs text-warm-400 mt-1">
            {patterns.dataStatus.daysTracked} days tracked · {patterns.dataStatus.singleFactors} patterns found
            {patterns.dataStatus.twoFactorPatterns > 0 && ` · ${patterns.dataStatus.twoFactorPatterns} multi-factor`}
          </p>
        )}
      </div>

      {/* Alerts — new discoveries */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <AlertStack alerts={alerts} onDismiss={handleDismissAlert} />
        </div>
      )}

      {/* Progress observations */}
      {hasProgress && (
        <div className="mb-4 space-y-2">
          <h2 className="text-sm font-medium text-warm-500 uppercase tracking-wide">How you're doing</h2>
          {patterns!.progress.map((o, i) => (
            <ProgressCard key={i} observation={o} />
          ))}
        </div>
      )}

      {/* Triggers — what's making you feel bad */}
      {topTriggers.length > 0 && (
        <div className="mb-4 space-y-2">
          <h2 className="text-sm font-medium text-warm-500 uppercase tracking-wide">What your data shows</h2>
          {topTriggers.map((r, i) => (
            <PatternCard key={`t-${i}`} result={r} />
          ))}
        </div>
      )}

      {/* Helpers — what's making you feel better */}
      {topHelpers.length > 0 && (
        <div className="mb-4 space-y-2">
          <h2 className="text-sm font-medium text-warm-500 uppercase tracking-wide">What seems to help</h2>
          {topHelpers.map((r, i) => (
            <PatternCard key={`h-${i}`} result={r} />
          ))}
        </div>
      )}

      {/* Show more / less toggle */}
      {hasPatterns && (patterns!.triggers.length > 5 || patterns!.helpers.length > 3) && (
        <button
          onClick={() => setShowAllPatterns(!showAllPatterns)}
          className="w-full py-2 text-sm text-teal-600 font-medium text-center mb-4"
        >
          {showAllPatterns ? 'Show less' : `Show all ${patterns!.triggers.length + patterns!.helpers.length} patterns`}
        </button>
      )}

      {/* Cold start — not enough data yet */}
      {!hasPatterns && !hasProgress && (
        <Card className="p-4 mb-4 text-center">
          <p className="text-sm text-warm-600">Patterns emerge with more data.</p>
          <p className="text-xs text-warm-400 mt-1">
            {patterns?.dataStatus.daysTracked ?? 0} days tracked — most patterns appear around 14 days.
          </p>
        </Card>
      )}

      {/* Day view — below patterns */}
      <div className="border-t border-warm-200 pt-4 mt-2">
        <h2 className="text-sm font-medium text-warm-500 uppercase tracking-wide mb-2">Your day</h2>
        <DayView
          initialDate={today}
          initialComposite={composite}
          alerts={[]}
          loggingConsistency={consistency}
          onDismissAlert={handleDismissAlert}
        />
      </div>
    </div>
  );
}
