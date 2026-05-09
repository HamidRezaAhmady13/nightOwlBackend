// thumbnailDrawing.ts
export function drawImageToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
}

export function loadAndCacheImage(
  sec: number,
  cache: Record<number, HTMLImageElement>,
  thumbUrlFn: (sec: number) => string,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const img = new Image();
  img.src = thumbUrlFn(sec);
  img.decode().then(() => {
    cache[sec] = img;
    drawImageToCanvas(ctx, img, width, height);
  });
}
