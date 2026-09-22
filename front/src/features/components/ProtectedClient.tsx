"use client";

import Header from "@/features/components/header/Header";
import SocketProvider from "@/features/components/SocketProvider";
import Spinner from "./shared/Spinner";
import { useUserStore } from "../store/userStore";
import { usePathname } from "next/navigation";

export default function ProtectedClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useUserStore((s) => s.user);

  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const isPublicProfile = segments.length === 2 && segments[0] === "users";
  const isPublicPost = segments.length > 2 && segments[0] === "post";
  const isPublicFeed = segments.length === 1 && segments[0] === "feed";

  const isPublicPath =
    isPublicFeed ||
    isPublicProfile ||
    isPublicPost ||
    pathname.split("/")[1] === "about-us";

  // 2. Only show the spinner if there is no user AND it's a private page
  if (!currentUser && !isPublicPath) {
    return null;
  }
  return (
    <div className="auth-wrapper">
      <SocketProvider userId={currentUser?.id}>
        <div className="mb-xl">
          <Header />
        </div>
        {children}
      </SocketProvider>
    </div>
  );
}
