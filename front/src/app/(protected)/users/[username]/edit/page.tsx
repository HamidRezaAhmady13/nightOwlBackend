"use client";

import Button from "@/features/components/shared/Button";
import FormInput from "@/features/components/forms/FormInput";
import Spinner from "@/features/components/shared/Spinner";
import FileUploadInput from "@/features/components/forms/FileUploadInput";
import { useEditProfile } from "@/features/hooks/useEditProfile";

export default function EditProfilePage() {
  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    handleFileChange,
  } = useEditProfile();

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto o-edit-profile shadow-lg  ">
      <h1 className="u-text-lg u-text-secondary mb-xl">Edit Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-md">
        <FormInput
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          error={errors.username}
        />
        <FormInput
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email"
          error={errors.email}
        />
        <FormInput
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Bio"
          multiline={true}
          error={errors.bio}
        />
        <FormInput
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          error={errors.location}
        />
        <FormInput
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="Website"
          error={errors.website}
        />
        <div className="pb-xl">
          <FileUploadInput
            name="avatarUrl"
            selectedFile={formData.avatarUrl}
            onChange={(file) => {
              handleFileChange(file);
            }}
            className="w-full p-sm u-border "
          />
        </div>
        <div className="u-flex-center py-xl">
          <Button
            disabled={isLoading}
            label="Save Changes"
            type="submit"
            className="w-full"
          />
        </div>
      </form>
    </div>
  );
}
