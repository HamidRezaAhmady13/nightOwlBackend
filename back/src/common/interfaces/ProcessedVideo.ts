export interface ProcessedVideo {
  original: string;
  mp4Variants: string[];
  thumbnails: string[];
  hlsFolder: string | null;
}
