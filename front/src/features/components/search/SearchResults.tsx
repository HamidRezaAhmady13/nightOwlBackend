import { useRouter } from "next/navigation";

import Spinner from "../shared/Spinner";
import SearchItem from "./UserItem";

export function SearchResults({
  users,
  onSelect,
  loading,
}: {
  users: any[];
  onSelect: () => void;
  loading: boolean;
}) {
  const router = useRouter();

  if (loading)
    return (
      <div className="u-flex-center min-h-[calc((3rem+0.5rem)*5-0.5rem)]">
        <Spinner />
      </div>
    );
  if (users.length === 0) return <div className="p-sm ">No results</div>;

  return (
    <>
      {users.map((user) => (
        <SearchItem user={user} key={user.username} onClick={onSelect} />
      ))}
    </>
  );
}
