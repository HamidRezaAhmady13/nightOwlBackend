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

type SignupForm = Omit<User, "id" | "avatarUrl"> & {
  password: string;
  avatarUrl: File | null;
};
export type SignupFormData = SignupForm;
export type SignupFormErrors = Partial<Record<keyof SignupForm, string>>;

export type UpdateUserFormData = Omit<
  User,
  "id" | "following" | "avatarUrl"
> & {
  avatarUrl: File | null;
};
export type UpdateUserFormErrors = Partial<
  Record<keyof UpdateUserFormData, string>
>;
