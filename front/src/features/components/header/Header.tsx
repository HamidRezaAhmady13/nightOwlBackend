"use client";

import Button from "../shared/Button";
import UserDropdown from "./UserDropdown";
import SearchBar from "../search/SearchBar";
import AvatarImage from "../shared/AvatarImage";

import NotificationButton from "../notification/NotificationButton";
import { useCurrentUser } from "../AuthContext";

export default function Header() {
  const { user: currentUser } = useCurrentUser();

  if (!currentUser) return null;

  return (
    <header className="o-header z-[990] py-sm mb-xl px-md h-3xl fixed  u-bg-main top-0 left-0  w-full   ">
      <div className="m-user-wrapper group">
        {currentUser && (
          <>
            <Button
              className={` h-full gap-md max-w-96 mt-0 z-50`}
              size={"lg"}
              height={"lg"}
            >
              <div className="relative ">
                <AvatarImage
                  src={currentUser.avatarUrl || undefined}
                  alt={currentUser.username}
                  size={34}
                />
              </div>
              <span className="u-text-md">{currentUser.username} </span>
            </Button>
            <UserDropdown />
          </>
        )}
      </div>

      {currentUser && (
        <div className="ml-auto flex items-center gap-lg">
          <NotificationButton href="/notifications" />
          <SearchBar className="h-2xl  " />
        </div>
      )}
    </header>
  );
}
