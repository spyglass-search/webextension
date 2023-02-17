import * as React from "react";
import { useEffect, useState } from "react";
import { getStore, StoreKeys } from "storage";

export const SyncHistory = () => {
  let [last_synced, set_last_synced] = useState<Date | null>(null);
  let [num_synced, set_num_synced] = useState<number | null>(null);

  useEffect(() => {
    getStore<Date>(StoreKeys.HistorySyncTime).then((v) => set_last_synced(v));
    getStore<number>(StoreKeys.HistoryNumSynced).then((v) => set_num_synced(v));
  });

  return (
    <div className="content p-4">
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
        >
          Sync History Now
        </button>
      </div>
    </div>
  );
};
