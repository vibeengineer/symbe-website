declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
    };
  }
}

import { gsap } from "@/components/navigation/shared/animations";

export function initMainHeroAnimations() {
  // Set initial states for all elements
  gsap.set("[data-hero-title]", { autoAlpha: 0, y: 20 });
  gsap.set("[data-hero-subtitle]", { autoAlpha: 0, y: 20 });
  gsap.set("[data-hero-ctas]", { autoAlpha: 0, y: 20 });
  gsap.set("[data-hero-media]", { autoAlpha: 0, y: 40 });

  // Check if banner exists and set its initial state
  const banner = document.querySelector("[data-hero-banner]");
  if (banner) {
    gsap.set(banner, { autoAlpha: 0, y: -10 });
  }

  // Listen for UnicornStudio initialization
  const checkUnicornStudio = () => {
    if (window.UnicornStudio?.isInitialized) {
      // Re-check if banner exists when animation starts
      const banner = document.querySelector("[data-hero-banner]");

      // Staggered animation sequence
      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
      });

      // Title appears first
      timeline.to("[data-hero-title]", {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        delay: 0.1,
      });

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

      // Media comes in
      timeline.to(
        "[data-hero-media]",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
        },
        "-=0.6",
      );

      // Banner comes in last (only if it exists)
      if (banner) {
        timeline.to(
          banner,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.5",
        );
      }
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
