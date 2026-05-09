export function buildFormData(form: {
  username: string;
  email: string;
  password: string;
  avatarUrl?: File | null;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
}) {
  const formData = new FormData();

  formData.append("username", form.username);
  formData.append("email", form.email);
  formData.append("password", form.password);

  if (form.avatarUrl) {
    formData.append("avatar", form.avatarUrl);
  }

  if (form.bio) formData.append("bio", form.bio);
  if (form.location) formData.append("location", form.location);
  if (form.website) formData.append("website", form.website);
  if (form.interests?.length) {
    form.interests.forEach((interest) => {
      formData.append("interests", interest);
    });
  }

  return formData;
}
