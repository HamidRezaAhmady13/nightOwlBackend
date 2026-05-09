"use client";

import { useEffect, useState, ReactNode } from "react";

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  return <div className={theme === "dark" ? "dark" : ""}>{children}</div>;
}
