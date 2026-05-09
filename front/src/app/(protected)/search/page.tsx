"use client";
import clsx from "clsx";
import { useRouter } from "next/navigation";

import Spinner from "@/features/components/shared/Spinner";
import Button from "@/features/components/shared/Button";
import SearchItem from "@/features/components/search/UserItem";
import { useSearch } from "@/features/hooks/useSearch";

export default function SearchPage() {
  const {
    query,
    loading,
    showResults,
    results,
    total,
    limit,
    page,
    pageItems,
    goToPage,
    totalPages,
  } = useSearch();

  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto p-md">
      <div className="h-2xl u-flex-between   gap-xl   mb-md">
        <h1 className="  u-text-lg u-text-secondary-soft h-full    u-flex-center">
          Search results for "{query}"
        </h1>
        <div className="h-2xl  px-md py-sm  ">
          {loading && <Spinner size={34} padding={false} />}
        </div>
      </div>

      {showResults && results.length === 0 && <p>No users found.</p>}

      <ul className="space-y-sm    ">
        {results.map((user) => (
          <SearchItem
            key={user.id}
            user={user}
            onClick={() => router.push(`/users/${user.username}`)}
          />
        ))}
      </ul>

      {/* Pagination controls */}
      {total > limit && (
        <div className="u-flex-between  gap-sm mt-3xl  px-sm  w-full">
          <Button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            height={"md"}
            size={"sm"}
            className={`  transition-none ${
              page <= 1 ? "invisible  transition-none" : ""
            }`}
          >
            Prev
          </Button>
          <div className="u-flex-center ">
            {pageItems.map((item, idx) =>
              typeof item === "number" ? (
                <Button
                  height={"md"}
                  size={"sm"}
                  key={item} // safe: numbers are unique
                  onClick={() => goToPage(item)}
                  className={clsx(
                    "mx-xs px-xs py-xs text-xs w-lg ",
                    item === page
                      ? "!text-amber-100 dark:!text-cobalt-200 "
                      : "u-bg-transparent  !text-amber-800 dark:!text-cobalt-300"
                  )}
                >
                  {item}
                </Button>
              ) : (
                <span
                  key={`ellipsis-${idx}`} // use the index to disambiguate
                  className="px-[1px] select-none"
                >
                  {item}
                </span>
              )
            )}
          </div>

          {/*  */}
          <Button
            disabled={page === totalPages}
            onClick={() => {
              goToPage(page + 1);
            }}
            height={"md"}
            size={"sm"}
            className={`    ${
              page >= totalPages ? "invisible transition-none" : ""
            }`}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
