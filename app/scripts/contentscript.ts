import browser from "webextension-polyfill";

declare global {
    interface Window {
        hasRun: boolean | null
    }
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

    console.log("Content script ran");
    window.hasRun = true;

    function addURI(url: string) {
      alert(url);
    }

    /**
     * Listen for messages from the background script.
     */
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "add_uri") {
        addURI(message.url);
      } else if (message.command === "reset") {
        console.log("resetting!");
      }
    });
  })();
