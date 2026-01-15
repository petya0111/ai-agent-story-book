"use client";
import { useEffect } from "react";

function detectSlowDevice(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);

    try {
      // Honor explicit user preference first
      const m = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
      if (m && m.matches) return resolve(true);

      // Quick heuristics
      const nav: any = navigator as any;
      if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return resolve(true);
      if (nav.deviceMemory && nav.deviceMemory <= 1) return resolve(true);
      if (nav.connection) {
        const conn: any = nav.connection;
        if (conn.saveData) return resolve(true);
        if (conn.effectiveType && /2g|slow-2g/.test(conn.effectiveType)) return resolve(true);
      }

      // Lightweight runtime measure: sample a few requestAnimationFrame intervals
      let frames = 0;
      const samples: number[] = [];
      let last = performance.now();

      function frame(ts: number) {
        const delta = ts - last;
        last = ts;
        samples.push(delta);
        frames += 1;
        if (frames >= 5) {
          const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
          // If average frame time > 40ms consider device slow / overloaded
          resolve(avg > 40);
        } else {
          requestAnimationFrame(frame);
        }
      }

      // give the browser a tick to warm up
      requestAnimationFrame((t) => {
        last = t;
        requestAnimationFrame(frame);
      });
    } catch (e) {
      // if any detection fails, fall back to false
      resolve(false);
    }
  });
}

export default function ReducedMotionSetter() {
  useEffect(() => {
    let mounted = true;
    if (typeof document === "undefined") return;

    detectSlowDevice().then((isSlow) => {
      if (!mounted) return;
      if (isSlow) {
        document.documentElement.classList.add("reduced-motion");
      }
    });

    // Also listen to changes in prefers-reduced-motion
    let mql: MediaQueryList | null = null;
    let mqHandler: ((e: MediaQueryListEvent) => void) | null = null;
    try {
      if (window.matchMedia) {
        mql = window.matchMedia("(prefers-reduced-motion: reduce)");
        mqHandler = (e: MediaQueryListEvent) => {
          if (e.matches) document.documentElement.classList.add("reduced-motion");
          else document.documentElement.classList.remove("reduced-motion");
        };
        if (mql.addEventListener) mql.addEventListener("change", mqHandler);
        else (mql as any).addListener(mqHandler);
      }
    } catch (e) {
      // ignore
    }

    return () => {
      mounted = false;
      try {
        if (mql && mqHandler) {
          if (mql.removeEventListener) mql.removeEventListener("change", mqHandler);
          else (mql as any).removeListener(mqHandler);
        }
      } catch (e) {}
    };
  }, []);

  return null;
}
