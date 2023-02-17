import * as React from "react";

type SyncHistoryProps = {
  last_synced: Date | null;
};

export const SyncHistory = ({ last_synced }: SyncHistoryProps) => {
  return (
    <div className="content p-4">
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
        >
          Sync History Now
        </button>
      </div>
    </div>
  );
};
