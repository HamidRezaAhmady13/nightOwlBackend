import { Metadata } from "next";

export function userProfileMetadata(username: string): Metadata {
  return {
    title: `${username} – OwlVibe Profile`,
    description: `Discover ${username}'s posts, likes, and followers on OwlVibe.`,
    openGraph: {
      title: `${username} – OwlVibe Profile`,
      description: `See ${username}'s activity on OwlVibe.`,
      url: `https://hamidreza-ahmadi.sbs/users/${username}`,
      images: [`https://hamidreza-ahmadi.sbs/api/og-about.png`],
    },
    alternates: {
      canonical: `https://hamidreza-ahmadi.sbs/users/${username}`,
    },
  };
}

export function postMetadata(
  postId: string,
  postDescription: string,
): Metadata {
  // 1. Grab the first 160 characters for the SEO preview
  const previewText = postDescription.substring(0, 160);

  // 2. If it was longer than 160 chars, add "..."
  const cleanDesc =
    postDescription.length > 160 ? `${previewText}...` : previewText;

  return {
    title: `${cleanDesc.slice(0, 60) || "Post"} – OwlVibe`,
    description: cleanDesc || "View this post on OwlVibe.", // Fallback if empty
    openGraph: {
      title: `Post on OwlVibe`,
      description: cleanDesc || "View this post on OwlVibe.",
      url: `https://hamidreza-ahmadi.sbs/post/${postId}`,
    },
  };
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // strip everything except letters, numbers, spaces, hyphens
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}
