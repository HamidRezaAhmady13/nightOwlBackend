"use client";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Button from "../shared/Button";
import UserDropdown from "./UserDropdown";
import SearchBar from "../search/SearchBar";
import AvatarImage from "../shared/AvatarImage";
import NotificationButton from "../notification/NotificationButton";
import { useUserStore } from "@/features/store/userStore";

import { useRouter } from "next/navigation";
import { updatePlayerAccent } from "@/features/utils/updateAccent";
import { useUpdateTheme } from "@/features/hooks/useUpdateTheme";
import { BACKEND_BASE } from "@/features/lib/api";

export default function Header() {
  const router = useRouter();
  const username = useUserStore((s) => s.user?.username);
  const avatarUrl = useUserStore((s) => s.user?.avatarUrl);
  const isLoading = useUserStore((s) => s.isLoading);
  const [isDark, setIsDark] = useState(false);
  const { mutate: updateTheme } = useUpdateTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const theme =
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("theme="))
        ?.split("=")[1] ??
      (document.documentElement.classList.contains("dark") ? "dark" : "light");
    const dark = theme === "dark";
    const color = dark ? "#4f46e5" : "#ffa000";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.setProperty(
      "--player-accent",
      color,
      "important",
    );
    document.documentElement.style.setProperty(
      "--tuby-primary-color",
      color,
      "important",
    );
    document.querySelectorAll(".tuby").forEach((n) => {
      if (n instanceof HTMLElement)
        n.style.setProperty("--tuby-primary-color", color, "important");
    });
    updatePlayerAccent(color);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const currentlyDark = document.documentElement.classList.contains("dark");
    const newTheme = currentlyDark ? "light" : "dark";
    const color = newTheme === "dark" ? "#4f46e5" : "#ffa000";

    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.documentElement.style.setProperty("--player-accent", color);

    document.documentElement.style.setProperty("--tuby-primary-color", color);
    updatePlayerAccent(color);

    try {
      window.dispatchEvent(new Event("theme:changed"));
    } catch (e) {}

    // persist
    document.cookie = `theme=${newTheme}; path=/; SameSite=lax`;
    updateTheme(newTheme);

    document
      .querySelectorAll(".tuby-seek-bar .tuby-progress")
      .forEach((n) => {});

    setIsDark(newTheme === "dark");
  };

  useEffect(() => {
    if (!dropdownOpen) return;

    const handler = (e: Event) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handler);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", esc);

    return () => {
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [dropdownOpen]);

  if (isLoading) return null;

  return (
    <header
      className={clsx(
        "o-header z-[990] py-sm mb-xl px-md",
        "fixed top-0 left-0 w-full u-bg-main",
      )}
    >
      {!isLoading && !username && (
        <>
          <div className="u-flex-start">
            <Button
              onClick={() => router.push("/login")}
              className="btn-secondary mx-sm"
              size={"xs"}
              height={"sm"}
            >
              Log In
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="btn-primary"
              size={"xs"}
              height={"sm"}
            >
              Sign Up
            </Button>
          </div>{" "}
          <div className="u-flex-start">
            <Button
              full={false}
              intent={"invisible"}
              onClick={() => {
                toggleTheme();
              }}
              size="xlg"
            >
              {isDark ? "🌞" : "🦉"}
            </Button>
            <Button
              onClick={() => router.push("/about-us")}
              className="btn-primary"
              size={"xs"}
              height={"sm"}
            >
              About us
            </Button>
          </div>
        </>
      )}

      {!isLoading && username && (
        <div className="m-user-wrapper" ref={headerRef}>
          <Button
            className="h-full gap-md min-w-80 max-w-96 mt-0 z-50"
            size="lg"
            height="lg"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}
          >
            <div className="relative">
              <AvatarImage
                src={
                  avatarUrl
                    ? avatarUrl.startsWith("http")
                      ? avatarUrl
                      : `${BACKEND_BASE}${avatarUrl}`
                    : `${BACKEND_BASE}/uploads/default-avatar.png`
                }
                alt={username}
                size={34}
              />
            </div>
            <span title={username} className="u-text-md username-truncate">
              {username}
            </span>
          </Button>
          <UserDropdown
            isOpen={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
          />
        </div>
      )}
      {username && (
        <div className="ml-auto flex items-center gap-lg ">
          <Button
            full={false}
            intent={"invisible"}
            onClick={() => {
              toggleTheme();
            }}
            size="xlg"
          >
            {isDark ? "🌞" : "🦉"}
          </Button>
          <NotificationButton href="/notifications" />
          <SearchBar className="h-2xl u-bg-deep" />
        </div>
      )}
    </header>
  );
}
