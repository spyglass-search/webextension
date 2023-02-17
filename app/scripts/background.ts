import browser, { browserAction } from "webextension-polyfill";
import { Commands } from "lib/cmd";
import { SpyglassRpcClient, RawDocType, RawDocSource } from "lib/rpc";
import {
  sync_bookmarks,
  handle_delete_bookmark,
  handle_new_bookmark,
} from "lib/sync/bookmarks";

const SPYGLASS_CLIENT = new SpyglassRpcClient();

function mark_indexed() {
  browserAction.setBadgeText({ text: "✓" });
  browserAction.setBadgeTextColor({ color: "white" });
  browserAction.setBadgeBackgroundColor({ color: "rgb(21 128 61)" });
}

function mark_unindexed() {
  browserAction.setBadgeText({ text: null });
  browserAction.setBadgeBackgroundColor({ color: null });
}

function check_and_set_indexed_badge(url: string): Promise<void> {
  return SPYGLASS_CLIENT.is_document_indexed(url).then((is_indexed) => {
    is_indexed ? mark_indexed() : mark_unindexed();
  });
}

async function handle_tab_updated(
  activeInfo: browser.Tabs.OnActivatedActiveInfoType
) {
  let tab = await browser.tabs.get(activeInfo.tabId);
  if (tab.url && (tab.url == "about:newtab" || tab.url == "about:blank")) {
    function handle_tab_url(
      _: number,
      changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
      newTab: browser.Tabs.Tab
    ) {
      if (changeInfo.url && newTab.url) {
        check_and_set_indexed_badge(newTab.url).then(() =>
          browser.tabs.onUpdated.removeListener(handle_tab_url)
        );
      }
    }

    browser.tabs.onUpdated.addListener(handle_tab_url, {
      tabId: tab.id,
      properties: ["url"],
    });
  } else if (tab.url) {
    check_and_set_indexed_badge(tab.url);
  }
}

function handle_error(error: Error) {
  console.error(error);
}

browser.runtime.onMessage.addListener((message) => {
  console.debug("handling message: ", message);
  if (message.command == Commands.ResyncBookmarks) {
    // Reset last sync time
    return browser.storage.local
      .set({ BOOKMARKS_SYNC_TIME: new Date(0) })
      .then(() => browser.bookmarks.getTree())
      .then(sync_bookmarks, handle_error);
  } else if (message.command == Commands.RemoveDoc && message.url) {
    return SPYGLASS_CLIENT.delete_document(message.url).then(() =>
      mark_unindexed()
    );
  } else if (
    message.command == Commands.AddDoc &&
    message.url &&
    message.content
  ) {
    return SPYGLASS_CLIENT.add_raw_document({
      url: message.url,
      content: message.content,
      doc_type: RawDocType.Html,
      tags: [["lens", "bookmarks"]],
      source: RawDocSource.WebExtension,
    }).then(() => mark_indexed());
  }
});

// Walk through bookmarks and sync w/ Spyglass
browser.bookmarks.getTree().then(sync_bookmarks, handle_error);

// Listen for new/updated/removed bookmarks & sync.
browser.bookmarks.onCreated.addListener(handle_new_bookmark);
browser.bookmarks.onRemoved.addListener(handle_delete_bookmark);
// Walk through history & sync w/ Spyglass

// Listen for when the active tab changes
browser.tabs.onActivated.addListener(handle_tab_updated);

console.info("background script loaded");
