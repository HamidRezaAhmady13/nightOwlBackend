import { doRefresh } from "../lib/api";

let refreshIntervalId: number | null = null;

export function startRefreshInterval() {
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  refreshIntervalId = window.setInterval(
    () => {
      doRefresh().catch(() => {
        clearInterval(refreshIntervalId!);
        refreshIntervalId = null;
      });
      console.log(refreshIntervalId);
    },

    1000 * 60 * 10
  );
}

export function clearRefreshInterval() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}
