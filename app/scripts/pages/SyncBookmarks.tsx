import browser from "webextension-polyfill";
import * as React from "react";
import { Commands } from "lib/cmd";

type SyncBookmarksProps = {
  last_synced: Date | null;
};

export const SyncBookmarks = ({ last_synced }: SyncBookmarksProps) => {
  function handle_resync_bookmarks() {
    return browser.runtime.sendMessage({
      command: Commands.ResyncBookmarks,
    });
  }

  return (
    <div className="content p-4" id="content_bookmarks">
      <div className="flex flex-row items-center mb-4">
        <div className="text-sm">
          Last synced:
          <span className="text-cyan-500 ml-1">
            {last_synced ? last_synced.toLocaleString() : "Not synced yet"}
          </span>
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
