"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/features/components/shared/Button";
import { User, UserPreview } from "@/features/types"; // <-- ensure UserPreview exists
import { UserHeader } from "@/features/components/header";
import Spinner from "@/features/components/shared/Spinner";
import PostsGrid from "@/features/components/posts/PostGrid";
import OverlayRoutes from "@/features/components/OverlayRoutes";
import { getUserHeaderProps } from "@/features/utils/profile";
import api from "@/features/lib/api";
import { useCurrentUser } from "@/features/components/AuthContext";
import { queryKeys } from "@/features/utils/queryKeys";
import getToken from "@/features/lib/getMeAndUsers";
// import { token } from "@/features/lib/getMe";

function decodeSafe(u?: string) {
  if (!u) return u;
  try {
    return decodeURIComponent(u).trim();
  } catch {
    return u.trim();
  }
}

export default function UserProfilePage() {
  const params = useParams();
  const rawUsername = params?.username;
  const username = Array.isArray(rawUsername)
    ? rawUsername[0]
    : rawUsername ?? undefined;

  const decodedUsername = decodeSafe(username);
  if (!decodedUsername) return <p>User not found.</p>;

  const queryClient = useQueryClient();
  const { user: currentUser } = useCurrentUser();

  const { data: profileUser, isLoading } = useQuery({
    queryKey: queryKeys.user.byUsername(decodedUsername),
    queryFn: async () => {
      const res = await api.get(
        `/users/${encodeURIComponent(decodedUsername)}`
      );
      return res.data;
    },

    enabled: !!decodedUsername,
  });

  const isFollowing = Array.isArray(currentUser?.following)
    ? (currentUser.following as UserPreview[]).some(
        (u) => u.username === decodedUsername
      )
    : false;

  const followMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const res = await api.post(
        `/users/${encodeURIComponent(username)}/follow`
      );
      return res;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.current(getToken() ?? ""),
      });
      const prev = queryClient.getQueryData<User | undefined>(
        queryKeys.user.current(getToken() ?? "")
      );
      // optimistic add
      queryClient.setQueryData<User | undefined>(
        queryKeys.user.current(getToken() ?? ""),
        (old) =>
          old
            ? {
                ...old,
                following: [
                  ...(old.following ?? []),
                  { username: vars.username, id: `temp-${Date.now()}` },
                ],
              }
            : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev)
        queryClient.setQueryData(
          queryKeys.user.current(getToken() ?? ""),
          ctx.prev
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.byUsername(decodedUsername),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.current(getToken() ?? ""),
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      const res = await api.delete(
        `/users/${encodeURIComponent(username)}/unfollow`
      );

      return res;
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.current(getToken() ?? ""),
      });
      const prev = queryClient.getQueryData<User | undefined>(
        queryKeys.user.current(getToken() ?? "")
      );
      // optimistic remove
      queryClient.setQueryData<User | undefined>(
        queryKeys.user.current(getToken() ?? ""),
        (old) =>
          old
            ? {
                ...old,
                following: (old.following ?? []).filter(
                  (u: UserPreview) => u.username !== vars.username
                ),
              }
            : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev)
        queryClient.setQueryData(
          queryKeys.user.current(getToken() ?? ""),
          ctx.prev
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.byUsername(decodedUsername),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.current(getToken() ?? ""),
      });
    },
  });

  // Button: disable while either mutation is running to prevent double clicks
  <Button
    label={isFollowing ? "Unfollow" : "Follow"}
    disabled={followMutation.isPending || unfollowMutation.isPending}
    onClick={() => {
      if (!decodedUsername) return;
      if (isFollowing) unfollowMutation.mutate({ username: decodedUsername });
      else followMutation.mutate({ username: decodedUsername });
    }}
  />;

  if (isLoading) return <Spinner />;
  if (!profileUser) return <p>User not found.</p>;

  const headerProps = getUserHeaderProps(profileUser);
  console.log(headerProps);

  return (
    <div className="max-w-3xl mx-auto px-md py-2xl space-y-xl">
      {currentUser &&
        profileUser &&
        currentUser.email !== profileUser.email && (
          <Button
            label={isFollowing ? "Unfollow" : "Follow"}
            onClick={() => {
              if (!decodedUsername) return;
              if (isFollowing) {
                unfollowMutation.mutate({ username: decodedUsername });
              } else {
                followMutation.mutate({ username: decodedUsername });
              }
            }}
          />
        )}

      <UserHeader {...headerProps} />
      <PostsGrid username={decodedUsername} />
      <OverlayRoutes />
    </div>
  );
}
