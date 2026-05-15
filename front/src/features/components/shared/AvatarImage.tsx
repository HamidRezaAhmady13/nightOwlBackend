import { API_URL } from "@/features/lib/api";
import Image from "next/image";

function AvatarImage({
  src,
  alt,
  size,
}: {
  src?: string;
  alt?: string;
  size: number;
}) {
  const baseUrl = API_URL?.replace(/\/$/, "") || "";
  const fallback = `${baseUrl}/uploads/default-avatar.png`;

  let resolvedSrc = fallback;

  if (src) {
    const cleanSrc = src.replace(/^src\/uploads\//, "/uploads/");
    if (cleanSrc.startsWith("http")) {
      resolvedSrc = cleanSrc;
    } else if (baseUrl) {
      const normalizedSrc = cleanSrc.startsWith("/")
        ? cleanSrc
        : `/${cleanSrc}`;
      resolvedSrc = `${baseUrl}${normalizedSrc}`;
    } else {
      resolvedSrc = cleanSrc;
    }
  }

  return (
    <div className={` u-flex-center `}>
      <Image
        src={resolvedSrc}
        alt={alt ?? "profile image"}
        width={size}
        height={size}
        className="  object-cover rounded-full "
        quality={20}
        style={{ aspectRatio: "1 / 1" }}
      />
    </div>
  );
}

export default AvatarImage;
