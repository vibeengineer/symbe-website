import gsap from "gsap";

// Types for our animation targets
interface NavigationElements {
  nav: HTMLElement | null;
  highlight: HTMLElement | null;
  dropdownTriggers: HTMLElement[];
  dropdownPanels: HTMLElement[];
  mobileToggle: HTMLElement | null;
  mobileDrawer: HTMLElement | null;
}

let currentPanel: HTMLElement | null = null;

const initNavigationAnimations = () => {
  // Add js-enabled class to enable animations
  document.documentElement.classList.add("js-enabled");

  // Query all required elements
  const elements: NavigationElements = {
    nav: document.querySelector('[data-nav="desktop"]'),
    highlight: document.querySelector(".nav-highlight"),
    dropdownTriggers: Array.from(
      document.querySelectorAll("[data-trigger]"),
    ).filter((el): el is HTMLElement => el instanceof HTMLElement),
    dropdownPanels: Array.from(
      document.querySelectorAll("[data-panel]"),
    ).filter((el): el is HTMLElement => el instanceof HTMLElement),
    mobileToggle: document.querySelector("[data-mobile-toggle]"),
    mobileDrawer: document.querySelector("[data-mobile-drawer]"),
  };

  // Initialize highlight pill animations
  const initHighlight = () => {
    if (!elements.highlight) return;

    for (const trigger of elements.dropdownTriggers) {
      trigger.addEventListener("mouseenter", () => {
        if (!elements.highlight) return;
        gsap.to(elements.highlight, {
          x: trigger.offsetLeft,
          y: trigger.offsetTop,
          width: trigger.offsetWidth,
          height: trigger.offsetHeight,
          duration: 0.25,
          ease: "power3.out",
          autoAlpha: 1,
        });
      });
    }

    elements.nav?.addEventListener("mouseleave", () => {
      if (!elements.highlight) return;
      gsap.to(elements.highlight, {
        autoAlpha: 0,
        duration: 0.2,
      });
    });
  };

  // Initialize dropdown panel animations
  const initDropdowns = () => {
    elements.dropdownTriggers.forEach((trigger, index) => {
      const panel = elements.dropdownPanels[index];
      if (!panel) return;

      // Set initial state
      gsap.set(panel, { autoAlpha: 0, y: 10 });

      trigger.addEventListener("mouseenter", () => {
        if (currentPanel && currentPanel !== panel) {
          // Crossfade between panels
          gsap.to(currentPanel, {
            autoAlpha: 0,
            y: 10,
            duration: 0.2,
          });
        }

        currentPanel = panel;
        gsap.to(panel, {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });

    // Handle mouse leave with delay
    elements.nav?.addEventListener("mouseleave", () => {
      if (currentPanel) {
        gsap.to(currentPanel, {
          autoAlpha: 0,
          y: 10,
          duration: 0.2,
          delay: 0.15,
        });
        currentPanel = null;
      }
    });
  };

  // Initialize mobile drawer animations
  const initMobileDrawer = () => {
    const { mobileToggle, mobileDrawer } = elements;
    if (!mobileToggle || !mobileDrawer) return;

    // Set initial state
    gsap.set(mobileDrawer, { yPercent: -100 });

    const mobileTimeline = gsap
      .timeline({ paused: true })
      .to(mobileDrawer, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: "power3.out",
      })
      .from(
        mobileDrawer.children,
        {
          y: 20,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.2",
      );

    let isOpen = false;

    mobileToggle.addEventListener("click", () => {
      isOpen = !isOpen;
      if (isOpen) {
        document.body.style.overflow = "hidden";
        mobileTimeline.play();
      } else {
        document.body.style.overflow = "";
        mobileTimeline.reverse();
      }
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        isOpen = false;
        document.body.style.overflow = "";
        mobileTimeline.reverse();
        mobileToggle.setAttribute("aria-expanded", "false");
      }
    });
  };

  // Initialize all animations
  initHighlight();
  initDropdowns();
  initMobileDrawer();
};

// Self-invoke on load
document.addEventListener("DOMContentLoaded", initNavigationAnimations);
