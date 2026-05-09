import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SearchResults } from "./SearchResults";
import SearchInput from "./SearchInput";
import { useClickOutside } from "@/features/hooks/useClickOutside";
import { useUserSearch } from "@/features/hooks/useUserSearch";

function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useClickOutside(modalRef, () => setIsOpen(false));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}&limit=20&page=1`);
    setIsOpen(false);
  };

  const { results: searchResults, loading } = useUserSearch({
    query,
    limit: 5,
    page: 1,
  });

  return (
    <div className={`relative h-full u-bg-main ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="h-full flex">
        <SearchInput
          className={className}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
        />
      </form>

      {isOpen && (
        <div ref={modalRef} className="m-search-bar  mt-sm">
          <SearchResults
            users={searchResults}
            onSelect={() => setIsOpen(false)}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

export default SearchBar;
