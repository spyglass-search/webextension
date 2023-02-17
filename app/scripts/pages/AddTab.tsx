import browser, { Tabs as BrowserTabs } from "webextension-polyfill";
import * as React from "react";
import { SearchIcon, TrashIcon } from "components/icons";
import { Commands } from "lib/cmd";

type AddTabProps = {
  current_url: string;
  is_indexed: boolean;
};

function handle_add() {
  function add_tab(tabs: Array<BrowserTabs.Tab>) {
    if (tabs.length > 0 && tabs[0].id && tabs[0].url) {
      let url = tabs[0].url;
      browser.tabs
        .sendMessage(tabs[0].id, {
          command: Commands.GetTabContent,
          url,
        })
        .then(({ content }) =>
          browser.runtime.sendMessage({
            command: Commands.AddDoc,
            url,
            content,
          })
        )
        .then(() => window.close());
    }
  }

  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(add_tab)
    .catch(reportError);
}

const UnindexedContent = () => (
  <div>
    <div className="text-xs text-neutral-400">
      Use the
      <div className="inline-block rounded bg-cyan-500 py-0.5 px-1 text-white gap-0 mx-1">
        <SearchIcon />
        <span>bookmarks</span>
      </div>
      lens to filter URLs from this extension.
    </div>
    <div className="mt-4 flex flex-row place-content-end gap-2 text-base">
      <button
        type="button"
        className="rounded py-2 px-3 bg-green-700 hover:bg-green-900"
        onClick={handle_add}
      >
        Add to Spyglass
      </button>
    </div>
  </div>
);

function handle_remove_doc() {
  function remove_tab(tabs: Array<BrowserTabs.Tab>) {
    if (tabs.length > 0 && tabs[0].id && tabs[0].url) {
      let url = tabs[0].url;
      return browser.runtime
        .sendMessage({
          command: Commands.RemoveDoc,
          url,
        })
        .then(() => window.close());
    }
  }

  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(remove_tab)
    .catch(reportError);
}

const IndexedContent = () => {
  return (
    <div>
      <div className="text-sm text-red-400">
        This URL is already in your library.
      </div>
      <div className="mt-4 flex flex-row place-content-end gap-2 text-base">
        <button
          type="button"
          onClick={handle_remove_doc}
          className="rounded py-2 px-3 border border-red-700 hover:bg-red-700 text-red-500 hover:text-white"
        >
          <div className="flex flex-row gap-1 items-center mx-auto">
            <TrashIcon />
            Remove from library
          </div>
        </button>
      </div>
    </div>
  );
};

export const AddTab = ({ current_url, is_indexed }: AddTabProps) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <input
        className="w-full rounded p-2 text-sm text-white dark:bg-neutral-600 outline-none"
        type="text"
        placeholder="Tab URL"
        readOnly={true}
        value={current_url}
      />
      {is_indexed ? <IndexedContent /> : <UnindexedContent />}
    </div>
  );
};
