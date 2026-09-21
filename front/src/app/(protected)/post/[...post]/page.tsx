import { postMetadata } from "@/features/lib/seo";
import PostClient from "./PostClient";
import api from "@/features/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ post: string[] }>;
}) {
  const { post } = await params;
  const postId = post[0];
  try {
    const { data } = await api.get(`/posts/${postId}`);
    return postMetadata(postId, data.content || "");
  } catch {
    return postMetadata(postId, "Join the conversation on OwlVibe.");
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ post: string[] }>;
}) {
  const { post } = await params;
  return <PostClient postId={post[0]} />;
}
