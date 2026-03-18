export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <div className="mx-auto max-w-lg px-4 py-8">
        {children}
      </div>
    </div>
  );
}
