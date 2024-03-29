import browser, { Storage } from "webextension-polyfill";
import { Commands } from "lib/cmd";
import { SpyglassRpcClient, RawDocType, RawDocSource } from "lib/rpc";
import {
  sync_bookmarks,
  handle_delete_bookmark,
  handle_new_bookmark,
} from "lib/sync/bookmarks";
import { mark_indexed, mark_unindexed } from "lib/utils";
import { getOrSetStore, StoreKeys } from "storage";
import { handle_error } from "error";

const SPYGLASS_CLIENT = new SpyglassRpcClient();
interface ExtMessage {
  command: string;
  url?: string;
  content?: string;
  err?: Error;
}

function check_and_set_indexed_badge(url: string): Promise<void> {
  mark_unindexed();
  return SPYGLASS_CLIENT.is_document_indexed(url).then((is_indexed) => {
    is_indexed ? mark_indexed() : mark_unindexed();
  });
}

async function handle_tab_url_update(
  _: number,
  changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
  tab: browser.Tabs.Tab
) {
  if (!tab.active) {
    return;
  }

  if (changeInfo.url && tab.url) {
    return check_and_set_indexed_badge(tab.url);
  }
}

async function handle_tab_updated(
  activeInfo: browser.Tabs.OnActivatedActiveInfoType
) {
  // Get the currently active tab
  let tab = await browser.tabs.get(activeInfo.tabId);
  // If this is a new tab with no URL yet, wait until a URL is entered
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

    // Wait for new tab URL to be added to this tab.
    browser.tabs.onUpdated.addListener(handle_tab_url, {
      tabId: tab.id,
      properties: ["url"],
    });
  } else if (tab.url) {
    // check to see if we've already indexed this & add a little badge
    check_and_set_indexed_badge(tab.url);
  }
}

function handle_message(message: ExtMessage) {
  console.debug("handling message: ", message);
  if (message.command == Commands.ResyncBookmarks) {
    // Reset last sync time
    return browser.storage.local
      .set({ [StoreKeys.BookmarksSyncTime]: 0 })
      .then(() => browser.bookmarks.getTree())
      .then((bmarks) => sync_bookmarks(bmarks, true))
      .catch(handle_error);
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
}

function handle_storage_changes(
  changes: Storage.StorageAreaOnChangedChangesType
) {
  if (changes[StoreKeys.BookmarksSyncIsEnabled]) {
    let change = changes[StoreKeys.BookmarksSyncIsEnabled];
    if (!change.newValue) {
      browser.alarms.clear("bookmark_sync_alarm");
      browser.bookmarks.onCreated.removeListener(handle_new_bookmark);
      browser.bookmarks.onRemoved.removeListener(handle_delete_bookmark);
    } else {
      setup_bookmark_syncer();
    }
  }
}

function setup_bookmark_syncer() {
  browser.alarms.create("bookmark_sync_alarm", {
    // immediately kicks off a sync on load
    when: Date.now() + (1000 + 1),
    // then every hour
    periodInMinutes: 60 * 1,
  });
  browser.bookmarks.onCreated.addListener(handle_new_bookmark);
  browser.bookmarks.onRemoved.addListener(handle_delete_bookmark);
}

// Listen to webext messages sent by content scripts/popup
browser.runtime.onMessage.addListener(handle_message);
// Listen for when the active tab changes
browser.tabs.onActivated.addListener(handle_tab_updated);

if (process.env.VENDOR == "firefox") {
  browser.tabs.onUpdated.addListener(handle_tab_url_update, {
    properties: ["url"],
  });
} else {
  browser.tabs.onUpdated.addListener(handle_tab_url_update);
}

getOrSetStore<boolean>(StoreKeys.BookmarksSyncIsEnabled, true).then(
  (is_enabled) => {
    if (!is_enabled) {
      return;
    }

    // Listen for new/updated/removed bookmarks & sync.
    setup_bookmark_syncer();
  }
);

browser.storage.local.onChanged.addListener(handle_storage_changes);
// Listen to bookmark sync alarms
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == "bookmark_sync_alarm") {
    // Walk through bookmarks and sync w/ Spyglass
    browser.bookmarks
      .getTree()
      .then((bmarks) => sync_bookmarks(bmarks, false))
      .catch(handle_error);
  } else if (alarm.name == "history_sync_alarm") {
    // Walk through bookmarks and sync w/ Spyglass
  }
});

// setup_history_syncer();
console.info("background script loaded");
