import { browserAction } from "webextension-polyfill";

export function mark_indexed() {
  browserAction.setBadgeText({ text: "✓" });
  browserAction.setBadgeTextColor({ color: "white" });
  browserAction.setBadgeBackgroundColor({ color: "rgb(21 128 61)" });
  browserAction.setTitle({ title: "This URL is in your library" });
}

export function mark_unindexed() {
  browserAction.setBadgeText({ text: null });
  browserAction.setBadgeBackgroundColor({ color: null });
  browserAction.setTitle({ title: "Click to add to your library!" });
}
