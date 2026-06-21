"use client";

import Button from "@/features/components/shared/Button";
import FormInput from "@/features/components/forms/FormInput";
import Spinner from "@/features/components/shared/Spinner";
import FileUploadInput from "@/features/components/forms/FileUploadInput";
import { useEditProfile } from "@/features/hooks/useEditProfile";
import { useCurrentUser } from "@/features/components/AuthContext";
import { useState } from "react";
import ConfirmModal from "@/features/components/shared/ConfirmModal";

export default function EditProfilePage() {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    handleFileChange,
    setRemoveAvatar,
    removeAvatarMutation,
  } = useEditProfile();
  const { user: currentUser } = useCurrentUser();
  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl mt-3xl mx-auto o-edit-profile shadow-lg  ">
      <h1 className="u-text-lg u-text-secondary mb-xl">
        Update or complete Your Profile
      </h1>
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
        <div className="pb-xl ">
          <FileUploadInput
            name="media-upload"
            label="Choose Media"
            accept="image/*,video/*"
            selectedFile={formData.avatarUrl}
            onChange={(file) => {
              handleFileChange(file);
            }}
            className="u-bg-deep"
          />
          {currentUser?.avatarUrl &&
            currentUser?.avatarUrl !== "/uploads/default-avatar.png" && (
              <Button
                intent={"invisible"}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRemoveModal(true);
                }}
                size={"md"}
                height={"md"}
                className="u-text-xs u-bg-red u-text-sharp mt-md hover:u-bg-red-deep "
              >
                Remove profile photo
              </Button>
            )}
          {showRemoveModal && (
            <ConfirmModal
              title="Remove Avatar"
              message="Are you sure you want to remove your profile photo? This will use the default avatar."
              onConfirm={() => {
                setShowRemoveModal(false);
                removeAvatarMutation.mutate();
              }}
              onCancel={() => setShowRemoveModal(false)}
              isLoading={false}
            />
          )}
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
