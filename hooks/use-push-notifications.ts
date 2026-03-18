"use client";

import { useEffect, useState, useCallback } from "react";
import { isNative } from "@/lib/capacitor/platform";

/**
 * Hook for managing push notification registration on native platforms.
 * On web, this is a no-op. On iOS/Android, it requests permission,
 * registers for push notifications, and stores the device token server-side.
 */
export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async () => {
    if (!isNative) return;

    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      // Check/request permission
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== "granted") {
        setError("Push notification permission denied");
        return;
      }

      setPermissionGranted(true);

      // Listen for registration success
      await PushNotifications.addListener("registration", async (regToken) => {
        setToken(regToken.value);

        // Store token on server
        try {
          await fetch("/api/notifications/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: regToken.value,
              platform: (await import("@capacitor/core")).Capacitor.getPlatform(),
            }),
          });
        } catch {
          // Non-critical — token will be re-registered on next app open
        }
      });

      // Listen for registration error
      await PushNotifications.addListener("registrationError", (err) => {
        setError(err.error);
      });

      // Listen for incoming notifications while app is open
      await PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          // Could show an in-app toast here
          console.log("Push received:", notification.title);
        }
      );

      // Listen for notification tap (app opened from notification)
      await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (action) => {
          const data = action.notification.data;
          if (data?.url) {
            window.location.href = data.url;
          }
        }
      );

      // Register with APNS / FCM
      await PushNotifications.register();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    }
  }, []);

  useEffect(() => {
    register();
  }, [register]);

  return { token, permissionGranted, error, register };
}
