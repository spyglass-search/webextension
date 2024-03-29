import "../styles/main.css";
import * as React from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import browser, { Tabs as BrowserTabs } from "webextension-polyfill";

import { SpyglassRpcClient } from "lib/rpc";

import { AddTab } from "pages/AddTab";
import { SyncBookmarks } from "pages/SyncBookmarks";
// import { SyncHistory } from "pages/SyncHistory";

const SPYGLASS_CLIENT = new SpyglassRpcClient();

const App = () => {
  let [current_url, set_current_url] = useState<string>("");
  let [is_indexed, set_is_indexed] = useState<boolean>(false);
  let [tab_idx, set_tab_idx] = useState(0);

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
  }, []);

  function tabClasses(idx: number) {
    return {
      "cursor-pointer": true,
      "border-b-2": true,
      "px-4": true,
      "pb-2": true,
      "hover:border-cyan-500": true,
      "hover:text-white": true,
      "outline-none": true,
      // no selected classes
      "border-neutral-900": idx != tab_idx,
      "text-neutral-400": idx != tab_idx,
      // selected tab classes
      "border-cyan-500": idx == tab_idx,
      "text-white": idx == tab_idx,
    };
  }

  return (
    <Tabs
      className="bg-neutral-900"
      selectedIndex={tab_idx}
      onSelect={(idx) => set_tab_idx(idx)}
    >
      <TabList className="px-4 pt-4 flex flex-row gap-4 text-white text-sm">
        <Tab className={tabClasses(0)}>Add Current Tab</Tab>
        <Tab className={tabClasses(1)}>Sync Bookmarks</Tab>
        {/* <Tab className={tabClasses(2)}>Sync History</Tab> */}
      </TabList>
      <TabPanel className="bg-stone-800">
        <AddTab current_url={current_url} is_indexed={is_indexed} />
      </TabPanel>
      <TabPanel className="bg-stone-800">
        <SyncBookmarks />
      </TabPanel>
      {/* <TabPanel className="bg-stone-800">
        <SyncHistory />
      </TabPanel> */}
    </Tabs>
  );
};

/**
 * When the popup loads, inject a content script into the active tab,
 * If we couldn't inject the script, handle the error.
 */
let script_loc = "scripts/contentscript.js";
if (process.env.VENDOR == "firefox") {
  script_loc = "../scripts/contentscript.js";
}

browser.tabs
  .query({ active: true, lastFocusedWindow: true })
  .then((tabs) =>
    browser.scripting.executeScript({
      target: { tabId: tabs[0].id as number },
      files: [script_loc],
    })
  )
  .then(() => {
    //
    // todo: run a quick check to see if spyglass is running before rendering anything
    //
    const container = document.getElementById("root");
    const root = createRoot(container!);
    root.render(<App />);
  })
  .catch((err) => {
    const container = document.getElementById("root");
    const root = createRoot(container!);
    root.render(
      <div className="bg-neutral-900 text-red-700 p-4 font-bold">
        <div>The extension was unable index the current tab.</div>
        <div>{`${err}`}</div>
      </div>
    );
  });
