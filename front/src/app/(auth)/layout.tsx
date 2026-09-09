import "react-tuby/css/main.css";
import "@/styles/index.css";

import React from "react";
import Header from "@/features/components/header/Header";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
