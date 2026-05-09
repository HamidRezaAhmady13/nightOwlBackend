"use client";

import NavButton from "@/features/components/shared/Button";
import { useRouter } from "next/navigation";
import "@/styles/index.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center u-bg-soft text-center px-4">
      <h1 className=" font-bold u-text-error-lg  mb-xl  ">
        404 - Page Not Found
      </h1>
      <p className="text-lg u-text-primary  mb-lg">
        Looks like this page doesn’t exist. You can go back to where you came
        from, or head home.
      </p>

      <div className="flex flex-row items-center gap-md">
        <NavButton label="go home" onClick={() => router.push("/feed")} />
        <p className="text-xl">or</p>
        <NavButton label="go back" onClick={() => router.back()} />
      </div>
    </div>
  );
}
