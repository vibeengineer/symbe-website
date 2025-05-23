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
    // Set initial states for banner elements
    gsap.set(banner.querySelector("svg[data-lucide='g2-logo']"), {
      autoAlpha: 0,
      scale: 0.8,
    });
    gsap.set(banner.querySelector("[data-banner-text]"), {
      autoAlpha: 0,
      y: 5,
    });
    gsap.set(banner.querySelectorAll("svg:not([data-lucide='g2-logo'])"), {
      scale: 0,
    });
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

      // Banner comes in (only if it exists)
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

        // Animate banner text first
        const bannerText = banner.querySelector("[data-banner-text]");
        if (bannerText) {
          timeline.to(
            bannerText,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
            },
            "-=0.4",
          );
        }

        // Then animate G2 logo (slight delay after text starts)
        const g2Logo = banner.querySelector("svg[data-lucide='g2-logo']");
        if (g2Logo) {
          timeline.to(
            g2Logo,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.4,
              ease: "back.out(1.7)",
            },
            "-=0.3",
          );
        }

        // Finally animate stars (slight delay after G2 logo starts)
        const stars = banner.querySelectorAll(
          "svg:not([data-lucide='g2-logo'])",
        );
        if (stars.length > 0) {
          timeline.to(
            stars,
            {
              scale: 1,
              duration: 0.3,
              ease: "back.out(1.7)",
              stagger: 0.1,
            },
            "-=0.2",
          );
        }
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
