import { Metadata } from "next";

export function userProfileMetadata(username: string): Metadata {
  return {
    title: `${username} – OwlVibe Profile`,
    description: `Discover ${username}'s posts, likes, and followers on OwlVibe.`,
    openGraph: {
      title: `${username} – OwlVibe Profile`,
      description: `See ${username}'s activity on OwlVibe.`,
      url: `https://hamidreza-ahmadi.sbs/users/${username}`,
      images: [`https://hamidreza-ahmadi.sbs/api/og/${username}.png`],
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
    title: `Post on OwlVibe`, // Keep title simple since posts don't have titles
    description: cleanDesc || "View this post on OwlVibe.", // Fallback if empty
    openGraph: {
      title: `Post on OwlVibe`,
      description: cleanDesc || "View this post on OwlVibe.",
      url: `https://hamidreza-ahmadi.sbs/post/${postId}`,
    },
  };
}

export function createSlug(text?: string | null): string {
  if (!text) return "post";

  return text
    .substring(0, 50) // Only take the first 50 chars so the URL isn't massive
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove weird characters like emojis or punctuation
    .replace(/[\s_-]+/g, "-") // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ""); // Remove trailing hyphens
}
