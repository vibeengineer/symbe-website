import gsap from "gsap";

export { gsap };

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
    };
  }
}

export type ManagedEventListener = {
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: AddEventListenerOptions | boolean;
};

export function addManagedEventListener(
  listeners: ManagedEventListener[],
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
) {
  target.addEventListener(type, listener, options);
  listeners.push({ target, type, listener, options });
}

export function removeAllManagedEventListeners(
  listeners: ManagedEventListener[],
) {
  for (const { target, type, listener, options } of listeners) {
    target.removeEventListener(type, listener, options);
  }
  listeners.length = 0; // Clear the array
}

export function initNavigationReveal() {
  const headerElement = document.querySelector("header");
  if (!headerElement) {
    console.warn("Header element not found for navigation reveal.");
    return;
  }

  if (window.location.pathname === "/") {
    // Homepage: Animate in.
    // The header starts with 'opacity-0' class from index.astro.
    // GSAP autoAlpha will handle opacity and visibility for the animation.
    gsap.set(headerElement, { y: -10, autoAlpha: 0 }); // Ensure starting state for animation
    gsap.to(headerElement, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.05, // Small delay to ensure any initial rendering flicker is avoided
    });
  } else {
    // Not homepage: Show navigation immediately and ensure it's in the correct position.
    // Explicitly remove the 'opacity-0' class that might be hiding it.
    headerElement.classList.remove("opacity-0");
    // Use GSAP to set final state directly.
    // opacity: 1 and visibility: 'visible' is what autoAlpha: 1 does.
    gsap.set(headerElement, { opacity: 1, visibility: "visible", y: 0 });
  }
}
