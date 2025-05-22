// @ts-nocheck
export function initUnicornStudio() {
  if (!window.UnicornStudio) {
    window.UnicornStudio = { isInitialized: false };
    const script = document.createElement("script");
    script.src = "/js/unicorn-studio.umd.js";
    script.onload = () => {
      if (!window.UnicornStudio.isInitialized) {
        UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
    };
    (document.head || document.body).appendChild(script);
  }
}
