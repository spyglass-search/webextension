import browser from "webextension-polyfill";

export enum StoreKeys {
  BookmarksSyncTime = "BOOKMARKS_SYNC_TIME",
  HistorySyncTime = "HISTORY_SYNC_TIME",
}

export async function getStore<Type>(key: string): Promise<Type | null> {
  return browser.storage.local
    .get(key)
    .then((record: Record<string, Type>) => record[key]);
}

export async function setStore<Type>(key: string, value: Type): Promise<void> {
  return browser.storage.local.set({ [key]: value });
}
