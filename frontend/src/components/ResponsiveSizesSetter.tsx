"use client";
import { useEffect } from "react";

export default function ResponsiveSizesSetter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setVars = (w: number) => {
      const root = document.documentElement.style;
      // sensible defaults (match SCSS initial values)
      if (w <= 420) {
        root.setProperty("--avatar-thumb-size", "28px");
        root.setProperty("--avatar-circle-size", "40px");
        root.setProperty("--hero-visual-max-width", "180px");
        root.setProperty("--hero-visual-min-width", "140px");
        root.setProperty("--mystical-fog-width", "92%");
      } else if (w <= 760) {
        root.setProperty("--avatar-thumb-size", "32px");
        root.setProperty("--avatar-circle-size", "48px");
        root.setProperty("--hero-visual-max-width", "280px");
        root.setProperty("--hero-visual-min-width", "160px");
        root.setProperty("--mystical-fog-width", "90%");
      } else {
        root.setProperty("--avatar-thumb-size", "40px");
        root.setProperty("--avatar-circle-size", "120px");
        root.setProperty("--hero-visual-max-width", "360px");
        root.setProperty("--hero-visual-min-width", "220px");
        root.setProperty("--mystical-fog-width", "80%");
      }
    };

    // initial set
    setVars(window.innerWidth || document.documentElement.clientWidth || 1024);

    // Resize observer fallback for dynamic container changes
    let raf = 0;
    const onResize = () => {
      // throttle with requestAnimationFrame
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVars(window.innerWidth));
    };

    window.addEventListener("resize", onResize);

    // also observe documentElement changes as a defensive measure
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => onResize());
      ro.observe(document.documentElement);
    } catch (e) {
      // ResizeObserver may not be available in some older environments; that's ok
      ro = null;
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
