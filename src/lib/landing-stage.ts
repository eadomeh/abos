import { useEffect } from "react";
import gsap from "gsap";
import Lenis from "lenis";

/**
 * Desktop-only smooth scroll (Lenis) and a single GSAP hero arrival.
 * Phones and reduced-motion keep native scrolling and CSS fallbacks.
 */
export function useLandingStage() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    if (reduce.matches) return;

    const root = document.documentElement;
    root.classList.add("abos-gsap");

    const intros = gsap.utils.toArray<HTMLElement>(".hero-intro");
    const introTween = intros.length
      ? gsap.from(intros, {
          y: 16,
          autoAlpha: 0,
          duration: 0.72,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        })
      : null;

    let lenis: Lenis | null = null;
    let frame = 0;

    const startLenis = () => {
      if (!desktop.matches || lenis) return;
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
      });
      const loop = (time: number) => {
        lenis?.raf(time);
        frame = window.requestAnimationFrame(loop);
      };
      frame = window.requestAnimationFrame(loop);
    };

    const stopLenis = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      lenis?.destroy();
      lenis = null;
    };

    startLenis();
    const onDesktop = () => {
      if (desktop.matches) startLenis();
      else stopLenis();
    };
    desktop.addEventListener("change", onDesktop);

    return () => {
      desktop.removeEventListener("change", onDesktop);
      introTween?.kill();
      stopLenis();
      root.classList.remove("abos-gsap");
    };
  }, []);
}
