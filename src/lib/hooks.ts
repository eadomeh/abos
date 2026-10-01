import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);

  return mobile;
}

export type GlTier = "off" | "low" | "high";

export function getGlTier(): GlTier {
  if (typeof window === "undefined") return "off";
  try {
    const highCanvas = document.createElement("canvas");
    const high =
      highCanvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      highCanvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (high) {
      const nav = navigator as Navigator & { deviceMemory?: number };
      const small = window.innerWidth < 768;
      const cores = navigator.hardwareConcurrency || 8;
      // Mid-range phones stay on the CSS/SVG fallback — no WebGL on the scroll path.
      if (small) return "low";
      if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return "low";
      if (cores <= 4 && small) return "low";
      return "high";
    }
    const lowCanvas = document.createElement("canvas");
    const low = lowCanvas.getContext("webgl2") || lowCanvas.getContext("webgl");
    return low ? "low" : "off";
  } catch {
    return "off";
  }
}

export function useGlTier() {
  const [tier, setTier] = useState<GlTier>("off");

  useEffect(() => {
    setTier(getGlTier());
  }, []);

  return tier;
}
