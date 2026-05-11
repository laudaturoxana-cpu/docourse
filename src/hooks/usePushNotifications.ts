"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/browser";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function usePushNotifications(communityId: string, userId: string | undefined) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  useEffect(() => {
    if (!isSupported || !userId || !communityId) return;
    checkSubscription();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, userId, communityId]);

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!reg) { setIsSubscribed(false); return; }
      const sub = await reg.pushManager.getSubscription();
      if (!sub) { setIsSubscribed(false); return; }
      const { data } = await db
        .from("push_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("community_id", communityId)
        .eq("endpoint", sub.endpoint)
        .maybeSingle();
      setIsSubscribed(!!data);
    } catch {
      setIsSubscribed(false);
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || !userId || !communityId) return false;
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setIsLoading(false); return false; }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) await existingSub.unsubscribe();

      const keyBytes = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes.buffer as ArrayBuffer,
      });

      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await db.from("push_subscriptions").upsert({
        user_id: userId,
        community_id: communityId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      }, { onConflict: "user_id,community_id,endpoint" });

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  };

  const unsubscribe = async () => {
    if (!userId || !communityId) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await db.from("push_subscriptions")
            .delete()
            .eq("user_id", userId)
            .eq("community_id", communityId)
            .eq("endpoint", sub.endpoint);
          await sub.unsubscribe();
        }
      }
      setIsSubscribed(false);
    } catch {
      // ignore
    }
    setIsLoading(false);
  };

  return { isSupported, isSubscribed, isLoading, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}
