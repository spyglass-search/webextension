import "../styles/main.css";
import * as React from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import browser, { Tabs as BrowserTabs } from "webextension-polyfill";

import { SpyglassRpcClient } from "lib/rpc";
import { StoreKeys, getStore } from "storage";
import { handle_error } from "error";

import { AddTab } from "pages/AddTab";
import { SyncBookmarks } from "pages/SyncBookmarks";
import { SyncHistory } from "pages/SyncHistory";

const SPYGLASS_CLIENT = new SpyglassRpcClient();

const App = () => {
  let [current_url, set_current_url] = useState<string>("");
  let [is_indexed, set_is_indexed] = useState<boolean>(false);
  let [bookmarks_last_synced, set_bookmarks_last_synced] =
    useState<Date | null>(null);
  let [history_last_synced, set_history_last_synced] = useState<Date | null>(
    null
  );

  useEffect(() => {
    // On load, grab the url for the active tab & check against spyglass.
    browser.tabs
      .query({ currentWindow: true, active: true })
      .then((tabs: Array<BrowserTabs.Tab>) => {
        if (tabs[0]?.url) {
          set_current_url(tabs[0].url);
          return SPYGLASS_CLIENT.is_document_indexed(tabs[0].url).then(
            (result) => set_is_indexed(result)
          );
        }
      });

    getStore<Date>(StoreKeys.BookmarksSyncTime).then((value) =>
      set_bookmarks_last_synced(value)
    );

    getStore<Date>(StoreKeys.HistorySyncTime).then((value) =>
      set_history_last_synced(value)
    );
  }, []);

  let tabClass =
    "cursor-pointer border-b-2 border-neutral-900 px-4 pb-2 text-neutral-400 hover:border-cyan-500 hover:text-white focus:outline-none";
  return (
    <Tabs className="bg-neutral-900">
      <TabList className="px-4 pt-4 flex flex-row gap-4 text-white text-sm">
        <Tab
          className={tabClass}
          selectedClassName="border-cyan-500 text-white"
        >
          Add Current Tab
        </Tab>
        <Tab
          className={tabClass}
          selectedClassName="border-cyan-500 text-white"
        >
          Sync Bookmarks
        </Tab>
        <Tab
          className={tabClass}
          selectedClassName="border-cyan-500 text-white"
        >
          Sync History
        </Tab>
      </TabList>
      <TabPanel className="bg-stone-800">
        <AddTab current_url={current_url} is_indexed={is_indexed} />
      </TabPanel>
      <TabPanel className="bg-stone-800">
        <SyncBookmarks last_synced={bookmarks_last_synced} />
      </TabPanel>
      <TabPanel className="bg-stone-800">
        <SyncHistory last_synced={history_last_synced} />
      </TabPanel>
    </Tabs>
  );
};

/**
 * When the popup loads, inject a content script into the active tab,
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "../scripts/contentscript.js" })
  .then(() => {
    //
    // todo: run a quick check to see if spyglass is running before rendering anything
    //
    const container = document.getElementById("root");
    const root = createRoot(container!);
    root.render(<App />);
  })
  .catch(handle_error);
