import { initDesktopNavigationAnimations } from "./desktop/animations";
import { initMobileNavigationAnimations } from "./mobile/animations";

const initAllNavigationAnimations = () => {
  // Ensure JS is enabled class is on HTML for CSS selectors
  if (!document.documentElement.classList.contains("js-enabled")) {
    document.documentElement.classList.add("js-enabled");
  }

  initDesktopNavigationAnimations();
  initMobileNavigationAnimations();
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initAllNavigationAnimations);
// Support Astro View Transitions
document.addEventListener("astro:page-load", initAllNavigationAnimations);

export { initAllNavigationAnimations };
