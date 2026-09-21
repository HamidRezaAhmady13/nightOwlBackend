import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us – OwlVibe",
  description:
    "OwlVibe is a sample social platform built with NestJS, Next.js, Docker, and Postgres — blending modern tech with Persian heritage and Rumi’s poetry.",
  alternates: { canonical: "https://hamidreza-ahmadi.sbs/about" },
  openGraph: {
    title: "About Us – OwlVibe",
    description:
      "OwlVibe is a sample social platform built with NestJS, Next.js, Docker, and Postgres — blending modern tech with Persian heritage and Rumi’s poetry.",
    url: "https://hamidreza-ahmadi.sbs/about",
    images: ["https://hamidreza-ahmadi.sbs/og-about.png"],
  },
};

export default function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto px-md py-xl md:py-2xl space-y-xl">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About OwlVibe",
            url: "https://hamidreza-ahmadi.sbs/about",
          }),
        }}
      />

      {/* Header Section */}
      <div className="space-y-md text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight u-text-secondary">
          About{" "}
          <span className="u-text-theme-soft hover:u-text-theme transition-all duration-slow">
            OwlVibe
          </span>
        </h1>
        <p className="text-lg u-text-primary max-w-2xl mx-auto">
          A space for authentic connections, built on a foundation of
          cutting-edge web engineering.
        </p>
      </div>

      {/* The Story Section */}
      <section className="space-y-sm">
        <h2 className="text-3xl u-text-secondary u-border-b pb-xs">
          The Journey
        </h2>
        <p className="u-text-primary leading-relaxed text-xl">
          OwlVibe is more than just a social platform, it is the culmination of
          relentless iteration and a pursuit of technical excellence. What began
          as a concept has been rebuilt and refined from the ground up through
          three major architectural evolutions. Every pixel, API endpoint, and
          caching layer has been meticulously crafted to deliver a seamless,
          blazing-fast user experience.
        </p>
      </section>

      {/* The Tech Stack Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold u-text-secondary u-border-b pb-xs">
          The Engine Room
        </h2>
        <p className="u-text-primary leading-relaxed">
          Performance and scalability aren't just buzzwords here—they are baked
          into the core architecture. OwlVibe is powered by a modern, type-safe
          full-stack ecosystem:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-sm">
          {/* Frontend Card */}
          <div className="p-md u-bg-deep rounded-xl u-border">
            <h3 className="font-semibold text-lg u-text-primary mb-sm">
              Frontend
            </h3>
            <ul className="space-y-xs u-text-secondary-soft">
              <li>
                •{" "}
                <span className="font-medium u-text-primary">
                  Next.js & React:
                </span>{" "}
                Server-side rendering and fluid UI.
              </li>
              <li>
                •{" "}
                <span className="font-medium u-text-primary">
                  TanStack Query:
                </span>{" "}
                Advanced caching and optimistic updates.
              </li>
              <li>
                •{" "}
                <span className="font-medium u-text-primary">
                  Tailwind CSS:
                </span>{" "}
                Responsive, utility-first design system.
              </li>
              <li>
                • <span className="font-medium u-text-primary">Zustand:</span>{" "}
                Lightweight, blazing-fast global state.
              </li>
            </ul>
          </div>

          {/* Backend Card */}
          <div className="p-md u-bg-deep rounded-xl u-border">
            <h3 className="font-semibold text-lg u-text-primary mb-sm">
              Backend
            </h3>
            <ul className="space-y-xs u-text-secondary-soft">
              <li>
                • <span className="font-medium u-text-primary">NestJS:</span>{" "}
                Enterprise-grade, modular backend architecture.
              </li>
              <li>
                •{" "}
                <span className="font-medium u-text-primary">PostgreSQL:</span>{" "}
                Relational, rock-solid data integrity.
              </li>
              <li>
                • <span className="font-medium u-text-primary">Socket.IO:</span>{" "}
                Real-time bidirectional event streams.
              </li>
              <li>
                •{" "}
                <span className="font-medium u-text-primary">TypeScript:</span>{" "}
                End-to-end type safety across the entire stack.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Creator Section */}
      <section className="space-y-md">
        <h2 className="text-2xl font-bold u-text-primary u-border-b pb-sm">
          The Creator
        </h2>
        <p className="u-text-secondary leading-relaxed text-lg">
          OwlVibe is architected, designed, developed and deployed by a solo
          full-stack engineer. It stands as a demonstration of translating
          complex requirements—like infinite scrolling, real-time concurrency,
          and secure auth flows—into a polished, production-ready product.
        </p>

        <div className="flex gap-md mt-sm">
          <a
            href="https://github.com/HamidRezaAhmady13"
            target="_blank"
            rel="noopener noreferrer"
            className="u-text-cobalt-soft hover:u-text-cobalt underline"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/hamidreza-ahmadi-953870230/"
            target="_blank"
            rel="noopener noreferrer"
            className="u-text-cobalt-soft hover:u-text-cobalt underline"
          >
            LinkedIn
          </a>
        </div>
      </section>

      <div className="pt-xl pb-md">
        <p className="my-2xl">
          If you’re not familiar with Persian language or culture, and maybe
          never heard of Rumi before — here’s a piece, actually a masterpiece,
          that speaks for itself:
        </p>

        <blockquote
          lang="fa"
          dir="rtl"
          className="border-l-4 border-amber-600 dark:border-cobalt-600 pl-md italic"
        >
          <p className="text-lg font-serif">
            می‌کشدم می به چپ می‌کشدم دل به راست{" "}
          </p>
          <p className="text-sm mt-2">
            “My heart pulls me to the right, and wine pulls me to the left”
          </p>

          <p className="text-lg font-serif mt-xl">
            رو که کشاکش خوش است. تو چه کشیدی بگو{" "}
          </p>

          <p className="text-sm mt-2">
            “Go on, for this tug-of-war is sweet. Tell me, what did you pull? ”
          </p>
        </blockquote>
      </div>
    </div>
  );
}
