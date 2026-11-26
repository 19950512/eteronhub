"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister(): null {
  useEffect(() => {
    // why: em dev o SW cachearia chunks do HMR e mascararia mudanças.
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // why: sem SW o site continua funcionando online; não há o que fazer aqui.
      });
  }, []);

  return null;
}
