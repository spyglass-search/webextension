import browser from "webextension-polyfill";
import { Commands } from "lib/cmd";

declare global {
  interface Window {
    hasRun: boolean | null;
  }
}

// Grabs the content of page for indexing
function handle_get_tab_content() {
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

  console.debug("contentscript loaded!");
  window.hasRun = true;

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === Commands.GetTabContent) {
      return handle_get_tab_content();
    }

    return true;
  });
})();
