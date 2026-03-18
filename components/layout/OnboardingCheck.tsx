"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Skip check for onboarding page itself
    if (pathname === "/onboarding") {
      setIsChecking(false);
      setIsOnboarded(true);
      return;
    }

    // Check onboarding status
    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => {
        if (!data.completed) {
          router.push("/onboarding");
        } else {
          setIsOnboarded(true);
        }
      })
      .catch(() => {
        // On error, allow access (fail open)
        setIsOnboarded(true);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-center">
          <Spinner />
          <p className="text-sm text-[var(--color-text-muted)] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return null;
  }

  return <>{children}</>;
}
