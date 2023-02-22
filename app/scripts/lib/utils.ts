import browser from "webextension-polyfill";

export function mark_indexed() {
  browser.action.setBadgeText({ text: "✓" });
  browser.action.setBadgeBackgroundColor({ color: "rgb(21, 128, 61)" });
  browser.action.setTitle({ title: "This URL is in your library" });

  if (process.env.VENDOR == "firefox") {
    browser.action.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  }
}

export function mark_unindexed() {
  browser.action.setBadgeText({ text: "" });
  browser.action.setBadgeBackgroundColor({ color: "rgb(0, 1, 1)" });
  browser.action.setTitle({ title: "Click to add to your library!" });
}

export function mark_error(title: string) {
  browser.action.setBadgeText({ text: "⚠" });
  browser.action.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  browser.action.setBadgeBackgroundColor({ color: "rgb(256, 0, 0)" });
  browser.action.setTitle({ title });

  if (process.env.VENDOR == "firefox") {
    browser.action.setBadgeTextColor({ color: "rgb(255, 255, 255)" });
  }
}
