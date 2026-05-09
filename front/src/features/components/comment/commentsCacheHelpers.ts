import type {
  ApiComment,
  CommentsCache,
  CommentsPage,
  CommentWithLikeState,
} from "../../types";

const PAGE_LIMIT_ENV = Number(process.env.PAGE_LIMIT ?? "50");

export function toWithLikeState(c: ApiComment): CommentWithLikeState {
  return {
    ...c,
    likedByCurrentUser: c.likedByCurrentUser ?? false,
    childComments: c.childComments?.map(toWithLikeState),
  };
}

export function insertTopLevel(
  old: CommentsCache | undefined,
  item: ApiComment
): CommentsCache {
  const normalized = toWithLikeState(item);
  if (!old) {
    return { pages: [{ data: [normalized], page: 1 }], pageParams: [1] };
  }
  const pages = old.pages.map((p, idx) =>
    idx === 0
      ? { ...p, data: [normalized, ...p.data.filter((c) => c.id !== item.id)] }
      : p
  );
  return { ...old, pages };
}

export function replaceOptimisticPage(
  page: CommentsPage,
  optimisticId: string,
  real: ApiComment
): CommentsPage {
  const normalized = toWithLikeState(real);
  const newData = (page.data ?? [])
    .map((c) => (c.id === optimisticId ? normalized : c))
    .filter((v, i, arr) => arr.findIndex((a) => a.id === v.id) === i);

  return { ...page, data: newData };
}

export function replaceOptimistic(
  old: CommentsCache | undefined,
  optimisticId: string,
  real: ApiComment
): CommentsCache {
  if (!old) {
    return {
      pages: [{ data: [toWithLikeState(real)], page: 1 }],
      pageParams: [1],
    };
  }
  const pages = old.pages.map((p, idx) =>
    idx === 0 ? replaceOptimisticPage(p, optimisticId, real) : p
  );
  return { ...old, pages };
}

export function tryMergeReplyIntoRoots(
  comments: CommentsCache | undefined,
  parentId: string,
  reply: ApiComment
): CommentsCache | undefined {
  if (!comments) return comments;
  const normalizedReply = toWithLikeState(reply);
  const pages = comments.pages.map((p, idx) =>
    idx === 0
      ? {
          ...p,
          data: p.data.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  childComments: [...(c.childComments ?? []), normalizedReply],
                  replyCount: (c.replyCount ?? 0) + 1,
                }
              : c
          ),
        }
      : p
  );

  return { ...comments, pages };
}
