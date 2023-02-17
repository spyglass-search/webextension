import browser, { Tabs as BrowserTabs } from "webextension-polyfill";
import * as React from "react";
import { useState } from "react";
import { SearchIcon, TrashIcon } from "components/icons";
import { Commands } from "lib/cmd";

type AddTabProps = {
  current_url: string;
  is_indexed: boolean;
};

const UnindexedContent = () => {
  let [errorMsg, setError] = useState<string | null>(null);

  function handle_add() {
    function add_tab(tabs: Array<BrowserTabs.Tab>) {
      if (tabs.length > 0 && tabs[0].id && tabs[0].url) {
        let url = tabs[0].url;
        if (url.startsWith("about:")) {
          setError("Unable to index special pages");
          return;
        }

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
          .then(() => window.close())
          .catch((err: Error) => setError(err.message));
      }
    }

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(add_tab)
      .catch((err: Error) => setError(err.message));
  }

  return (
    <div>
      <div className="text-sm text-neutral-400">
        Use the
        <div className="inline-block rounded bg-cyan-500 py-0.5 px-1 text-white gap-0 mx-1">
          <SearchIcon />
          <span>bookmarks</span>
        </div>
        lens to filter URLs from this extension.
      </div>
      <div className="mt-4 flex flex-row place-content-end gap-2 text-base items-center">
        <div className="text-red-700 mr-auto">{errorMsg}</div>
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
};

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
    <div className="flex flex-row place-content-end gap-2 text-base items-center">
      <div className="text-base text-red-400 mr-auto">
        This URL is in your library.
      </div>
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
  );
};

export const AddTab = ({ current_url, is_indexed }: AddTabProps) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <input
        className="w-full rounded p-2 text-base text-white dark:bg-neutral-600 outline-none"
        type="text"
        placeholder="Tab URL"
        readOnly={true}
        value={current_url}
      />
      {is_indexed ? <IndexedContent /> : <UnindexedContent />}
    </div>
  );
};
