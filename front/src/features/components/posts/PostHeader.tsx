import { Post } from "@/features/types";
import AvatarImage from "../shared/AvatarImage";
import { useRouter } from "next/navigation";
import { GeneralLink } from "../shared/GeneralLink";
import { API_URL } from "@/features/lib/api";

export function PostHeader({ post }: { post: Post }) {
  const router = useRouter();
  return (
    <GeneralLink
      href={`/users/${post.owner.username}`}
      className="block hover:cursor-pointer w-fit  p-sm rounded-xl space-y-md  "
    >
      <div>
        <div className="u-flex-start gap-sm  ">
          <div className="w-xl h-xl rounded-full overflow-hidden   ">
            <AvatarImage
              src={
                post.owner.avatarUrl?.startsWith("http")
                  ? post.owner.avatarUrl
                  : `${API_URL}${
                      post.owner.avatarUrl || "/uploads/default-avatar.png"
                    }`
              }
              alt={`${post.owner.username}'s avatar`}
              size={40}
            />
          </div>
          <h1 className="u-text-md u-text-secondary">{post.owner.username}</h1>
        </div>
      </div>
    </GeneralLink>
  );
}
