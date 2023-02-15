import "../styles/main.css";
import browser, { Tabs } from "webextension-polyfill";
import { SpyglassRpcClient, RawDocType, RawDocumentRequest, RawDocSource } from "lib/rpc";

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function handle_onclick() {
  const el = <HTMLInputElement>document.getElementById("current_url");
  browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs: Array<Tabs.Tab>) => {
      let tab = tabs[0];
      el.value = tab.url || "";
    });

  let client = new SpyglassRpcClient();
  document.addEventListener("click", (e: MouseEvent) => {
    // Grab the current active tab and
    function add_tab(tabs: Array<Tabs.Tab>) {
      if (tabs.length > 0 && tabs[0].id) {
        browser.tabs
          .sendMessage(tabs[0].id, {
            command: "add_uri",
            url: el.value,
          })
          .then(({ content }) => {
            let doc: RawDocumentRequest = {
              url: el.value,
              content,
              doc_type: RawDocType.Html,
              tags: [["lens", "bookmarks"]],
              source: RawDocSource.WebExtension
            };

            client.add_raw_document(doc);
          });
      }
    }

    function reset(tabs: Array<Tabs.Tab>) {
      console.log("reset clicked");
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error: Error) {
      console.error(`Could not add_url: ${error}`);
    }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    if ((<HTMLButtonElement>e.target)?.type === "reset") {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    } else {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(add_tab)
        .catch(reportError);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function handle_error(error: Error) {
  document.querySelector("#popup-content")?.classList.add("hidden");
  document.querySelector("#error-content")?.classList.remove("hidden");
  console.error(`Failed to execute content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "../scripts/contentscript.js" })
  .then(handle_onclick)
  .catch(handle_error);
