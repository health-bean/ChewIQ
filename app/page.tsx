"use client";

import Link from "next/link";
import {
  MessageSquare,
  LineChart,
  Shield,
  Leaf,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";

const features = [
  {
    icon: MessageSquare,
    title: "Conversational Tracking",
    description:
      "Just tell ChewIQ what you ate, how you feel, or what supplements you took. No forms, no friction.",
  },
  {
    icon: Shield,
    title: "Protocol Intelligence",
    description:
      "Built-in knowledge of AIP, GAPS, Low Histamine, and more. Never wonder if a food is compliant again.",
  },
  {
    icon: LineChart,
    title: "Correlation Insights",
    description:
      "AI identifies hidden patterns between what you eat, your environment, and how you feel.",
  },
  {
    icon: Leaf,
    title: "Designed for Healing",
    description:
      "Built for brain fog and fatigue — large touch targets, smart defaults, effortless daily tracking.",
  },
  {
    icon: Sparkles,
    title: "Personalized Coach",
    description:
      "Your AI protocol coach learns your triggers, celebrates your progress, and guides your journey.",
  },
  {
    icon: Users,
    title: "Practitioner Ready",
    description:
      "Share data with your functional medicine practitioner for data-driven treatment decisions.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-surface)]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-0.5">
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-teal-800">
            Chew
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold italic tracking-tight text-teal-500">
            IQ
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/60 via-transparent to-transparent" />

        <div className="relative animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-medium text-teal-700">
            <Leaf className="h-3.5 w-3.5" />
            Your intelligent protocol coach
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            Take control of your
            <br />
            <span className="text-teal-600">healing journey</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base text-[var(--color-text-secondary)] leading-relaxed">
            ChewIQ helps people with chronic illness navigate complex healing protocols
            with AI-powered tracking, personalized insights, and intelligent protocol guidance.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Start Free</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="border-t border-[var(--color-border-light)] bg-[var(--color-surface-card)] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-[family-name:var(--font-display)] text-center text-2xl font-bold text-[var(--color-text-primary)] mb-3">
            Built for chronic illness recovery
          </h2>
          <p className="text-center text-sm text-[var(--color-text-secondary)] mb-12 max-w-lg mx-auto">
            Not another calorie counter. ChewIQ understands healing protocols, tracks what matters,
            and reveals the patterns that unlock your path to wellness.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-text-primary)] mb-3">
          Ready to start healing smarter?
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Free to start. No credit card required.
        </p>
        <Link href="/signup">
          <Button size="lg">Get Started Free</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-light)] px-6 py-6 text-center text-xs text-[var(--color-text-muted)]">
        ChewIQ &mdash; Built for people healing through food.
      </footer>
    </div>
  );
}
