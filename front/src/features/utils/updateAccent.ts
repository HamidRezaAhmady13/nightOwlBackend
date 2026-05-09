// utils/updatePlayerAccent.ts
export function updatePlayerAccent(color: string) {
  // 1) sync root var (CSS-driven rules)
  document.documentElement.style.setProperty("--player-accent", color);

  // 2) selectors for known player control elements (add more if needed)
  const sel = [
    ".tuby-seek-bar .tuby-progress",
    ".tuby-seek-bar .thumb",
    ".tuby-seek-bar .track",
    ".tuby-volume .tuby-progress",
    // fallback: any custom range/thumb in your app
    "input[type='range']",
    // video wrapper fallback
    ".player-wrapper, .player-themed-wrapper",
  ].join(",");

  document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    // apply inline styles so existing painted nodes update immediately
    el.style.setProperty("background", color, "important");
    el.style.setProperty("color", color, "important");
    el.style.setProperty("border-color", color, "important");
    el.style.setProperty("--player-accent", color, "important");
  });

  // also update the inline style of any found player wrappers so CSS var rules inside them recompute
  document
    .querySelectorAll<HTMLElement>(".player-wrapper, .player-themed-wrapper")
    .forEach((w) => {
      w.style.setProperty("--player-accent", color);
    });
}
