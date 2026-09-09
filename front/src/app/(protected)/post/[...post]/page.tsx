import { postMetadata } from "@/features/lib/seo";
import PostClient from "./PostClient";
import api from "@/features/lib/api";

export async function generateMetadata({
  params,
}: {
  params: { post: string[] };
}) {
  const postId = params.post[0];
  try {
    const { data: post } = await api.get(`/posts/${postId}`);
    return postMetadata(postId, post.description || "");
  } catch (error) {
    return postMetadata(postId, "Join the conversation on OwlVibe.");
  }
}

export default function PostPage({ params }: { params: { post: string[] } }) {
  const postId = params.post[0];
  return <PostClient postId={postId} />;
}
