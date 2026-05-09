import { drawImageToCanvas, loadAndCacheImage } from "./thumbnailDrawing";

export function drawOrLoadImage(
  snapped: number,
  ctx: CanvasRenderingContext2D,
  imageCache: Record<number, HTMLImageElement>,
  thumbUrlFn: (sec: number) => string,
  width: number,
  height: number
) {
  if (imageCache[snapped]) {
    drawImageToCanvas(ctx, imageCache[snapped], width, height);
  } else {
    loadAndCacheImage(snapped, imageCache, thumbUrlFn, ctx, width, height);
  }
}

export function prefetchNeighbours(
  snapped: number,
  intervalSec: number,
  duration: number,
  imageCache: Record<number, HTMLImageElement>,
  thumbUrlFn: (sec: number) => string
) {
  for (let offset = -2; offset <= 2; offset++) {
    if (offset === 0) continue;
    const neighborSnap = snapped + offset * intervalSec;
    if (
      neighborSnap >= 0 &&
      neighborSnap <= duration &&
      !imageCache[neighborSnap]
    ) {
      const preload = new Image();
      preload.src = thumbUrlFn(neighborSnap);
      imageCache[neighborSnap] = preload;
    }
  }
}
