import { useState } from "react";
import PostTile from "./PostTile";
import Spinner from "../shared/Spinner";
import Button from "../shared/Button";
import { useRouter } from "next/navigation";
import { useProfilePosts } from "@/features/hooks/useProfilePosts";
import { createSlug } from "@/features/lib/seo";
// import Link from "next/link";

export default function PostsGrid({ username }: { username?: string }) {
  const [limit] = useState(6);
  const { items, loading, error, hasMore, loadMore, reload, reset } =
    useProfilePosts({ limit, username });

  const router = useRouter();

  if (loading) return <div className="p-lg">{null}</div>;

  if (error && items.length === 0)
    return <div className="p-lg u-text-error">Error loading posts</div>;

  return (
    <div className="max-w-4xl mx-auto p-lg space-y-lg">
      <div className="grid grid-cols-3 gap-xs">
        {items.map((p) => {
          const postUrl = `/post/${p.id}/${createSlug(p.content)}`;

          return (
            <PostTile
              key={p.id}
              post={{
                id: p.id,
                imageUrl: p.imageUrl,
                content: createSlug(p.content),
              }}
            />
          );
        })}
      </div>

      <div className="u-flex-center space-x-md">
        <Button
          size={"xs"}
          height={"sm"}
          className="w-1/6"
          onClick={() => {
            loadMore();
          }}
          disabled={!hasMore || loading}
        >
          {loading ? "Loading..." : "Load more"}
        </Button>

        <Button
          className="w-1/6"
          size={"xs"}
          height={"sm"}
          onClick={() => {
            reset();
            reload();
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
