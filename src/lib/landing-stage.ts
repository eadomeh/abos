import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Register ScrollTrigger plugin safely
gsap.registerPlugin(ScrollTrigger);

/**
 * Desktop-only smooth scroll (Lenis) and coordinated GSAP motion foundation.
 * Mobile touch devices and prefers-reduced-motion maintain 100% native momentum scrolling.
 */
export function useLandingStage() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isDesktopPointer = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)"
    );

    if (reduceMotion.matches) return;

    const root = document.documentElement;
    root.classList.add("abos-gsap");

    // GSAP Hero arrival stagger
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
    let tickerCallback: ((time: number) => void) | null = null;

    const startLenis = () => {
      if (!isDesktopPointer.matches || lenis) return;
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
      });

      // Synchronize Lenis with GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
    };

    const stopLenis = () => {
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        tickerCallback = null;
      }
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      ScrollTrigger.update();
    };

    startLenis();

    const handlePointerChange = () => {
      if (isDesktopPointer.matches) {
        startLenis();
      } else {
        stopLenis();
      }
    };

    isDesktopPointer.addEventListener("change", handlePointerChange);

    return () => {
      isDesktopPointer.removeEventListener("change", handlePointerChange);
      introTween?.kill();
      stopLenis();
      root.classList.remove("abos-gsap");
    };
  }, []);
}
