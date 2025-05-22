import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Initialize scrolling features animations
 * Only handles showing/hiding images as their corresponding text sections scroll into view
 * Positioning is handled by CSS sticky positioning
 */
export function initScrollingFeatures() {
  // Don't run on mobile
  if (window.innerWidth < 1024) return;

  // Register GSAP plugin
  gsap.registerPlugin(ScrollTrigger);

  // Get elements
  const featureSections = document.querySelectorAll(
    '[data-attribute="scrolling-feature-section"]',
  );
  const images = document.querySelectorAll(
    '[data-attribute="scrolling-feature-image"]',
  );

  if (!featureSections.length || !images.length) {
    console.warn("Missing elements for scrolling features animation");
    return;
  }

  // Create a scroll trigger for each feature section to change the visible image
  for (const [index, section] of Array.from(featureSections).entries()) {
    const currentImage = images[index] as HTMLElement;
    if (!currentImage) continue;

    // Hide all images except the first one initially
    if (index !== 0) {
      gsap.set(currentImage, { opacity: 0 });
    }

    // Create the scroll trigger for this section
    ScrollTrigger.create({
      trigger: section,
      start: "top center", // When the top of the section reaches center of viewport
      end: "bottom center", // When the bottom of the section leaves center of viewport
      markers: false,

      // When scrolling down and the section enters the viewport center
      onEnter: () => {
        // Fade in the current image
        gsap.to(currentImage, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });

        // Fade out all other images
        for (const [i, img] of Array.from(images).entries()) {
          if (i !== index) {
            gsap.to(img, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        }
      },

      // When scrolling up and the section re-enters the viewport center
      onEnterBack: () => {
        // Fade in the current image
        gsap.to(currentImage, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });

        // Fade out all other images
        for (const [i, img] of Array.from(images).entries()) {
          if (i !== index) {
            gsap.to(img, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        }
      },
    });
  }
}

// Ensure animations restart on window resize
window.addEventListener("resize", () => {
  // Wait for resize to finish to avoid performance issues
  const delay = 300;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    // Kill all existing scroll triggers
    const triggers = ScrollTrigger.getAll();
    for (const trigger of triggers) {
      trigger.kill();
    }

    // Reinitialize
    initScrollingFeatures();
  }, delay);
});
