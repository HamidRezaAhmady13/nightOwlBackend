// src/features/utils/validators.ts
export function validateUsername(username: string) {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return "Username must be between 3 and 20 characters";
  }
  return "";
}

export function validateEmail(email: string) {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "Invalid email address";
  }
  return "";
}

export function validatePassword(password: string) {
  const pwd = password.trim();
  const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,100}$/;
  if (!pwdRegex.test(pwd)) {
    return "Password must be 8–100 characters and include letters and numbers";
  }
  return "";
}

export function validateOptionalUrl(raw?: string) {
  if (!raw) return "";

  // 1) trim whitespace
  const urlString = raw.trim();

  // 2) if no scheme, add https://
  const withProto = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(urlString)
    ? urlString
    : `https://${urlString}`;

  // 3) validate through URL
  try {
    new URL(withProto);
    return "";
  } catch {
    return "Invalid URL";
  }
}

// validators.ts
export function validateAvatarFile(file: File | null): string {
  // no selection = no client‐side error
  if (!file) return "";

  // only allow common image types
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return "Avatar must be jpg, png, or webp";
  }

  // limit size to 2 MB
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return "Avatar must be smaller than 2 MB";
  }

  return "";
}
