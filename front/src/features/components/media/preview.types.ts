import { ThumbnailBaseProps } from "@/features/types";

export type ThumbnailPreviewProps = ThumbnailBaseProps & {
  seekBarSelector: string;
};
export type HoverPreviewSetupProps = ThumbnailBaseProps & {
  bar: HTMLElement;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setVisible: (v: boolean) => void;
  imageCache: React.RefObject<Record<number, HTMLImageElement>>;
};
