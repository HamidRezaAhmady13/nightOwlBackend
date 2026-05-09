import "react-tuby/css/main.css";
import "@/styles/index.css";

import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="protected-wrapper">
      {/* You can add navbars, sidebars, or context providers here */}
      {children}
    </div>
  );
}
