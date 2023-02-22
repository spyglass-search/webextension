import browser from "webextension-polyfill";
let action = browser.action || browser.browserAction;

export function mark_indexed() {
  action.setBadgeText({ text: "✓" });
  action.setBadgeBackgroundColor({ color: "rgb(21, 128, 61)" });
  action.setTitle({ title: "This URL is in your library" });

  if (action.setBadgeTextColor) {
    action.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  }
}

export function mark_unindexed() {
  action.setBadgeText({ text: "" });
  action.setBadgeBackgroundColor({ color: "rgb(0, 1, 1)" });
  action.setTitle({ title: "Click to add to your library!" });
}

export function mark_error(title: string) {
  action.setBadgeText({ text: "⚠" });
  action.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  action.setBadgeBackgroundColor({ color: "rgb(256, 0, 0)" });
  action.setTitle({ title });

  if (action.setBadgeTextColor) {
    action.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  }
}
