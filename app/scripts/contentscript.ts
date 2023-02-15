import browser from "webextension-polyfill";

declare global {
  interface Window {
    hasRun: boolean | null;
  }
}

function handle_add_uri() {
  let content = document.documentElement.innerHTML;
  return Promise.resolve({ content });
}

(() => {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }

  console.log("contentscript loaded!");
  window.hasRun = true;

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "add_uri") {
      return handle_add_uri();
    }

    return true;
  });
})();
