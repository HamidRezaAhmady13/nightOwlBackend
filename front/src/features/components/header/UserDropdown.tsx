"use client";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import Button from "../shared/Button";
import { updatePlayerAccent } from "@/features/utils/updateAccent";
import { observePlayersAndApplyAccent } from "@/features/utils/observePlayers";
import { useLogout } from "@/features/hooks/useLogout";
import { useUpdateTheme } from "@/features/hooks/useUpdateTheme";
import { useUserStore } from "@/features/store/userStore";

function UserDropdown({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { handleLogout } = useLogout();

  const username = useUserStore((s) => s.user?.username);

  useEffect(() => {
    const stop = observePlayersAndApplyAccent();
    return () => stop();
  }, []);

  return (
    <div
      className={clsx(
        "absolute left-0 top-full mt-0 w-full",
        "u-bg-transparent u-flex-center flex-col shadow-lg rounded p-2 z-10",
        "transition-opacity duration-fast",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
      tabIndex={-1}
    >
      <Button
        label="HOME"
        onClick={() => {
          onClose();
          router.push("/feed");
        }}
        className="w-full"
        size="lg"
        height="md"
      />
      <Button
        label="Share post"
        onClick={() => {
          onClose();
          router.push("/post");
        }}
        className="w-full"
        size="md"
        height="md"
      />
      <Button
        label="Profile"
        onClick={() => {
          onClose();
          router.push(`/users/${username}`);
        }}
        className="w-full"
        size="md"
        height="md"
      />
      <Button
        label="Logout"
        onClick={() => {
          onClose();
          handleLogout();
        }}
        className="w-full"
        size="md"
        height="md"
      />
      <Button
        className="w-full"
        size="md"
        height="md"
        onClick={() => {
          onClose();
          router.push("/change-password");
        }}
      >
        Change password
      </Button>
      <Button
        className="w-full"
        size="md"
        height="md"
        onClick={() => {
          onClose();
          router.push("/about-us");
        }}
      >
        About us
      </Button>
    </div>
  );
}

export default UserDropdown;
