import "react-tuby/css/main.css";
import "@/styles/index.css";

import { Inter, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AppShell } from "@/features/components/layout/AppShell";
import { PageRow } from "@/features/components/layout/PageRow";
import { PageMain } from "@/features/components/layout/PageMain";
import SafeFullscreenShim from "@/features/components/SafeFullscreenShim";
import { AuthProvider } from "@/features/components/AuthContext";
import ReactQueryProvider from "@/features/components/ReactQueryProvider";
import ThemeWrapper from "@/features/components/ThemeWrapper";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Social App",
  description: "Chat, post, and call in real time",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <body className="o-app-root min-h-screen">
        <ReactQueryProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "var(--toast-bg)",
                color: "var(--toast-text)",
                transition: "all 0.3s ease-in-out",
              },
              success: {
                iconTheme: {
                  primary: "var(--toast-text)",
                  secondary: "var(--toast-bg)",
                },
              },
            }}
          />
          <SafeFullscreenShim />
          <ThemeWrapper>
            <AppShell>
              <PageRow>
                <PageMain>
                  <AuthProvider>{children}</AuthProvider>
                </PageMain>
              </PageRow>
            </AppShell>
          </ThemeWrapper>
          <ReactQueryDevtools initialIsOpen={false} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
