"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Button from "@/features/components/shared/Button";
import { UserPreview } from "@/features/types";
import { UserHeader } from "@/features/components/header";
import PostsGrid from "@/features/components/posts/PostGrid";
import OverlayRoutes from "@/features/components/OverlayRoutes";
import { getUserHeaderProps } from "@/features/utils/profile";
import api from "@/features/lib/api";
import { queryKeys } from "@/features/utils/queryKeys";
import { useFollowUser } from "@/features/hooks/useFollowUser";
import { useUnfollowUser } from "@/features/hooks/useUnfollowUser";
import { useUserStore } from "@/features/store/userStore";

function decodeSafe(u?: string) {
  if (!u) return u;
  try {
    return decodeURIComponent(u).trim();
  } catch {
    return u.trim();
  }
}

export default function UserProfileClient() {
  const searchParams = useSearchParams();
  const params = useParams();

  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername)
    ? rawUsername[0]
    : (rawUsername ?? undefined);

  const refreshKey = searchParams.get("refresh") || "";
  const decodedUsername = decodeSafe(username);

  if (!decodedUsername) return <p>User not found.</p>;

  const currentUser = useUserStore((s) => s.user);

  const { data: profileUser, isLoading } = useQuery({
    queryKey: queryKeys.user.byUsername(decodedUsername),
    queryFn: async () => {
      const res = await api.get(
        `/users/${encodeURIComponent(decodedUsername)}`,
      );
      return res.data;
    },
    enabled: !!decodedUsername,
  });

  const isFollowing = Array.isArray(currentUser?.following)
    ? (currentUser.following as UserPreview[]).some(
        (u) => u.username === decodedUsername,
      )
    : false;

  const followMutation = useFollowUser(decodedUsername);
  const unfollowMutation = useUnfollowUser(decodedUsername);

  if (isLoading) return null;
  if (!profileUser) return <p className="mt-40">User not found.</p>;

  const headerProps = getUserHeaderProps(profileUser);

  return (
    <div className="max-w-3xl mx-auto px-md py-2xl space-y-xl">
      {currentUser && username !== currentUser.username ? (
        <Button
          label={isFollowing ? "Unfollow" : "Follow"}
          onClick={() => {
            if (!decodedUsername) return;
            if (isFollowing) unfollowMutation.mutate();
            else followMutation.mutate();
          }}
        />
      ) : (
        <div></div>
      )}
      <UserHeader {...headerProps} />
      <PostsGrid username={decodedUsername} key={refreshKey} />
      <OverlayRoutes />
    </div>
  );
}
