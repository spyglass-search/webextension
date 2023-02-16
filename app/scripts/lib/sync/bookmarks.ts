import browser from "webextension-polyfill";

const BOOKMARKS_SYNC_TIME = "BOOKMARKS_SYNC_TIME";

function walk_tree(
  item: browser.Bookmarks.BookmarkTreeNode,
  last_sync_date: Date
) {
  if (item.url && item.type == "bookmark" && item.url.startsWith("http")) {
    if (item.dateAdded) {
      let date_added = new Date(item.dateAdded);
      if (date_added > last_sync_date) {
        console.log(`url: ${item.url}, added: ${date_added}`);
      }
    }
  }

  if (item.children) {
    for (const child of item.children) {
      walk_tree(child, last_sync_date);
    }
  }
}

/// Sync new bookmarks w/ Spyglass
export async function sync_bookmarks(
  bmarks: browser.Bookmarks.BookmarkTreeNode[]
) {
  let record: Record<string, Date> = await browser.storage.local.get(
    BOOKMARKS_SYNC_TIME
  );
  let last_synced = record[BOOKMARKS_SYNC_TIME] || new Date(0);
  let now = new Date();
  console.info(`bookmarks last synced: ${last_synced}`);

  walk_tree(bmarks[0], last_synced);
  await browser.storage.local.set({ BOOKMARKS_SYNC_TIME: now });
}

export async function handle_new_bookmark(
  _: string,
  bookmark: browser.Bookmarks.BookmarkTreeNode
) {
  console.log(`new bookmark: ${bookmark.url}`);
}

export async function handle_delete_bookmark(
  _: string,
  removeInfo: browser.Bookmarks.OnRemovedRemoveInfoType
) {
  console.log(`deleted bookmark: ${removeInfo.node.url}`);
}
