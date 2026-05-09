import { Post } from "../../types/post.types";

export type PostActionsProps = {
  post: Post;
  currentUserId: string;
  onCommentClick: () => void;
};

export type PostShellProps = {
  post: Post;

  children?: React.ReactNode;
  onClickComment: () => void;
};
