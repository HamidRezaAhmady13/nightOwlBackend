// utils/observePlayers.ts
export function observePlayersAndApplyAccent() {
  const applyColorToNode = (node: HTMLElement, color: string) => {
    node.style.setProperty("--player-accent", color, "important");
    node.style.setProperty("--tuby-primary-color", color, "important");
    node
      .querySelectorAll<HTMLElement>(
        ".tuby, .tuby-root, .tuby-seek-bar .tuby-progress, .tuby-seek-bar .thumb, .tuby-seek-bar .track, .tuby-volume .tuby-progress"
      )
      .forEach((el) => {
        el.style.setProperty("--player-accent", color, "important");
        el.style.setProperty("--tuby-primary-color", color, "important");
        el.style.setProperty("border-color", color, "important");
      });
  };

  const getRootColor = () =>
    (
      getComputedStyle(document.documentElement).getPropertyValue(
        "--player-accent"
      ) || "#ffa000"
    ).trim();

  // Apply to any already-mounted players immediately
  const initialColor = getRootColor();
  document
    .querySelectorAll<HTMLElement>(".tuby, .player-themed-wrapper, .tuby-root")
    .forEach((n) => applyColorToNode(n, initialColor));

  const observer = new MutationObserver((mutations) => {
    const color = getRootColor();
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes)) {
        if (!(node instanceof HTMLElement)) continue;
        if (
          node.matches(".tuby, .player-themed-wrapper, .tuby-root") ||
          node.querySelector(".tuby-seek-bar")
        ) {
          applyColorToNode(node, color);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
