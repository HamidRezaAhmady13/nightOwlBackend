import { SignupFormData, SignupFormErrors } from "@/features/types";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateOptionalUrl,
  validateAvatarFile,
} from "./validators";

export function validateSignupForm(form: SignupFormData) {
  const errors: SignupFormErrors = {
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    username: validateUsername(form.username),
    website: validateOptionalUrl(form.website),
    avatarUrl: validateAvatarFile(form.avatarUrl),
    bio: "",
    location: "",
  };

  const message = errors.username
    ? errors.username
    : errors.email
    ? errors.email
    : errors.password
    ? errors.password
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
