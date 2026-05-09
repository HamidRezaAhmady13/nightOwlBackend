import {
  LANDSCAPE_RATIO,
  PORTRAIT_RATIO,
  PostGalleryMedia,
  PostMode,
  SQUARE_RATIO,
} from "@/features/types";
import Image from "next/image";
import React, { useState } from "react";
import MediaWrapper from "./MediaWrapper";
import { API_URL } from "@/features/lib/api";

type Props = { images: PostGalleryMedia[]; mode?: PostMode };

export default function PostGallery({ images, mode = "feed" }: Props) {
  const [dims, setDims] = useState<Record<string, { w: number; h: number }>>(
    {}
  );

  const onLoad =
    (id: string) =>
    ({
      naturalWidth,
      naturalHeight,
    }: {
      naturalWidth: number;
      naturalHeight: number;
    }) =>
      setDims((prev) =>
        prev[id]?.w === naturalWidth && prev[id]?.h === naturalHeight
          ? prev
          : { ...prev, [id]: { w: naturalWidth, h: naturalHeight } }
      );

  return (
    <div className="flex flex-col items-center gap-4">
      {images.map((img) => {
        const known =
          img.width && img.height
            ? { w: img.width, h: img.height }
            : dims[img.id];
        const isVertical = known ? known.h > known.w : undefined;
        const isSquare = known ? known.h === known.w : false;
        const ratioClass =
          mode === "feed"
            ? isSquare
              ? SQUARE_RATIO
              : isVertical
              ? PORTRAIT_RATIO
              : LANDSCAPE_RATIO
            : "";
        const intrinsic = isVertical
          ? { width: 800, height: 1066 }
          : isSquare
          ? { width: 900, height: 900 }
          : { width: 1200, height: 900 };

        return (
          <div key={img.id} className="w-full max-w-3xl mx-auto">
            <div className="w-full flex items-center justify-center">
              {mode === "feed" ? (
                <MediaWrapper mode={mode} aspectClass={ratioClass}>
                  <Image
                    src={`${API_URL}${img.url}`}
                    alt={img.alt ?? img.id}
                    fill
                    sizes="(min-width:1200px) 1000px, (min-width:768px) 70vw, 90vw"
                    className="object-cover object-center"
                    onLoad={(e) =>
                      onLoad(img.id)({
                        naturalWidth: (e.currentTarget as HTMLImageElement)
                          .naturalWidth,
                        naturalHeight: (e.currentTarget as HTMLImageElement)
                          .naturalHeight,
                      })
                    }
                  />
                </MediaWrapper>
              ) : (
                <MediaWrapper mode={mode} aspectClass={ratioClass}>
                  <Image
                    src={`${API_URL}${img.url}`}
                    alt={img.alt ?? img.id}
                    width={intrinsic.width}
                    height={intrinsic.height}
                    sizes="(min-width:1200px) 1000px, (min-width:768px) 70vw, 90vw"
                    className="rounded-2xl object-contain"
                    // style={{ maxWidth: "100%", height: "auto", width: "auto" }}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "calc(85vh - 180px)",
                      width: "auto",
                      height: "auto",
                    }}
                    onLoad={(e) =>
                      onLoad(img.id)({
                        naturalWidth: (e.currentTarget as HTMLImageElement)
                          .naturalWidth,
                        naturalHeight: (e.currentTarget as HTMLImageElement)
                          .naturalHeight,
                      })
                    }
                  />
                </MediaWrapper>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
