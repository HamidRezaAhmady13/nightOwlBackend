import { SignupFormData } from "../types";

export function buildFormData(form: SignupFormData) {
  const formData = new FormData();

  formData.append("email", form.email);
  formData.append("password", form.password);
  formData.append("passwordConfirm", form.passwordConfirm);

  return formData;
}
