import { userProfileMetadata } from "@/features/lib/seo";
import UserProfileClient from "./UserProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return userProfileMetadata(username);
}
export default function UserProfilePage() {
  return <UserProfileClient />;
}
