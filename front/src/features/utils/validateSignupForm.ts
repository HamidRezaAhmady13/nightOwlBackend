import { SignupFormData, SignupFormErrors } from "@/features/types";
import { validateEmail, validatePassword } from "./validators";

export function validateSignupForm(form: SignupFormData) {
  const errors: SignupFormErrors = {
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    passwordConfirm: validatePassword(form.passwordConfirm),
  };

  const message = errors.email
    ? errors.email
    : errors.password
      ? errors.password
      : errors.passwordConfirm
        ? errors.passwordConfirm
        : "";

  return {
    isValid: !Object.values(errors).some(Boolean),
    errors,
    message,
  };
}
