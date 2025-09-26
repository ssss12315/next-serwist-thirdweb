// When new version of the Service Worker enters the waiting state, the page will display a prompt, allowing the user to click Update Now (send SKIP_WAITING and then automatically refresh).
"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerUpdater() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => {
      // After the new SW takes over, the page will automatically refresh to get the latest resources
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker.ready.then((reg) => {
      if (!reg || !reg.waiting) return;

      // New version waiting
      setShow(true);
    });

    // Monitor new SW installation
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener("statechange", () => {
          if (newSW.state === "installed" && navigator.serviceWorker.controller) {
            setShow(true);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const refreshNow = async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const waiting = reg?.waiting;
    if (!waiting) return;
    // Send skip waiting
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-black/80 text-white px-4 py-3 shadow-lg">
      <span className="mr-3"> New version available </span>
      <button
        onClick={refreshNow}
        className="rounded-xl bg-white/10 px-3 py-1 hover:bg-white/20 transition"
      >
        Update now
      </button>
    </div>
  );
}
