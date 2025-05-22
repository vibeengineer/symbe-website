declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
    };
  }
}

import { gsap } from "@/components/navigation/shared/animations";

export function initMainHeroAnimations() {
  // Hide content initially
  gsap.set("[data-hero-banner]", { autoAlpha: 0 });
  gsap.set("[data-hero-title]", { autoAlpha: 0, y: 20 });
  gsap.set("[data-hero-subtitle]", { autoAlpha: 0, y: 20 });
  gsap.set("[data-hero-ctas]", { autoAlpha: 0, y: 20 });
  gsap.set("[data-hero-media]", { autoAlpha: 0, y: 40 });

  // Listen for UnicornStudio initialization
  const checkUnicornStudio = () => {
    if (window.UnicornStudio?.isInitialized) {
      // Staggered animation sequence
      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      // Banner fades in first (no y movement)
      timeline.to("[data-hero-banner]", {
        autoAlpha: 1,
        duration: 0.8,
        delay: 0.1,
      });

      // Title appears
      timeline.to(
        "[data-hero-title]",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.7",
      );

      // Subtitle follows
      timeline.to(
        "[data-hero-subtitle]",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.7",
      );

      // CTAs appear
      timeline.to(
        "[data-hero-ctas]",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.7",
      );

      // Media comes in last
      timeline.to(
        "[data-hero-media]",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.6",
      );
    } else {
      // Check again in a short interval
      setTimeout(checkUnicornStudio, 100);
    }
  };

  // Start checking
  checkUnicornStudio();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initMainHeroAnimations);
// Support Astro View Transitions
document.addEventListener("astro:page-load", initMainHeroAnimations);
