import { userProfileMetadata } from "@/features/lib/seo";
import UserProfileClient from "./UserProfileClient"; // 👈 Import the client component!

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  return userProfileMetadata(params.username);
}

export default function UserProfilePage() {
  return <UserProfileClient />;
}
