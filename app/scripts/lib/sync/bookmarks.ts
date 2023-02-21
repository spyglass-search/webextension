import browser from "webextension-polyfill";
import { StoreKeys, setStores, getOrSetStore, getStore } from "storage";
import { SpyglassRpcClient, RawDocType, RawDocSource } from "lib/rpc";

const SPYGLASS_CLIENT = new SpyglassRpcClient();
function _add_url(url: string): Promise<void> {
  return SPYGLASS_CLIENT.add_raw_document({
    url,
    content: null,
    doc_type: RawDocType.Url,
    tags: [["lens", "bookmarks"]],
    source: RawDocSource.WebExtension,
  });
}

function walk_tree(
  item: browser.Bookmarks.BookmarkTreeNode,
  last_sync_date: Date
): number {
  let count = 0;
  if (item.url && item.url.startsWith("http")) {
    if (item.dateAdded) {
      let date_added = new Date(item.dateAdded);
      if (date_added > last_sync_date && item.url) {
        count += 1;
        _add_url(item.url);
      }
    }
  }

  if (item.children) {
    for (const child of item.children) {
      count += walk_tree(child, last_sync_date);
    }
  }

  return count;
}

/// Sync new bookmarks w/ Spyglass
export async function sync_bookmarks(
  bmarks: browser.Bookmarks.BookmarkTreeNode[],
  force_sync: boolean
) {
  let now = new Date();
  let result = (await getStore<number>(StoreKeys.BookmarksSyncTime)) || 0;
  let last_synced = new Date(result);

  console.info(`bookmarks last synced: ${last_synced.toISOString()}`);

  // Set date to epoch if we're forcing a sync.
  last_synced = force_sync ? new Date(0) : last_synced;
  // Walk boomark hierarchy and add bookmarks that have been added after
  // <lastSync>
  let num_synced = walk_tree(bmarks[0], last_synced);
  // If we're not forcing a new sync, get the total number of bookmarks synced so far.
  let total_synced = force_sync
    ? 0
    : await getOrSetStore<number>(StoreKeys.BookmarksNumSynced, 0);
  return setStores({
    [StoreKeys.BookmarksSyncTime]: now.getTime(),
    [StoreKeys.BookmarksNumSynced]: num_synced + total_synced,
  });
}

export async function handle_new_bookmark(
  _: string,
  bookmark: browser.Bookmarks.BookmarkTreeNode
) {
  if (bookmark.url) {
    return _add_url(bookmark.url);
  }
}

export async function handle_delete_bookmark(
  _: string,
  removeInfo: browser.Bookmarks.OnRemovedRemoveInfoType
) {
  if (removeInfo.node.url) {
    return SPYGLASS_CLIENT.delete_document(removeInfo.node.url);
  }
}
