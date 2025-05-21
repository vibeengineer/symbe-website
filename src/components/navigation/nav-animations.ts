import gsap from "gsap";

// Module-level state for the dropdown
let currentDropdown: HTMLElement | null = null;
let dropdownTimeoutId: number | null = null;

// Store listener references to remove them if init is called again
const eventListeners: Array<{
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: AddEventListenerOptions | boolean;
}> = [];

function addManagedEventListener(
  target: EventTarget,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
) {
  target.addEventListener(type, listener, options);
  eventListeners.push({ target, type, listener, options });
}

function removeAllManagedEventListeners() {
  for (const { target, type, listener, options } of eventListeners) {
    target.removeEventListener(type, listener, options);
  }
  eventListeners.length = 0; // Clear the array
}

/**
 * Initialize all navigation animations.
 * This function might be called multiple times due to Astro View Transitions.
 */
const initNavigationAnimations = () => {
  // 1. Clean up old listeners and state
  removeAllManagedEventListeners();

  // Reset shared state variables
  if (currentDropdown) {
    gsap.set(currentDropdown, { autoAlpha: 0 }); // Immediately hide
    currentDropdown = null;
  }
  if (dropdownTimeoutId !== null) {
    clearTimeout(dropdownTimeoutId);
    dropdownTimeoutId = null;
  }

  // 2. Query for elements
  const dropdownPanels = document.querySelectorAll<HTMLElement>("[data-panel]");
  const mobileToggle = document.querySelector<HTMLElement>(
    "[data-mobile-toggle]",
  );
  const mobileDrawer = document.querySelector<HTMLElement>(
    "[data-mobile-drawer]",
  );

  if (!document.documentElement.classList.contains("js-enabled")) {
    document.documentElement.classList.add("js-enabled");
  }

  // Set initial states for dropdowns (idempotent)
  gsap.set(dropdownPanels, {
    autoAlpha: 0,
    y: -10,
    scaleY: 0.95,
    transformOrigin: "top",
  });
  if (mobileDrawer) {
    gsap.set(mobileDrawer, { autoAlpha: 0, yPercent: -5 });
  }

  // Set initial state for chevrons (idempotent)
  const chevrons = document.querySelectorAll<HTMLElement>("[data-chevron]");
  gsap.set(chevrons, { rotation: 0 });

  // --- Helper functions for dropdowns ---
  function openDropdown(panelToOpen: HTMLElement) {
    if (currentDropdown && currentDropdown !== panelToOpen) {
      gsap.set(currentDropdown, { autoAlpha: 0, y: -10, scaleY: 0.95 }); // Instant close
      const prevChevron = currentDropdown
        .closest(".dropdown-wrapper")
        ?.querySelector<HTMLElement>("[data-chevron]");
      if (prevChevron) {
        gsap.to(prevChevron, { rotation: 0, duration: 0.15 });
      }
    }
    currentDropdown = panelToOpen;
    gsap.to(panelToOpen, {
      autoAlpha: 1,
      y: 0,
      scaleY: 1,
      duration: 0.2,
      ease: "power2.out",
    });

    const chevron = panelToOpen
      .closest(".dropdown-wrapper")
      ?.querySelector<HTMLElement>("[data-chevron]");
    if (chevron) {
      gsap.to(chevron, { rotation: 180, duration: 0.15 });
    }
  }

  function closeDropdown(panelToClose: HTMLElement) {
    gsap.to(panelToClose, {
      autoAlpha: 0,
      y: -10,
      scaleY: 0.95,
      duration: 0.2,
      onComplete: () => {
        if (currentDropdown === panelToClose) {
          currentDropdown = null;
        }
      },
    });

    const chevron = panelToClose
      .closest(".dropdown-wrapper")
      ?.querySelector<HTMLElement>("[data-chevron]");
    if (chevron) {
      gsap.to(chevron, { rotation: 0, duration: 0.15 });
    }
  }

  function startCloseTimer(panel: HTMLElement) {
    if (dropdownTimeoutId !== null) {
      clearTimeout(dropdownTimeoutId);
    }
    dropdownTimeoutId = window.setTimeout(() => {
      closeDropdown(panel);
      dropdownTimeoutId = null;
    }, 250);
  }

  function cancelCloseTimer() {
    if (dropdownTimeoutId !== null) {
      clearTimeout(dropdownTimeoutId);
      dropdownTimeoutId = null;
    }
  }

  // --- Desktop Dropdown Logic ---
  const wrappers = document.querySelectorAll<HTMLElement>(".dropdown-wrapper");
  for (const wrapper of wrappers) {
    const trigger = wrapper.querySelector<HTMLElement>("[data-trigger]");
    const panel = wrapper.querySelector<HTMLElement>("[data-panel]");

    if (!trigger || !panel) {
      // console.warn("Dropdown wrapper missing trigger or panel:", wrapper); // Optional warning
      return;
    }

    addManagedEventListener(wrapper, "mouseenter", () => {
      cancelCloseTimer();
      openDropdown(panel);
    });

    addManagedEventListener(wrapper, "mouseleave", () => {
      startCloseTimer(panel);
    });

    addManagedEventListener(panel, "mouseenter", () => {
      cancelCloseTimer();
    });

    addManagedEventListener(panel, "mouseleave", () => {
      startCloseTimer(panel);
    });
  }

  // Close dropdowns when clicking outside
  addManagedEventListener(document, "click", (e) => {
    if (currentDropdown && e.target instanceof Element) {
      const currentOpenDropdownWrapper =
        currentDropdown.closest(".dropdown-wrapper");
      if (
        currentOpenDropdownWrapper &&
        !currentOpenDropdownWrapper.contains(e.target)
      ) {
        cancelCloseTimer();
        closeDropdown(currentDropdown);
      } else if (!currentOpenDropdownWrapper) {
        cancelCloseTimer();
        closeDropdown(currentDropdown);
      }
    }
  });

  // --- Mobile Drawer Logic ---
  if (mobileToggle && mobileDrawer) {
    let isOpen = false;

    addManagedEventListener(mobileToggle, "click", () => {
      isOpen = !isOpen;
      if (isOpen) {
        mobileToggle.setAttribute("aria-expanded", "true");
        mobileDrawer.setAttribute("aria-hidden", "false");
        mobileDrawer.classList.add("open");
        document.body.style.overflow = "hidden";
        gsap.to(mobileDrawer, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            const menuItems =
              mobileDrawer.querySelectorAll<HTMLElement>(".flex > *");
            gsap.fromTo(
              menuItems,
              { y: 20, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                stagger: 0.04,
                duration: 0.2,
                ease: "power1.out",
              },
            );
          },
        });
      } else {
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileDrawer.setAttribute("aria-hidden", "true");
        mobileDrawer.classList.remove("open");
        document.body.style.overflow = "";
        gsap.to(mobileDrawer, {
          autoAlpha: 0,
          yPercent: -5,
          duration: 0.25,
          ease: "power2.in",
        });
      }
    });

    const links = mobileDrawer.querySelectorAll<HTMLElement>("a");
    for (const link of links) {
      addManagedEventListener(link, "click", () => {
        if (
          mobileToggle instanceof HTMLElement &&
          typeof mobileToggle.click === "function"
        ) {
          mobileToggle.click();
        } else {
          isOpen = false;
          mobileToggle?.setAttribute("aria-expanded", "false");
          mobileDrawer?.setAttribute("aria-hidden", "true");
          mobileDrawer?.classList.remove("open");
          document.body.style.overflow = "";
          if (mobileDrawer)
            gsap.to(mobileDrawer, {
              autoAlpha: 0,
              yPercent: -5,
              duration: 0.25,
            });
        }
      });
    }

    const keydownListener = (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape" && isOpen) {
        if (
          mobileToggle instanceof HTMLElement &&
          typeof mobileToggle.click === "function"
        ) {
          mobileToggle.click();
        }
      }
    };
    addManagedEventListener(document, "keydown", keydownListener);
  }
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initNavigationAnimations);
// Support Astro View Transitions
document.addEventListener("astro:page-load", initNavigationAnimations);
