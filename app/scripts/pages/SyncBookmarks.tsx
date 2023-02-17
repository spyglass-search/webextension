import browser from "webextension-polyfill";
import * as React from "react";
import { useEffect, useState } from "react";
import { Commands } from "lib/cmd";
import { getStore, StoreKeys } from "storage";

export const SyncBookmarks = () => {
  let [last_synced, set_last_synced] =
    useState<Date | null>(null);
  let [num_synced, set_num_synced] = useState<number | null>(null);

  useEffect(() => {
    getStore<Date>(StoreKeys.BookmarksSyncTime).then(v => set_last_synced(v));
    getStore<number>(StoreKeys.BookmarksNumSynced).then(v => set_num_synced(v));
  });
  function handle_resync_bookmarks() {
    return browser.runtime.sendMessage({
      command: Commands.ResyncBookmarks,
    });
  }

  return (
    <div className="content p-4" id="content_bookmarks">
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
          type="button"
          className="ml-auto rounded py-1 px-2 bg-neutral-500 hover:bg-neutral-600 text-sm"
          onClick={handle_resync_bookmarks}
        >
          Sync Bookmarks Now
        </button>
      </div>
    </div>
  );
};
