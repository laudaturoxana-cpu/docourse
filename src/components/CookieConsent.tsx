"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Nu arătăm bannerul în iOS app (detectăm PWAShell user agent setat de wrapper-ul Xcode)
    const isIOSApp = /PWAShell/i.test(navigator.userAgent);
    if (isIOSApp) return;
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consimțământ cookie-uri"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:rounded-lg sm:border"
    >
      <p className="text-sm text-gray-700">
        Folosim cookie-uri esențiale pentru funcționarea platformei și cookie-uri analitice
        pentru a înțelege cum o folosești. Nu vindem datele tale.{" "}
        <Link href="/politica-de-confidentialitate" className="underline">
          Politică de confidențialitate
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={accept}
          className="flex-1 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          Accept
        </button>
        <button
          onClick={decline}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          Refuz
        </button>
      </div>
    </div>
  );
}
