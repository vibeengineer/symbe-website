import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Type for media asset data from Storyblok - matches ParsedAsset from parseAsset utility
interface MediaAsset {
  src: string;
  alt: string | null;
}

// Initialize the scrolling features animation
function initScrollingFeaturesAnimation() {
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
    ScrollTrigger.create({
      trigger: feature,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => swapMedia(parsedMediaAsset, stickyMediaElement),
      onEnterBack: () => swapMedia(parsedMediaAsset, stickyMediaElement),
      // Remove markers for production
      // markers: true,
    });
  });
}

// Function to swap media with animation
function swapMedia(newMediaAsset: MediaAsset, mediaElement: Element) {
  if (!newMediaAsset || !mediaElement || !newMediaAsset.src) return;

  // Prevent swapping to the same image
  const currentSrc =
    mediaElement.tagName.toLowerCase() === "img"
      ? (mediaElement as HTMLImageElement).src
      : (mediaElement as HTMLVideoElement).src;

  if (currentSrc === newMediaAsset.src) return;

  // Create a timeline for the swap animation
  const tl = gsap.timeline();

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

// Also handle cases where the script loads after DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScrollingFeaturesAnimation);
} else {
  initScrollingFeaturesAnimation();
}
