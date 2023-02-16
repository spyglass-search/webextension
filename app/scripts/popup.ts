import "../styles/main.css";
import browser, { browserAction, Tabs } from "webextension-polyfill";
import { Commands } from "lib/cmd";
import {
  SpyglassRpcClient,
  RawDocType,
  RawDocumentRequest,
  RawDocSource,
} from "lib/rpc";

const CURRENT_URL_BOX = document.getElementById(
  "current_url"
) as HTMLInputElement;
const SPYGLASS_CLIENT = new SpyglassRpcClient();

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function handle_on_popup() {
  browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs: Array<Tabs.Tab>) => {
      let tab = tabs[0];
      CURRENT_URL_BOX.value = tab.url || "";
    });

  document.addEventListener("click", (e: MouseEvent) => {
    // Grab the current active tab and
    function add_tab(tabs: Array<Tabs.Tab>) {
      if (tabs.length > 0 && tabs[0].id) {
        browser.tabs
          .sendMessage(tabs[0].id, {
            command: Commands.AddDoc,
            url: CURRENT_URL_BOX.value,
          })
          .then(({ content }) => {
            let doc: RawDocumentRequest = {
              url: CURRENT_URL_BOX.value,
              content,
              doc_type: RawDocType.Html,
              tags: [["lens", "bookmarks"]],
              source: RawDocSource.WebExtension,
            };

            return SPYGLASS_CLIENT.add_raw_document(doc);
          });
      }
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error: Error) {
      console.error(`Could not add_url: ${error}`);
    }

    /**
     * Handle button clicks
     */
    let btn_id = (e.target as HTMLButtonElement)?.id;
    if (btn_id === "cancel") {
      window.close();
    } else if (btn_id === "add") {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(add_tab)
        .catch(reportError);
    } else if (btn_id === "resync_bookmarks") {
      browser.runtime.sendMessage({ command: Commands.ResyncBookmarks });
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
  .then(handle_on_popup)
  .catch(handle_error);

// Handle the different content tabs
function reset_tabs() {
  for (const div of document.querySelectorAll(".content")) {
    let el = div as HTMLElement;
    el.classList.add("hidden");
  }

  for (const div of document.querySelectorAll(".nav")) {
    let el = div as HTMLElement;
    el.classList.replace("border-cyan-500", "border-neutral-900");
    el.classList.replace("text-white", "text-neutral-400");
  }
}

function switch_to_tab(tab: HTMLElement, content: Element) {
  tab.classList.replace("border-neutral-900", "border-cyan-500");
  tab.classList.replace("text-neutral-400", "text-white");
  content.classList.remove("hidden");
}

function handle_tab_change(e: MouseEvent) {
  if (e.target) {
    let tab = (e.target as HTMLElement).getAttribute("data-tab");
    if (tab) {
      // hide previous tab
      reset_tabs();
      // switch to new tab
      switch_to_tab(
        e.target as HTMLElement,
        document.getElementById(tab) as HTMLElement
      );
    }
  }
}

for (const id of ["add", "bookmarks", "history"]) {
  document
    .getElementById(`tab_${id}`)
    ?.addEventListener("click", handle_tab_change);
}
