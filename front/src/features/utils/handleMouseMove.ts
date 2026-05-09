import {
  getSnappedTime,
  positionCanvas,
} from "../hooks/hoverThumbnails/hoverThumbnailUtils";
import { drawOrLoadImage, prefetchNeighbours } from "./imageHelpers";

export function handleMove({
  e,
  bar,
  intervalSec,
  duration,
  lastSnapRef,
  imageCache,
  canvasRef,
  ctx,
  width,
  height,
  setVisible,
  thumbUrlFn,
}: {
  e: MouseEvent;
  bar: HTMLElement;
  intervalSec: number;
  duration: number;
  lastSnapRef: React.RefObject<number>;
  imageCache: Record<number, HTMLImageElement>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  setVisible: (v: boolean) => void;
  thumbUrlFn: (sec: number) => string;
}) {
  const snapped = getSnappedTime(e, bar, duration, intervalSec);

  if (snapped === lastSnapRef.current && imageCache[snapped]) return;
  lastSnapRef.current = snapped;

  const canvas = canvasRef.current!;
  positionCanvas(canvas, e, width, height, bar.getBoundingClientRect().top);
  setVisible(true);

  drawOrLoadImage(snapped, ctx, imageCache, thumbUrlFn, width, height);
  prefetchNeighbours(snapped, intervalSec, duration, imageCache, thumbUrlFn);
}
