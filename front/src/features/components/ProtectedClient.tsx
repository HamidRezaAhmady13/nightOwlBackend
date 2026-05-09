"use client";

import { useCurrentUser } from "@/features/components/AuthContext";
import Header from "@/features/components/header/Header";
import SocketProvider from "@/features/components/SocketProvider";
import Spinner from "./shared/Spinner";

export default function ProtectedClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: currentUser, isLoading } = useCurrentUser();

  // if (isLoading) {
  //   return <Spinner />;
  // }

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
