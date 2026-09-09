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
import GlobalTopLoader from "@/features/components/shared/GlobalTopLoader";

export const metadata = {
  title: "OwlVibe – Connect & Share",
  description:
    "A full-stack social media platform built with React, Next.js, Node.js, TypeScript, GraphQL, and Docker. Features live notifications, posts, comments, and follows.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230f172a"/><circle cx="35" cy="40" r="15" fill="white"/><circle cx="65" cy="40" r="15" fill="white"/><polygon points="50,70 40,90 60,90" fill="white"/></svg>',
  },
  manifest: "/manifest.json",
  // ADD THIS OPENGRAPH BLOCK:
  openGraph: {
    title: "OwlVibe – Full-Stack Social Media App",
    description:
      "Built with React, Next.js, Node.js, TypeScript, GraphQL, NestJS, and Docker. Deployed and live.",
    url: "https://hamidreza-ahmadi.sbs",
    siteName: "OwlVibe",
    images: [
      {
        url: "https://hamidreza-ahmadi.sbs/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OwlVibe Social Media App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // ADD TWITTER CARD (optional but helps):
  twitter: {
    card: "summary_large_image",
    title: "OwlVibe – Full-Stack Social Media App",
    description:
      "Built with React, Next.js, Node.js, TypeScript, GraphQL, and Docker.",
    images: ["https://hamidreza-ahmadi.sbs/og-image.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
  maximumScale: 5,
  userScalable: true,
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
          <GlobalTopLoader />
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
        {/*  */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        const meta = document.querySelector('meta[name="viewport"]');
        const original = meta.getAttribute('content');
        const locked = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';

        function lock() { meta.setAttribute('content', locked); }
        function restore() { meta.setAttribute('content', original); }

        document.addEventListener('focusin', (e) => {
          const tag = e.target.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') lock();
        });
        document.addEventListener('focusout', (e) => {
          const tag = e.target.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') restore();
        });
      })();
    `,
          }}
        />
      </body>
    </html>
  );
}
