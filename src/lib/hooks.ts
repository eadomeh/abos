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

export function useScrollReveal() {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"),
    );

    if (
      targets.length === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    const visibleLine = window.innerHeight * 0.9;

    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();

      if (rect.top < visibleLine || rect.bottom <= 0) {
        target.classList.add("scroll-reveal-visible");
        return;
      }

      target.classList.add("scroll-reveal-pending");
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);
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
