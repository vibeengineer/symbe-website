import { run } from "vanilla-cookieconsent";

// Default configuration - this can be extensively customized
// See: https://cookieconsent.orestbida.com/reference/configuration-reference.html
run({
  guiOptions: {
    consentModal: {
      layout: "box",
      position: "bottom right",
      flipButtons: false,
      equalWeightButtons: true,
    },
    preferencesModal: {
      layout: "box",
      flipButtons: false,
      equalWeightButtons: true,
    },
  },
  categories: {
    necessary: {
      enabled: true, // Always enabled
      readOnly: true, // User can't disable
    },
    analytics: {
      // Enabled by default. User can disable.
      // autoClear: {
      //   cookies: [
      //     { name: /^_ga/, }, // Google Analytics
      //     { name: '_gid', }, // Google Analytics
      //   ],
      // },
    },
    marketing: {},
  },
  language: {
    default: "en",
    translations: {
      en: {
        consentModal: {
          title: "We use cookies!",
          description:
            'Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="#privacy-policy" class="cc__link">Privacy policy</a>',
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          showPreferencesBtn: "Manage preferences",
          //closeIconLabel: 'Close',
          //footer: `
          //  <a href="#your-link">Link 1</a>
          //  <a href="#your-link">Link 2</a>
          //`
        },
        preferencesModal: {
          title: "Cookie Preferences",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          savePreferencesBtn: "Save preferences",
          closeIconLabel: "Close",
          //sections: [
          //  // ...
          //]
          sections: [
            {
              title: "Cookie Usage",
              description:
                'We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#privacy-policy" class="cc__link">privacy policy</a>.',
            },
            {
              title: "Strictly Necessary Cookies",
              description:
                "These cookies are essential for the proper functioning of the website. Without these cookies, the website cannot function properly.",
              linkedCategory: "necessary",
            },
            {
              title: "Performance and Analytics Cookies",
              description:
                "These cookies allow the website to remember the choices you have made in the past.",
              linkedCategory: "analytics",
              // cookieTable: {
              //   // ...
              // }
            },
            {
              title: "Advertisement and Targeting Cookies",
              description:
                "These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you.",
              linkedCategory: "marketing",
            },
            {
              title: "More Information",
              description:
                'For any queries in relation to our policy on cookies and your choices, please <a href="#contact-us" class="cc__link">contact us</a>.',
            },
          ],
        },
      },
    },
  },

  // Example of how to use callbacks:
  // onFirstConsent: ({ cookie }) => {
  //   console.log('onFirstConsent fired', cookie);
  // },
  // onConsent: ({ cookie }) => {
  //   console.log('onConsent fired', cookie);
  // },
  // onChange: ({ cookie, changedCategories, changedServices }) => {
  //   console.log('onChange fired', cookie, changedCategories, changedServices);
  // },
});
