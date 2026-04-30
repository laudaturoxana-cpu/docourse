declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (params) {
      window.fbq("track", event, params);
    } else {
      window.fbq("track", event);
    }
  }
}
