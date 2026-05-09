import { MediaTypeEnum } from "./enums";

export type Media = {
  id: string;
  type: MediaTypeEnum;
  url: string;
  quality?: string | null;
  isThumbnail?: boolean;
};

// media.types.ts
export type ThumbnailBaseProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  thumbUrlFn: (seconds: number) => string;
  intervalSec: number;
  width: number;
  height: number;
};

export type PostGalleryMedia = Media & {
  width?: number;
  height?: number;
  alt?: string;
};
