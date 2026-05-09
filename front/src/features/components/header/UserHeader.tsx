import { useRouter } from "next/navigation";
import Button from "../shared/Button";
import AvatarImage from "../shared/AvatarImage";
import { User } from "@/features/types";
import { API_URL } from "@/features/lib/api";
import { useCurrentUser } from "../AuthContext";

export const UserHeader = ({
  avatarUrl,
  username,
  bio,
  location,
  website,
  followingsCount,
  followersCount,
}: User) => {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  return (
    <div className="u-flex-col-center gap-xl w-full ">
      {/* Avatar */}
      <div className="u-flex-between   w-full">
        <div className="u-flex-center gap-md  ">
          <AvatarImage
            src={
              avatarUrl
                ? avatarUrl.startsWith("http")
                  ? avatarUrl
                  : `${API_URL}${avatarUrl}`
                : "/uploads/default-avatar.png"
            }
            alt="User Avatar"
            size={60}
          />
          <h1 className="u-text-lg u-text-secondary ">{username}</h1>
        </div>
        <div className="u-flex-center">
          {currentUser?.username === username && (
            <Button
              size={"sm"}
              height={"sm"}
              label="Update tour profile"
              onClick={() => router.push(`/users/${username}/edit`)}
            />
          )}
        </div>
      </div>
      <div className="u-flex-col-center gap-sm  space-y-sm">
        <div className="u-flex-center gap-x-3xl">
          <div>
            <p className="u-text-tertiary ">following : {followingsCount}</p>
          </div>
          <div>
            <p className="u-text-tertiary ">followers : {followersCount}</p>
          </div>
        </div>
        {bio && <p className="u-text-sm  u-text-primary">{bio}</p>}

        <div className="u-flex-center flex-wrap gap-md u-text-tertiary">
          {location && <span className="u-text-tertiary ">📍 {location}</span>}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-cobalt-600 dark:text-cobalt-200"
            >
              🔗 {website}
            </a>
          )}
        </div>
      </div>{" "}
    </div>
  );
};
