export const queryKeys = {
  posts: {
    all: ["posts"] as const,

    list: (page: number, limit: number) => ["posts", { page, limit }] as const,

    infinite: (limit: number) =>
      ["posts", { type: "infinite", limit }] as const,

    detail: (postId: string | undefined) => ["post", { postId }] as const,
  },

  notifications: {
    all: ["notifications"] as const,

    list: (userId: string | undefined) =>
      ["notifications", { userId }] as const,

    infinite: (userId: string | undefined, limit: number = 10) =>
      ["notifications", "infinite", { userId, limit }] as const,

    unread: (userId: string | undefined) =>
      ["notifications", { userId, unread: true }] as const,
  },

  user: {
    current: (token: string | undefined) => ["currentUser", { token }] as const,

    byId: (userId: string | undefined) => ["currentUser", { userId }] as const,

    byUsername: (username: string | undefined) => ["user", { username }],
  },

  comments: {
    all: ["comments"] as const,

    list: (postId: string | undefined) =>
      ["comments", "list", { postId }] as const,
  },

  replies: {
    list: (parentCommentId: string | undefined) =>
      ["replies", "list", { parentCommentId }] as const,
  },
};
