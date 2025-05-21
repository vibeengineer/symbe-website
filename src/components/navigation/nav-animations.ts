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

  // Helper to actually perform the opening animation for a panel
  function _animatePanelOpen(panel: HTMLElement) {
    currentDropdown = panel; // It's now officially the current one

    // Kill any stray animations on this panel or its chevron before opening
    gsap.killTweensOf(panel);
    const chevronToOpen = panel
      .closest(".dropdown-wrapper")
      ?.querySelector<HTMLElement>("[data-chevron]");
    if (chevronToOpen) gsap.killTweensOf(chevronToOpen);

    gsap.to(panel, {
      autoAlpha: 1,
      y: 0,
      scaleY: 1,
      duration: 0.2,
      ease: "power2.out",
    });
    if (chevronToOpen) {
      gsap.to(chevronToOpen, { rotation: 180, duration: 0.15 });
    }
  }

  // Modified closeDropdown function
  function closeDropdown(
    panelToClose: HTMLElement,
    onClosedCallback?: () => void,
  ) {
    // Kill any stray animations on this panel or its chevron before closing
    gsap.killTweensOf(panelToClose);
    const chevronToClose = panelToClose
      .closest(".dropdown-wrapper")
      ?.querySelector<HTMLElement>("[data-chevron]");
    if (chevronToClose) gsap.killTweensOf(chevronToClose);

    gsap.to(panelToClose, {
      autoAlpha: 0,
      y: -10,
      scaleY: 0.95,
      duration: 0.2, // Closing animation duration
      onComplete: () => {
        if (currentDropdown === panelToClose) {
          currentDropdown = null;
        }
        if (onClosedCallback) {
          onClosedCallback();
        }
      },
    });
    if (chevronToClose) {
      gsap.to(chevronToClose, { rotation: 0, duration: 0.15 });
    }
  }

  // Renamed and revised from original openDropdown
  function requestOpenDropdown(panelToOpen: HTMLElement) {
    cancelCloseTimer(); // Always cancel any pending auto-close first.

    if (currentDropdown === panelToOpen) {
      // Re-hovering the trigger of the currently active/intended dropdown.
      // Ensure it's opening or stays open.
      gsap.killTweensOf(panelToOpen); // Stop any animation (e.g., closing)
      const chevron = panelToOpen
        .closest(".dropdown-wrapper")
        ?.querySelector<HTMLElement>("[data-chevron]");
      if (chevron) gsap.killTweensOf(chevron);

      _animatePanelOpen(panelToOpen); // If already open, GSAP handles it gracefully.
      return;
    }

    // If we are here, panelToOpen is different from currentDropdown (or currentDropdown is null)
    if (currentDropdown) {
      // Implicitly, currentDropdown !== panelToOpen
      const dropdownToActuallyClose = currentDropdown;
      closeDropdown(dropdownToActuallyClose, () => {
        // AFTER the old one has finished closing
        _animatePanelOpen(panelToOpen);
      });
    } else {
      // No dropdown is currently open, so just open the new one.
      _animatePanelOpen(panelToOpen);
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
      requestOpenDropdown(panel);
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
