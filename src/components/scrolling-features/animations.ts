import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Type for media asset data from Storyblok - matches ParsedAsset from parseAsset utility
interface MediaAsset {
  src: string;
  alt: string | null;
}

// Store references to created ScrollTriggers for cleanup
let scrollTriggers: ScrollTrigger[] = [];
// Store reference to current animation timeline
let currentSwapTimeline: gsap.core.Timeline | null = null;
// Store current media asset to track state
let currentMediaAsset: MediaAsset | null = null;

// Clean up function to remove all existing ScrollTriggers
function cleanupScrollTriggers() {
  // Kill all stored ScrollTriggers
  for (const trigger of scrollTriggers) {
    trigger.kill();
  }
  scrollTriggers = [];

  // Kill any existing swap animation
  if (currentSwapTimeline) {
    currentSwapTimeline.kill();
    currentSwapTimeline = null;
  }

  // Reset current media asset tracking
  currentMediaAsset = null;
}

// Initialize the scrolling features animation
function initScrollingFeaturesAnimation() {
  // Clean up any existing ScrollTriggers first
  cleanupScrollTriggers();

  // Get all the scrolling feature elements
  const features = document.querySelectorAll("[data-scrolling-feature]");
  const stickyMediaContainer = document.querySelector(
    "[data-sticky-media-container]",
  );

  if (!features.length || !stickyMediaContainer) {
    console.warn("ScrollingFeatures: Required elements not found");
    return;
  }

  // Get the media element inside the sticky container
  const stickyMediaElement = stickyMediaContainer.querySelector("img, video");

  if (!stickyMediaElement) {
    console.warn(
      "ScrollingFeatures: Media element not found in sticky container",
    );
    return;
  }

  // Set initial media asset (first feature)
  const firstFeature = features[0];
  const firstMediaData = firstFeature.getAttribute("data-media-asset");
  if (firstMediaData) {
    try {
      currentMediaAsset = JSON.parse(firstMediaData) as MediaAsset;
    } catch (error) {
      console.error(
        "ScrollingFeatures: Failed to parse first media asset:",
        error,
      );
    }
  }

  // Create ScrollTrigger for each feature
  features.forEach((feature, index) => {
    const mediaAssetData = feature.getAttribute("data-media-asset");

    if (!mediaAssetData) {
      console.warn(
        `ScrollingFeatures: No media asset data found for feature ${index}`,
      );
      return;
    }

    let parsedMediaAsset: MediaAsset;
    try {
      parsedMediaAsset = JSON.parse(mediaAssetData) as MediaAsset;
    } catch (error) {
      console.error(
        `ScrollingFeatures: Failed to parse media asset data for feature ${index}:`,
        error,
      );
      return;
    }

    // Validate that we have a valid src
    if (!parsedMediaAsset.src) {
      console.warn(`ScrollingFeatures: No src found for feature ${index}`);
      return;
    }

    // Create ScrollTrigger for this feature
    const trigger = ScrollTrigger.create({
      trigger: feature,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => {
        swapMedia(parsedMediaAsset, stickyMediaElement);
      },
      onEnterBack: () => {
        swapMedia(parsedMediaAsset, stickyMediaElement);
      },
      // Optional: Add onLeave and onLeaveBack for more precise control
      // onLeave: () => {
      //   // Could implement logic to show next feature's media
      // },
      // onLeaveBack: () => {
      //   // Could implement logic to show previous feature's media
      // },
      // Remove markers for production
      // markers: true,
    });

    // Store the trigger reference for cleanup
    scrollTriggers.push(trigger);
  });

  // Refresh ScrollTrigger after setup to ensure correct calculations
  ScrollTrigger.refresh();
}

// Function to swap media with animation
function swapMedia(newMediaAsset: MediaAsset, mediaElement: Element) {
  if (!newMediaAsset || !mediaElement || !newMediaAsset.src) return;

  // Check if we're already showing this media asset
  if (currentMediaAsset && currentMediaAsset.src === newMediaAsset.src) {
    return;
  }

  // Update current media asset tracking
  currentMediaAsset = newMediaAsset;

  // Kill any existing animation to prevent overlaps
  if (currentSwapTimeline) {
    currentSwapTimeline.kill();
    currentSwapTimeline = null;
  }

  // Create a timeline for the swap animation
  const tl = gsap.timeline({
    // Use overwrite mode to automatically kill conflicting animations
    overwrite: "auto",
    onComplete: () => {
      // Clear the reference when animation completes
      currentSwapTimeline = null;
    },
    onInterrupt: () => {
      // Clear the reference if animation gets interrupted
      currentSwapTimeline = null;
    },
  });

  // Store reference to current timeline
  currentSwapTimeline = tl;

  // Scale down the current media (pop out effect)
  tl.to(mediaElement, {
    scale: 0.4,
    duration: 0.15,
    ease: "power2.in",
  })
    // Update the src
    .call(() => {
      // Update the media source
      if (mediaElement.tagName.toLowerCase() === "img") {
        (mediaElement as HTMLImageElement).src = newMediaAsset.src;
        (mediaElement as HTMLImageElement).alt = newMediaAsset.alt || "";
      } else if (mediaElement.tagName.toLowerCase() === "video") {
        (mediaElement as HTMLVideoElement).src = newMediaAsset.src;
      }
    })
    // Scale up the new media (pop in effect with slight overshoot)
    .to(mediaElement, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    })
    // Settle back to normal size
    .to(mediaElement, {
      scale: 1,
      duration: 0.1,
      ease: "power2.out",
    });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initScrollingFeaturesAnimation();
});

// Support Astro View Transitions
document.addEventListener("astro:page-load", initScrollingFeaturesAnimation);

// Clean up on page unload to prevent memory leaks
document.addEventListener("astro:before-preparation", cleanupScrollTriggers);

// Also handle cases where the script loads after DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScrollingFeaturesAnimation);
} else {
  initScrollingFeaturesAnimation();
}
