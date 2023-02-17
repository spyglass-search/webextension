import browser from "webextension-polyfill";
import * as React from "react";
import { useEffect, useState } from "react";
import { Commands } from "lib/cmd";
import { getOrSetStore, getStore, setStore, StoreKeys } from "storage";
import { RefreshIcon } from "components/icons";

export const SyncBookmarks = () => {
  let [last_synced, set_last_synced] = useState<Date | null>(null);
  let [is_enabled, set_is_enabled] = useState<boolean>(false);
  let [num_synced, set_num_synced] = useState<number | null>(null);
  let [is_syncing, set_is_syncing] = useState<boolean>(false);

  useEffect(() => {
    getOrSetStore<boolean>(StoreKeys.BookmarksSyncIsEnabled, true).then((v) =>
      set_is_enabled(v)
    );
    getStore<Date>(StoreKeys.BookmarksSyncTime).then((v) => set_last_synced(v));
    getStore<number>(StoreKeys.BookmarksNumSynced).then((v) =>
      set_num_synced(v)
    );
  });

  function toggle_sync() {
    return getOrSetStore<boolean>(StoreKeys.BookmarksSyncIsEnabled, true).then(
      (value) => {
        set_is_enabled(!value);
        return setStore<boolean>(StoreKeys.BookmarksSyncIsEnabled, !value);
      }
    );
  }

  function handle_resync_bookmarks() {
    set_is_syncing(true);
    return browser.runtime
      .sendMessage({
        command: Commands.ResyncBookmarks,
      })
      .then(() => set_is_syncing(false));
  }

  let enabledContent = (
    <div className="flex flex-row items-center mb-4">
      <div className="text-sm">
        <div>
          Last synced:
          <span className="text-cyan-500 ml-1">
            {last_synced ? last_synced.toLocaleString() : "Not synced yet"}
          </span>
        </div>
        <div>
          Total Synced:
          <span className="text-cyan-500 ml-1">
            {num_synced ? num_synced : "Not synced yet"}
          </span>
        </div>
      </div>
      <button
        disabled={is_syncing}
        type="button"
        className="ml-auto rounded py-2 px-3 bg-neutral-500 hover:bg-neutral-600 text-sm disabled:text-stone-400"
        onClick={handle_resync_bookmarks}
      >
        <div className="flex flex-row gap-1 items-center mx-auto">
          <RefreshIcon
            className={`h-4 w-4 ${is_syncing ? "animate-spin" : ""}`}
          />
          Sync Bookmarks
        </div>
      </button>
    </div>
  );

  return (
    <div className="p-4 flex flex-col">
      <div className="flex flex-row mb-4">
        <span
          className="cursor-pointer text-base font-medium text-gray-900 dark:text-gray-300"
          onClick={() => toggle_sync()}
        >
          Enable/Disable bookmark syncing
        </span>
        <label className="relative inline-flex items-center cursor-pointer ml-auto">
          <input
            readOnly={true}
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={is_enabled}
            onClick={() => toggle_sync()}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {is_enabled ? enabledContent : null}
    </div>
  );
};
