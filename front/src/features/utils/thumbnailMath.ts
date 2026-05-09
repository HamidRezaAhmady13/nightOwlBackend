// thumbnailMath.ts
export function clampPosition(x: number, width: number, viewportWidth: number) {
  return Math.max(width / 2, Math.min(x, viewportWidth - width / 2));
}

export function snapTime(time: number, interval: number) {
  return Math.floor(time / interval) * interval;
}
