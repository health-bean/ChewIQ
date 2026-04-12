'use client';

import { useState, useEffect, useCallback } from 'react';
import { DayView } from '@/components/insights/DayView';
import { AlertStack } from '@/components/insights/AlertStack';
import { PatternCard } from '@/components/insights/PatternCard';
import { PropertyPatternCard } from '@/components/insights/PropertyPatternCard';
import { ProgressCard } from '@/components/insights/ProgressCard';
import { Spinner, Card } from '@/components/ui';
import { Zap } from 'lucide-react';
import type { DayComposite, InsightsOutput, InsightAlert, MultiFactorResult, SingleFactorResult } from '@/lib/insights/types';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [composite, setComposite] = useState<DayComposite | null>(null);
  const [patterns, setPatterns] = useState<InsightsOutput | null>(null);
  const [alerts, setAlerts] = useState<InsightAlert[]>([]);
  const [expandTriggers, setExpandTriggers] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  // Separate multi-factor from single-factor triggers
  const multiFactorTriggers = (patterns?.triggers ?? []).filter(
    r => 'factors' in r && (r as MultiFactorResult).factorCount >= 2
  );
  const singleTriggers = (patterns?.triggers ?? []).filter(
    r => !('factors' in r) || (r as MultiFactorResult).factorCount < 2
  );
  const helpers = patterns?.helpers ?? [];
  const propertyPatterns = patterns?.propertyPatterns ?? [];
  const progress = patterns?.progress ?? [];
  const hasAnyInsights = multiFactorTriggers.length > 0 || singleTriggers.length > 0 || helpers.length > 0 || propertyPatterns.length > 0;

  const visibleSingleTriggers = expandTriggers ? singleTriggers : singleTriggers.slice(0, 4);
  const hasMoreTriggers = singleTriggers.length > 4;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24">
      {/* Header */}
      <div className="py-5">
        <h1 className="font-display text-2xl text-warm-900">Insights</h1>
        {patterns?.dataStatus && (
          <p className="text-xs text-warm-400 mt-1">
            Analyzing {patterns.dataStatus.daysTracked} days of data
            {patterns.dataStatus.twoFactorPatterns > 0 &&
              ` · ${patterns.dataStatus.twoFactorPatterns} compound pattern${patterns.dataStatus.twoFactorPatterns !== 1 ? 's' : ''} detected`}
          </p>
        )}
      </div>

      {/* Alerts — new discoveries */}
      {alerts.length > 0 && (
        <div className="mb-5">
          <AlertStack alerts={alerts} onDismiss={handleDismissAlert} />
        </div>
      )}

      {!hasAnyInsights && (
        <Card className="p-5 mb-5 text-center">
          <p className="text-sm text-warm-600 font-medium">Patterns emerge with more data.</p>
          <p className="text-xs text-warm-400 mt-1">
            {patterns?.dataStatus.daysTracked ?? 0} days tracked — most patterns appear around 14 days of consistent logging.
          </p>
          <div className="mt-3 h-1.5 w-full max-w-[200px] mx-auto rounded-full bg-warm-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-400 transition-all"
              style={{ width: `${Math.min(((patterns?.dataStatus.daysTracked ?? 0) / 14) * 100, 100)}%` }}
            />
          </div>
        </Card>
      )}

      {hasAnyInsights && (
        <div className="space-y-6">
          {/* Multi-factor patterns — the "cutting edge" */}
          {multiFactorTriggers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-100">
                  <Zap className="h-3 w-3 text-teal-600" />
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-500">
                  Compound Patterns
                </h2>
              </div>
              <p className="text-xs text-warm-400 mb-3 -mt-1">
                Multi-variable correlations — combinations that matter more together than alone.
              </p>
              <div className="space-y-2">
                {multiFactorTriggers.map((r, i) => (
                  <PatternCard key={`mf-${i}`} result={r} variant="multi-factor" />
                ))}
              </div>
            </section>
          )}

          {/* Property Patterns — broad categories */}
          {propertyPatterns.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-500 mb-3">
                Sensitivities
              </h2>
              <div className="space-y-2">
                {propertyPatterns.map((p, i) => (
                  <PropertyPatternCard key={`pp-${i}`} pattern={p} />
                ))}
              </div>
            </section>
          )}

          {/* Individual Triggers */}
          {singleTriggers.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-500 mb-3">
                Triggers
              </h2>
              <div className="space-y-2">
                {visibleSingleTriggers.map((r, i) => (
                  <PatternCard key={`t-${i}`} result={r} variant="trigger" />
                ))}
              </div>
              {hasMoreTriggers && (
                <button
                  onClick={() => setExpandTriggers(!expandTriggers)}
                  className="w-full py-2 mt-2 text-xs text-teal-600 font-medium text-center hover:text-teal-700"
                >
                  {expandTriggers ? 'Show less' : `Show all ${singleTriggers.length} triggers`}
                </button>
              )}
            </section>
          )}

          {/* What Helps */}
          {helpers.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-500 mb-3">
                What Helps
              </h2>
              <div className="space-y-2">
                {helpers.map((r, i) => (
                  <PatternCard key={`h-${i}`} result={r} variant="helper" />
                ))}
              </div>
            </section>
          )}

          {/* Progress */}
          {progress.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-500 mb-3">
                Progress
              </h2>
              <div className="space-y-2">
                {progress.map((o, i) => (
                  <ProgressCard key={`p-${i}`} observation={o} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Your Day — full-width, no tiny box */}
      <div className="mt-8 pt-6 border-t border-warm-200">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-warm-500 mb-2">
          Your Day
        </h2>
        <DayView
          initialDate={today}
          initialComposite={composite}
        />
      </div>
    </div>
  );
}
