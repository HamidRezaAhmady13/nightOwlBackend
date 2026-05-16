import { Post } from "@/features/types";
import { useState } from "react";
import Button from "../shared/Button";
import { clsx } from "clsx";

export function PostContent({
  post,
  isExpanded = false,
}: {
  post: Post;
  isExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState<boolean>(isExpanded);
  const MAX_LENGTH = 120;
  const contentToShow =
    !expanded && post.content.length > MAX_LENGTH
      ? post.content.slice(0, MAX_LENGTH) + "..."
      : post.content;

  return (
    <>
      <div className=" u-flex-start ml-[12rem]  rounded-full max-w-[25rem] ">
        <div>
          <p className="mt-md">{contentToShow}</p>
          {post.content.length > MAX_LENGTH && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className={clsx(
                "u-bg-transparent hover:u-bg-transparent hover:scale-110",
                "!text-cobalt-400 dark:!text-cobalt-200",
              )}
            >
              {expanded ? "Show less" : "Read more"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
