import browser from "webextension-polyfill";

export enum StoreKeys {
  BookmarksSyncIsEnabled = "BOOKMARKS_SYNC_ENABLED",
  BookmarksSyncTime = "BOOKMARKS_SYNC_TIME",
  BookmarksNumSynced = "BOOKMARKS_NUM_SYNCED",
  HistorySyncIsEnabled = "HISTORY_SYNC_ENABLED",
  HistorySyncTime = "HISTORY_SYNC_TIME",
  HistoryNumSynced = "HISTORY_NUM_SYNCED",
}

// Get a single key
export async function getStore<Type>(key: string): Promise<Type | null> {
  return browser.storage.local
    .get(key)
    .then((record: Record<string, Type>) => record[key]);
}

// Get a key from local storage, setting the <defaultValue> if not found.
export async function getOrSetStore<Type>(
  key: string,
  defaultValue: Type
): Promise<Type> {
  return browser.storage.local.get(key).then((record: Record<string, Type>) => {
    if (record[key] == null || record[key] == undefined) {
      return setStore<Type>(key, defaultValue).then(() => defaultValue);
    } else {
      return record[key];
    }
  });
}
export async function setStore<Type>(key: string, value: Type): Promise<void> {
  return browser.storage.local.set({ [key]: value });
}

export async function setStores(records: Record<string, any>): Promise<void> {
  return browser.storage.local.set(records);
}
