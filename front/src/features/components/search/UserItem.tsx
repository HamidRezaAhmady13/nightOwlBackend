import Link from "next/link";
import clsx from "clsx";
import AvatarImage from "../shared/AvatarImage";
import { User } from "@/features/types";

function UserItem({ user, onClick }: { user: User; onClick: () => void }) {
  return (
    <Link
      key={user.username}
      onClick={onClick}
      href={`/users/${user.username}`}
      className={clsx(
        "m-search-results u-flex-start gap-sm",
        "transition-all duration-slow outline-none rounded-sm",
        "u-bg-soft ",
        "u-focus-visible",
        "shadow-2xl",
        "my-xs"
      )}
    >
      <div className="w-xl ">
        <AvatarImage src={user.avatarUrl} alt={user.username} size={20} />
      </div>
      <span className="block">{user.username}</span>
    </Link>
  );
}

export default UserItem;
