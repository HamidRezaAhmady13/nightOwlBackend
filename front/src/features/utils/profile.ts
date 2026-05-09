import { User } from "@/features/types";

export function getUserHeaderProps(user: any): User {
  return {
    id: user.id,
    email: user.email,
    avatarUrl: user?.avatarUrl || "/uploads/default-avatar.png",
    username: user?.username || "Unknown User",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    followersCount: user?.followersCount,
    followingsCount: user?.followingsCount,
  };
}
