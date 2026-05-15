import "react-tuby/css/main.css";
import "@/styles/index.css";

import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AppShell } from "@/features/components/layout/AppShell";
import { PageRow } from "@/features/components/layout/PageRow";
import { PageMain } from "@/features/components/layout/PageMain";
import SafeFullscreenShim from "@/features/components/SafeFullscreenShim";
import { AuthProvider } from "@/features/components/AuthContext";
import ReactQueryProvider from "@/features/components/ReactQueryProvider";

export const metadata = {
  title: "Social App",
  description:
    "Share posts and have live notifications on likes and comments and follows ",
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
      className={`${theme === "dark" ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = document.cookie.replace(/(?:(?:^|.*;\\s*)theme\\s*\\=\\s*([^;]*).*$)|^.*$/, "$1") || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
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
          <AppShell>
            <PageRow>
              <PageMain>
                <AuthProvider>{children}</AuthProvider>
              </PageMain>
            </PageRow>
          </AppShell>
          <ReactQueryDevtools initialIsOpen={false} />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
