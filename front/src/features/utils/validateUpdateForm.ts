import { UpdateUserFormData, UpdateUserFormErrors } from "@/features/types";
import {
  validateUsername,
  validateOptionalUrl,
  validateAvatarFile,
} from "./validators";

export function validateUpdateForm(form: UpdateUserFormData) {
  const errors: UpdateUserFormErrors = {
    username: validateUsername(form.username),
    website: validateOptionalUrl(form.website),
    avatarUrl: validateAvatarFile(form.avatarUrl),
    bio: "",
    location: "",
  };

  const message = errors.username
    ? errors.username
    : errors.website
    ? errors.website
    : errors.avatarUrl
    ? errors.avatarUrl
    : "";
  return {
    isValid: !Object.values(errors).some(Boolean),
    errors,
    message,
  };
}
