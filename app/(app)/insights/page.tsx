'use client';

import { useState, useEffect, useCallback } from 'react';
import { DayView } from '@/components/insights/DayView';
import { AlertStack } from '@/components/insights/AlertStack';
import { PatternCard } from '@/components/insights/PatternCard';
import { PropertyPatternCard } from '@/components/insights/PropertyPatternCard';
import { ProgressCard } from '@/components/insights/ProgressCard';
import { Spinner, Card } from '@/components/ui';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import type { DayComposite, InsightsOutput, InsightAlert, MultiFactorResult } from '@/lib/insights/types';

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [composite, setComposite] = useState<DayComposite | null>(null);
  const [patterns, setPatterns] = useState<InsightsOutput | null>(null);
  const [alerts, setAlerts] = useState<InsightAlert[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  // Curate the data — show the best, not everything
  const multiFactorTriggers = (patterns?.triggers ?? [])
    .filter(r => 'factors' in r && (r as MultiFactorResult).factorCount >= 2)
    .slice(0, 5);

  const singleTriggers = (patterns?.triggers ?? [])
    .filter(r => !('factors' in r) || (r as MultiFactorResult).factorCount < 2);
  const topTriggers = singleTriggers.slice(0, expandedSection === 'triggers' ? 10 : 4);

  const helpers = patterns?.helpers ?? [];
  const topHelpers = helpers.slice(0, expandedSection === 'helpers' ? 10 : 3);

  const propertyPatterns = (patterns?.propertyPatterns ?? []).slice(0, 5);
  const progress = patterns?.progress ?? [];

  const hasAnyInsights = multiFactorTriggers.length > 0 || singleTriggers.length > 0 || helpers.length > 0 || propertyPatterns.length > 0;
  const daysTracked = patterns?.dataStatus?.daysTracked ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24">
      {/* Header */}
      <div className="py-5">
        <h1 className="font-display text-2xl text-warm-900">Insights</h1>
        {daysTracked > 0 && (
          <p className="text-xs text-warm-400 mt-1">
            {daysTracked} days analyzed
            {(patterns?.dataStatus?.twoFactorPatterns ?? 0) > 0 &&
              ` · ${patterns!.dataStatus.twoFactorPatterns} compound patterns`}
          </p>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-5">
          <AlertStack alerts={alerts} onDismiss={handleDismissAlert} />
        </div>
      )}

      {/* Cold start */}
      {!hasAnyInsights && (
        <Card className="p-5 mb-5 text-center">
          <p className="text-sm text-warm-600 font-medium">Patterns emerge with more data.</p>
          <p className="text-xs text-warm-400 mt-1">
            {daysTracked} days tracked — patterns typically appear around 14 days.
          </p>
          <div className="mt-3 h-1.5 w-full max-w-[200px] mx-auto rounded-full bg-warm-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-400 transition-all"
              style={{ width: `${Math.min((daysTracked / 14) * 100, 100)}%` }}
            />
          </div>
        </Card>
      )}

      {hasAnyInsights && (
        <div className="space-y-8">

          {/* Progress — how you're doing */}
          {progress.length > 0 && (
            <section>
              <SectionHeader title="How You're Doing" />
              <div className="space-y-2">
                {progress.map((o, i) => (
                  <ProgressCard key={i} observation={o} />
                ))}
              </div>
            </section>
          )}

          {/* Compound Patterns — the cutting edge */}
          {multiFactorTriggers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-100">
                  <Zap className="h-3 w-3 text-teal-600" />
                </div>
                <SectionHeader title="Compound Patterns" />
              </div>
              <p className="text-xs text-warm-400 mb-3">
                Combinations that matter more together than individually
              </p>
              <div className="space-y-2">
                {multiFactorTriggers.map((r, i) => (
                  <PatternCard key={i} result={r} variant="multi-factor" />
                ))}
              </div>
            </section>
          )}

          {/* Sensitivities — broad categories */}
          {propertyPatterns.length > 0 && (
            <section>
              <SectionHeader title="Sensitivities" />
              <div className="space-y-2">
                {propertyPatterns.map((p, i) => (
                  <PropertyPatternCard key={i} pattern={p} />
                ))}
              </div>
            </section>
          )}

          {/* Triggers */}
          {singleTriggers.length > 0 && (
            <section>
              <SectionHeader title="Triggers" count={singleTriggers.length} />
              <div className="space-y-2">
                {topTriggers.map((r, i) => (
                  <PatternCard key={i} result={r} variant="trigger" />
                ))}
              </div>
              {singleTriggers.length > 4 && (
                <ExpandButton
                  expanded={expandedSection === 'triggers'}
                  total={singleTriggers.length}
                  shown={topTriggers.length}
                  onClick={() => toggleSection('triggers')}
                />
              )}
            </section>
          )}

          {/* What Helps */}
          {helpers.length > 0 && (
            <section>
              <SectionHeader title="What Helps" count={helpers.length} />
              <div className="space-y-2">
                {topHelpers.map((r, i) => (
                  <PatternCard key={i} result={r} variant="helper" />
                ))}
              </div>
              {helpers.length > 3 && (
                <ExpandButton
                  expanded={expandedSection === 'helpers'}
                  total={helpers.length}
                  shown={topHelpers.length}
                  onClick={() => toggleSection('helpers')}
                />
              )}
            </section>
          )}
        </div>
      )}

      {/* Your Day */}
      <div className="mt-8 pt-6 border-t border-warm-200">
        <SectionHeader title="Your Day" />
        <DayView initialDate={today} initialComposite={composite} />
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-400 mb-3">
      {title}{count !== undefined && count > 0 ? ` (${count})` : ''}
    </h2>
  );
}

function ExpandButton({ expanded, total, shown, onClick }: { expanded: boolean; total: number; shown: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1 w-full py-2 mt-2 text-xs text-teal-600 font-medium hover:text-teal-700 transition-colors"
    >
      {expanded ? (
        <>Show less <ChevronUp className="w-3 h-3" /></>
      ) : (
        <>Show {total - shown} more <ChevronDown className="w-3 h-3" /></>
      )}
    </button>
  );
}
