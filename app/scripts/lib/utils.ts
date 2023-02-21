import { browserAction } from "webextension-polyfill";

export function mark_indexed() {
  browserAction.setBadgeText({ text: "✓" });
  browserAction.setBadgeBackgroundColor({ color: "rgb(21, 128, 61)" });
  browserAction.setTitle({ title: "This URL is in your library" });

  if (process.env.VENDOR == "firefox") {
    browserAction.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  }
}

export function mark_unindexed() {
  browserAction.setBadgeText({ text: "" });
  browserAction.setBadgeBackgroundColor({ color: "rgb(0, 1, 1)" });
  browserAction.setTitle({ title: "Click to add to your library!" });
}

export function mark_error(title: string) {
  browserAction.setBadgeText({ text: "⚠" });
  browserAction.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  browserAction.setBadgeBackgroundColor({ color: "rgb(256, 0, 0)" });
  browserAction.setTitle({ title });

  if (process.env.VENDOR == "firefox") {
    browserAction.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  }
}