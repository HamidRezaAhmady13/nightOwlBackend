export type UserPreview = Pick<User, "id" | "username" | "avatarUrl">;

export type User = {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  following?: UserPreview[];
  followersCount?: number;
  followingsCount?: number;
};

type SignupForm = Pick<User, "email"> & {
  password: string;
  email: string;
  username: string;
  passwordConfirm: string;
};
export type SignupFormData = SignupForm;
export type SignupFormErrors = Partial<Record<keyof SignupForm, string>>;

export type UpdateUserFormData = Omit<
  User,
  "id" | "following" | "avatarUrl"
> & {
  avatarUrl: File | null;
  removeAvatar?: boolean;
};
export type UpdateUserFormErrors = Partial<
  Record<keyof UpdateUserFormData, string>
>;
