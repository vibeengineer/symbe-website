import gsap from "gsap";

// Track the currently open dropdown
let currentDropdown: HTMLElement | null = null;
let dropdownTimeout: number | null = null;

/**
 * Initialize all navigation animations
 */
const initNavigationAnimations = () => {
  // Desktop navigation
  const desktopNav = document.querySelector('[data-nav="desktop"]');
  const dropdownTriggers = document.querySelectorAll("[data-trigger]");
  const dropdownPanels = document.querySelectorAll("[data-panel]");

  // Mobile navigation
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileDrawer = document.querySelector("[data-mobile-drawer]");

  // Add js-enabled class to enable animations
  document.documentElement.classList.add("js-enabled");

  // Set initial states for dropdowns and mobile menu
  gsap.set(dropdownPanels, {
    autoAlpha: 0,
    y: -10,
    scaleY: 0.95,
    transformOrigin: "top",
  });
  if (mobileDrawer) gsap.set(mobileDrawer, { autoAlpha: 0, yPercent: -5 });

  // Handle dropdown panels
  if (dropdownTriggers.length && dropdownPanels.length) {
    // Create a map of triggers to panels
    const panelMap = new Map<Element, HTMLElement>();

    for (let i = 0; i < dropdownTriggers.length; i++) {
      if (dropdownPanels[i]) {
        panelMap.set(dropdownTriggers[i], dropdownPanels[i] as HTMLElement);
      }
    }

    // Show dropdown on hover
    for (const trigger of dropdownTriggers) {
      const panel = panelMap.get(trigger);
      if (!panel) continue;

      // Create a wrapper around the trigger for better hover detection
      const wrapper = document.createElement("div");
      wrapper.classList.add("dropdown-wrapper");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";

      // Insert the wrapper
      trigger.parentNode?.insertBefore(wrapper, trigger);
      wrapper.appendChild(trigger);

      // Handle mouseenter on trigger
      wrapper.addEventListener("mouseenter", () => {
        // Clear any pending timeout
        if (dropdownTimeout !== null) {
          clearTimeout(dropdownTimeout);
          dropdownTimeout = null;
        }

        // Close any other open dropdown immediately
        if (currentDropdown && currentDropdown !== panel) {
          gsap.to(currentDropdown, {
            autoAlpha: 0,
            y: -10,
            scaleY: 0.95,
            duration: 0.1,
            onComplete: () => {
              // Open the new dropdown
              openDropdown(panel);
            },
          });
        } else if (currentDropdown !== panel) {
          // Open this dropdown if it's not already open
          openDropdown(panel);
        }
      });

      // Handle mouseleave
      wrapper.addEventListener("mouseleave", (e) => {
        // Make sure we're not moving to the panel
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (
          relatedTarget &&
          (relatedTarget === panel || panel.contains(relatedTarget))
        ) {
          return;
        }

        // Use timeout to allow for moving between dropdowns
        dropdownTimeout = window.setTimeout(() => {
          closeDropdown(panel);
        }, 100);
      });

      // Add mouseenter to panel to prevent closing when moving to panel
      panel.addEventListener("mouseenter", () => {
        if (dropdownTimeout !== null) {
          clearTimeout(dropdownTimeout);
          dropdownTimeout = null;
        }
      });

      // Add mouseleave to panel
      panel.addEventListener("mouseleave", (e) => {
        // Make sure we're not moving to the trigger
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (
          relatedTarget &&
          (relatedTarget === trigger || wrapper.contains(relatedTarget))
        ) {
          return;
        }

        closeDropdown(panel);
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
      if (
        currentDropdown &&
        !(e.target as Element).closest(".dropdown-wrapper") &&
        !(e.target as Element).closest("[data-panel]")
      ) {
        closeDropdown(currentDropdown);
      }
    });
  }

  // Helper functions
  function openDropdown(panel: HTMLElement) {
    currentDropdown = panel;
    gsap.to(panel, {
      autoAlpha: 1,
      y: 0,
      scaleY: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  }

  function closeDropdown(panel: HTMLElement) {
    gsap.to(panel, {
      autoAlpha: 0,
      y: -10,
      scaleY: 0.95,
      duration: 0.2,
      onComplete: () => {
        if (currentDropdown === panel) {
          currentDropdown = null;
        }
      },
    });
  }

  // Mobile drawer
  if (mobileToggle && mobileDrawer) {
    let isOpen = false;

    mobileToggle.addEventListener("click", () => {
      isOpen = !isOpen;

      if (isOpen) {
        // Open drawer
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
            // Animate in menu items
            const menuItems = mobileDrawer.querySelectorAll(".flex > *");
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
        // Close drawer
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

    // Close when clicking on links
    const links = mobileDrawer.querySelectorAll("a");
    for (const link of links) {
      link.addEventListener("click", () => {
        if (mobileToggle instanceof HTMLElement) {
          mobileToggle.click();
        } else {
          // Fallback if click() is not available
          isOpen = false;
          mobileToggle.setAttribute("aria-expanded", "false");
          mobileDrawer.setAttribute("aria-hidden", "true");
          mobileDrawer.classList.remove("open");
          document.body.style.overflow = "";

          gsap.to(mobileDrawer, {
            autoAlpha: 0,
            yPercent: -5,
            duration: 0.25,
          });
        }
      });
    }

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        if (mobileToggle instanceof HTMLElement) {
          mobileToggle.click();
        }
      }
    });
  }
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initNavigationAnimations);

// Support Astro View Transitions
document.addEventListener("astro:page-load", initNavigationAnimations);
