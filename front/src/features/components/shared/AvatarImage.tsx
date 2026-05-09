// import { API_URL } from "@/app/lib/api";
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
    if (src.startsWith("http")) {
      resolvedSrc = src;
    } else if (baseUrl) {
      const normalizedSrc = src.startsWith("/") ? src : `/${src}`;
      resolvedSrc = `${baseUrl}${normalizedSrc}`;
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
