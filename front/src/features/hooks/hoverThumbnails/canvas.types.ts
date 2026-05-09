import { RefObject } from "react";

export type CanvasManager = {
  getCanvas: () => HTMLCanvasElement | null;
  show: () => void;
  hide: (immediate?: boolean) => void;
  scheduleHide: (holdMs?: number) => void;
  setSize: (w: number, h: number) => void;
  mountIntoRoot: (root?: HTMLElement) => void;
};

export type SeekListeners = {
  lastRect: () => DOMRect | null;
  isOverSeek: () => boolean;
  bind: () => void;
  unbind: () => void;
  computePosition: (
    rect: DOMRect,
    canvasHeightPx: number,
    gapPx?: number
  ) => { left: number; top: number };
  boundSeekRef: React.RefObject<HTMLElement | null>;
  cachedRectRef: React.RefObject<DOMRect | null>;
  lastMoveTs: React.RefObject<number>;
  HIDE_HOLD_MS: number;
};

export type ThumbnailsParams = {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  thumbUrlFn: (sec: number) => string;
  seekBarSelector?: string;
  intervalSec?: number;
  width?: number;
  height?: number;
  imageCache?: Record<number, HTMLImageElement>;
};
