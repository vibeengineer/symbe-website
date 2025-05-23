import {
  gsap,
  addManagedEventListener,
  removeAllManagedEventListeners,
  type ManagedEventListener,
} from "../shared/animations";

const mobileEventListeners: ManagedEventListener[] = [];
let isMobileDrawerOpen = false; // State specific to mobile animations

export const initMobileNavigationAnimations = () => {
  removeAllManagedEventListeners(mobileEventListeners);
  isMobileDrawerOpen = false; // Reset state

  const mobileToggle = document.querySelector<HTMLElement>(
    "[data-mobile-toggle]",
  );
  const mobileDrawer = document.querySelector<HTMLElement>(
    "[data-mobile-drawer]",
  );
  const mobileToggleSpan = document.querySelector<HTMLElement>(
    "[data-mobile-toggle-span]",
  );
  const mobileLogo = document.querySelector<HTMLElement>("[data-mobile-logo]");

  // Get hamburger lines
  const topLine = document.querySelector<HTMLElement>(
    "[data-hamburger-line='top']",
  );
  const middleLine = document.querySelector<HTMLElement>(
    "[data-hamburger-line='middle']",
  );
  const bottomLine = document.querySelector<HTMLElement>(
    "[data-hamburger-line='bottom']",
  );

  if (
    !mobileToggle ||
    !mobileDrawer ||
    !topLine ||
    !middleLine ||
    !bottomLine
  ) {
    return; // No mobile nav elements found
  }

  // Get theme from data attribute
  const theme = mobileToggle.getAttribute("data-theme") || "light";

  // Helper function to animate hamburger to X and vice versa
  const animateHamburgerIcon = (isOpen: boolean) => {
    if (isOpen) {
      // Animate to X
      // Hide middle line
      gsap.to(middleLine, {
        autoAlpha: 0,
        duration: 0.15,
        ease: "power2.out",
      });

      // Transform top line to form top part of X
      gsap.to(topLine, {
        y: 7,
        rotation: 45,
        duration: 0.3,
        ease: "power2.out",
      });

      // Transform bottom line to form bottom part of X
      gsap.to(bottomLine, {
        y: -7,
        rotation: -45,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      // Animate back to hamburger
      // Show middle line
      gsap.to(middleLine, {
        autoAlpha: 1,
        duration: 0.15,
        ease: "power2.out",
        delay: 0.1,
      });

      // Reset top line
      gsap.to(topLine, {
        y: 0,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset bottom line
      gsap.to(bottomLine, {
        y: 0,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  // Helper function to set colors based on theme and state
  const setColors = (isOpen: boolean) => {
    // Update hamburger line colors
    const lines = [topLine, middleLine, bottomLine];

    for (const line of lines) {
      if (line) {
        // Remove existing color classes
        line.classList.remove("bg-white", "bg-gray-800");

        if (theme === "light") {
          // Light theme: white when closed, black when open
          if (isOpen) {
            line.classList.add("bg-gray-800");
          } else {
            line.classList.add("bg-white");
          }
        } else {
          // Dark theme: always black
          line.classList.add("bg-gray-800");
        }
      }
    }

    if (mobileLogo) {
      // Remove existing color classes
      mobileLogo.classList.remove("text-white", "text-gray-800");

      if (theme === "light") {
        // Light theme: white when closed, black when open
        if (isOpen) {
          mobileLogo.classList.add("text-gray-800");
        } else {
          mobileLogo.classList.add("text-white");
        }
      } else {
        // Dark theme: always black
        mobileLogo.classList.add("text-gray-800");
      }
    }
  };

  // Initial visual states (idempotent)
  gsap.set(mobileDrawer, { autoAlpha: 0, yPercent: -5 });
  mobileToggle.setAttribute("aria-expanded", "false");
  mobileDrawer.setAttribute("aria-hidden", "true");
  mobileDrawer.classList.remove("open");
  document.body.style.overflow = ""; // Ensure overflow is reset

  // Set initial colors and hamburger state
  setColors(false);
  animateHamburgerIcon(false);

  addManagedEventListener(mobileEventListeners, mobileToggle, "click", () => {
    isMobileDrawerOpen = !isMobileDrawerOpen;
    if (isMobileDrawerOpen) {
      mobileToggle.setAttribute("aria-expanded", "true");
      mobileDrawer.setAttribute("aria-hidden", "false");
      mobileDrawer.classList.add("open");
      document.body.style.overflow = "hidden";

      // Update colors to open state immediately
      setColors(true);
      // Animate hamburger to X
      animateHamburgerIcon(true);

      gsap.to(mobileDrawer, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          const menuItems =
            mobileDrawer.querySelectorAll<HTMLElement>(".flex > *"); // Assuming items are direct children of a flex container
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

      // Animate X back to hamburger
      animateHamburgerIcon(false);

      gsap.to(mobileDrawer, {
        autoAlpha: 0,
        yPercent: -5,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          // Update colors to closed state after drawer animation completes
          setColors(false);
        },
      });
    }
  });

  // Close drawer when a link inside is clicked
  const links = mobileDrawer.querySelectorAll<HTMLElement>("a");
  for (const link of links) {
    addManagedEventListener(mobileEventListeners, link, "click", () => {
      if (isMobileDrawerOpen) {
        // Directly use the toggle's click if available and it's an HTMLElement
        if (
          mobileToggle instanceof HTMLElement &&
          typeof mobileToggle.click === "function"
        ) {
          mobileToggle.click();
        } else {
          // Fallback if click method isn't available (e.g. SVGElement)
          isMobileDrawerOpen = false;
          mobileToggle.setAttribute("aria-expanded", "false");
          mobileDrawer.setAttribute("aria-hidden", "true");
          mobileDrawer.classList.remove("open");
          document.body.style.overflow = "";

          // Animate X back to hamburger
          animateHamburgerIcon(false);

          gsap.to(mobileDrawer, {
            autoAlpha: 0,
            yPercent: -5,
            duration: 0.25,
            onComplete: () => {
              // Update colors to closed state after drawer animation completes
              setColors(false);
            },
          });
        }
      }
    });
  }

  // Close drawer on Escape key press
  const keydownListener = (e: Event) => {
    if ((e as KeyboardEvent).key === "Escape" && isMobileDrawerOpen) {
      if (
        mobileToggle instanceof HTMLElement &&
        typeof mobileToggle.click === "function"
      ) {
        mobileToggle.click();
      }
    }
  };
  addManagedEventListener(
    mobileEventListeners,
    document,
    "keydown",
    keydownListener,
  );
};
