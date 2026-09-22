import { userProfileMetadata } from "@/features/lib/seo";
import UserProfileClient from "./UserProfileClient";

export const dynamic = "force-dynamic";

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
