import browser from "webextension-polyfill";

interface WalkResult {
  end_time: Date;
  num_synced: number;
}

async function walk_history(before_time: Date): Promise<WalkResult> {
  let items = await browser.history.search({
    text: "",
    startTime: 0,
    endTime: before_time,
  });
  let num_synced = items.length;

  let end_time = new Date(0);
  for (const item of items) {
    console.log(item.url);
    if (item.lastVisitTime) {
      end_time = new Date(item.lastVisitTime);
    }
  }

  return {
    end_time,
    num_synced,
  };
}

export async function sync_history() {
  let result = await walk_history(new Date());
}
