import {
  gsap,
  addManagedEventListener,
  removeAllManagedEventListeners,
  type ManagedEventListener,
} from "../shared/animations";

// Module-level state for the dropdown, specific to desktop
let currentDropdown: HTMLElement | null = null;
let dropdownTimeoutId: number | null = null;
const desktopEventListeners: ManagedEventListener[] = [];

// Helper to actually perform the opening animation for a panel
function _animatePanelOpen(panel: HTMLElement) {
  currentDropdown = panel; // It's now officially the current one

  gsap.killTweensOf(panel);
  const chevronToOpen = panel
    .closest("[data-dropdown-wrapper]")
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

function closeDropdown(
  panelToClose: HTMLElement,
  onClosedCallback?: () => void,
) {
  gsap.killTweensOf(panelToClose);
  const chevronToClose = panelToClose
    .closest("[data-dropdown-wrapper]")
    ?.querySelector<HTMLElement>("[data-chevron]");
  if (chevronToClose) gsap.killTweensOf(chevronToClose);

  gsap.to(panelToClose, {
    autoAlpha: 0,
    y: -10,
    scaleY: 0.95,
    duration: 0.2,
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

function requestOpenDropdown(panelToOpen: HTMLElement) {
  cancelCloseTimer();

  if (currentDropdown === panelToOpen) {
    gsap.killTweensOf(panelToOpen);
    const chevron = panelToOpen
      .closest("[data-dropdown-wrapper]")
      ?.querySelector<HTMLElement>("[data-chevron]");
    if (chevron) gsap.killTweensOf(chevron);
    _animatePanelOpen(panelToOpen);
    return;
  }

  if (currentDropdown) {
    const dropdownToActuallyClose = currentDropdown;
    closeDropdown(dropdownToActuallyClose, () => {
      _animatePanelOpen(panelToOpen);
    });
  } else {
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

export const initDesktopNavigationAnimations = () => {
  removeAllManagedEventListeners(desktopEventListeners);
  if (currentDropdown) {
    gsap.set(currentDropdown, { autoAlpha: 0 });
    currentDropdown = null;
  }
  if (dropdownTimeoutId !== null) {
    clearTimeout(dropdownTimeoutId);
    dropdownTimeoutId = null;
  }

  const dropdownPanels = document.querySelectorAll<HTMLElement>(
    "nav[data-nav='desktop'] [data-panel]",
  );
  if (dropdownPanels.length === 0) return; // No desktop nav elements found

  gsap.set(dropdownPanels, {
    autoAlpha: 0,
    y: -10,
    scaleY: 0.95,
    transformOrigin: "top",
  });

  const chevrons = document.querySelectorAll<HTMLElement>(
    "nav[data-nav='desktop'] [data-chevron]",
  );
  gsap.set(chevrons, { rotation: 0 });

  const wrappers = document.querySelectorAll<HTMLElement>(
    "nav[data-nav='desktop'] [data-dropdown-wrapper]",
  );
  for (const wrapper of wrappers) {
    const trigger = wrapper.querySelector<HTMLElement>("[data-trigger]");
    const panel = wrapper.querySelector<HTMLElement>("[data-panel]");

    if (!trigger || !panel) {
      continue;
    }

    addManagedEventListener(
      desktopEventListeners,
      wrapper,
      "mouseenter",
      () => {
        cancelCloseTimer();
        requestOpenDropdown(panel);
      },
    );

    addManagedEventListener(
      desktopEventListeners,
      wrapper,
      "mouseleave",
      () => {
        startCloseTimer(panel);
      },
    );

    addManagedEventListener(desktopEventListeners, panel, "mouseenter", () => {
      cancelCloseTimer();
    });

    addManagedEventListener(desktopEventListeners, panel, "mouseleave", () => {
      startCloseTimer(panel);
    });
  }

  // Close dropdowns when clicking outside logic, specific to desktop
  addManagedEventListener(desktopEventListeners, document, "click", (e) => {
    if (currentDropdown && e.target instanceof Element) {
      const currentOpenDropdownWrapper = currentDropdown.closest(
        "[data-dropdown-wrapper]",
      );
      // Check if the click is outside the current open dropdown wrapper
      if (
        currentOpenDropdownWrapper &&
        !currentOpenDropdownWrapper.contains(e.target)
      ) {
        cancelCloseTimer();
        closeDropdown(currentDropdown);
      } else if (!currentOpenDropdownWrapper) {
        // This case might happen if the panel is not inside a [data-dropdown-wrapper]
        // or if the structure is different than expected. Close it just in case.
        cancelCloseTimer();
        closeDropdown(currentDropdown);
      }
    }
  });
};
