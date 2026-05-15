"use client";

import { useRouter } from "next/navigation";

import Button from "@/features/components/shared/Button";
import FormInput from "@/features/components/forms/FormInput";
import { useSignupForm } from "@/features/hooks/useSignupForm";
import { API_URL } from "@/features/lib/api";

export default function SignupPage() {
  const { form, errors, loading, handleChange, handleSubmit, disabled } =
    useSignupForm();

  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto mt-2xl min-w-[35rem] o-signup ">
      <h1 className="text-2xl u-text-secondary-soft   font-bold mb-lg ">
        Create Account
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        <FormInput
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          error={errors.email}
        />

        <FormInput
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="username"
          required
          error={errors.username}
        />

        <FormInput
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          error={errors.password}
        />

        <FormInput
          type="password"
          name="passwordConfirm"
          value={form.passwordConfirm}
          onChange={handleChange}
          placeholder="Password"
          required
          error={errors.passwordConfirm}
        />

        <div>
          <Button
            label="Sign Up"
            className="w-full my-0"
            disabled={loading}
            type="submit"
            height={"md"}
            size={"sm"}
          />
          {/* <div className="m-divider-row ">
            <div className="m-divider-line my-md " />
            <span className="u-text-secondary">or</span>
            <div className="m-divider-line my-md " />
          </div>
          <Button
            label="Sign up with Google"
            type="button"
            className="w-full  my-0"
            height={"md"}
            size={"sm"}
            onClick={() => {
              window.location.href = `${API_URL}/auth/google`;
            }}
          /> */}
        </div>
      </form>
    </div>
  );
}
