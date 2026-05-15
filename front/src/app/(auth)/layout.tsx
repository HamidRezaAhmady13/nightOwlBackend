import "react-tuby/css/main.css";
import "@/styles/index.css";

import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
