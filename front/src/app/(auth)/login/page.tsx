"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";

import Button from "@/features/components/shared/Button";
import FormInput from "@/features/components/forms/FormInput";
import { GeneralLink } from "@/features/components/shared/GeneralLink";
import { useLoginForm } from "@/features/hooks/useLoginForm";
import { redirectToGoogleAuth } from "@/features/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleLogin,
  } = useLoginForm();

  return (
    <div className="o-login   max-w-xl mx-auto mt-2xl min-w-[35rem]">
      <h2 className="u-text-2xl u-text-secondary text-center  mb-md ">
        Sign In
      </h2>
      <form onSubmit={handleLogin}>
        <div className="u-flex-col-center  ">
          <FormInput
            type="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            required
            wrapperClassName="min-w-full"
          />

          <FormInput
            type="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            required
            wrapperClassName="min-w-full"
          />

          <div className="u-flex-center  min-h-lg">
            {error && <p className="error">{error}</p>}
          </div>
        </div>

        <Button
          full={true}
          size={"sm"}
          height={"md"}
          label="Login"
          type="submit"
          disabled={loading}
          className=" my-0"
        />
      </form>

      <div className="  mt-xl   ">
        <p className="u-grey-text text-center u-flex-center  ">
          <span className="pr-sm">Don’t have an account?</span>

          <GeneralLink
            href="/signup"
            className={clsx(
              "u-flex-center",
              "text-lg",
              "transform transition-all duration-normal ",
              "h-2xl w-3xl ",
              "rounded-md",
              "w-40",
              "hover:scale-110",
              "u-text-cobalt",
              "u-focus-not-visible",
            )}
          >
            Sign up
          </GeneralLink>
        </p>
      </div>
    </div>
  );
}
