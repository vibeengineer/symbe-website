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
  // Hide navigation initially
  gsap.set("header", { autoAlpha: 0, y: -10 });

  // Listen for UnicornStudio initialization
  const checkUnicornStudio = () => {
    if (window.UnicornStudio?.isInitialized) {
      // Reveal navigation with a smooth animation
      gsap.to("header", {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.05, // Reduced delay to start almost immediately
      });
    } else {
      // Check again in a short interval
      setTimeout(checkUnicornStudio, 100);
    }
  };

  // Start checking
  checkUnicornStudio();
}
