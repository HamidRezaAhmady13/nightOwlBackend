import { useRouter } from "next/navigation";
import Button from "../shared/Button";
import AvatarImage from "../shared/AvatarImage";
import { User } from "@/features/types";
import { BACKEND_BASE } from "@/features/lib/api";
import { useUserStore } from "@/features/store/userStore";

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
  const currentUser = useUserStore((s) => s.user);

  return (
    <main className="u-flex-col-center gap-xl w-full ">
      <header className="u-flex-between   w-full">
        <div className="u-flex-center gap-md  ">
          <AvatarImage
            src={
              avatarUrl
                ? avatarUrl.startsWith("http")
                  ? avatarUrl
                  : `${BACKEND_BASE}${avatarUrl}`
                : `${BACKEND_BASE}/uploads/default-avatar.png`
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
      </header>
      <div className="u-flex-col-center gap-sm  space-y-sm">
        <section aria-label="User stats" className="u-flex-center gap-x-3xl">
          <div>
            <p className="u-text-tertiary ">following : {followingsCount}</p>
          </div>
          <div>
            <p className="u-text-tertiary ">followers : {followersCount}</p>
          </div>
        </section>
        {bio && (
          <section aria-label="User bio">
            <p className="u-text-sm  u-text-primary">{bio}</p>
          </section>
        )}

        <address className="u-flex-center flex-wrap gap-md u-text-tertiary">
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
        </address>
      </div>{" "}
    </main>
  );
};
