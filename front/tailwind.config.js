/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  images: {
    domains: ["api.example.com", "cdn.example.com"],
  },
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css", // fixed glob
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-space)", "sans-serif"],
      },
      fontSize: {
        xxs: ["0.8rem", { lineHeight: "1.2rem" }], // 12px
        xs: ["1.2rem", { lineHeight: "1.4rem" }], // 12px
        sm: ["1.4rem", { lineHeight: "1.6rem" }], // 14px
        md: ["1.6rem", { lineHeight: "1.8rem" }], // 16px
        lg: ["1.8rem", { lineHeight: "2rem" }], // 18px
        xl: ["2.0rem", { lineHeight: "2.2rem" }], // 20px
        "2xl": ["2.5rem", { lineHeight: "1.3" }],
        "3xl": ["3rem", { lineHeight: "1.2" }],
      },
      spacing: {
        xxs: "0.2rem", // 4px
        xs: "0.4rem", // 4px
        sm: "0.8rem", // 8px
        md: "1.6rem", // 16px
        lg: "2.4rem", // 24px
        xl: "3.2rem", // 32px
        "2xl": "4.8rem", // 48px
        "3xl": "6.4rem", // 64px
      },
      borderRadius: {
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.75rem",
        full: "9999px",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(var(--tw-shadow-color),0.05)",
        md: "0 4px 6px -1px rgba(var(--tw-shadow-color),0.1)",
        lg: "0 8px 10px 3px rgba(var(--tw-shadow-color),0.1)",
        xl: "0px 10px 15px 5px rgba(var(--tw-shadow-color),0.15)",
      },
      zIndex: {
        auto: "auto",
        base: 0,
        dropdown: 1000,
        modal: 1100,
        tooltip: 1200,
      },
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      ringColor: (theme) => ({
        "focus-light": theme("colors.focus.light"),
        "focus-dark": theme("colors.focus.dark"),
      }),
      ringOffsetColor: (theme) => ({
        // so ring-offset-… matches your BG tokens
        light: theme("colors.light.background"),
        dark: theme("colors.dark.background"),
      }),
      ringWidth: {
        DEFAULT: "4px",
      },
      colors: {
        focus: {
          light: "#ffc107", // amber-500
          dark: "#4f46e5", // cobalt-500
        },

        // Shared base colors
        primary: "#F59E0B", // Amber
        secondary: "#1E40AF", // Cobalt Blue
        accent: "#10B981", // Emerald
        muted: "#6B7280", // Gray

        // Light theme overrides
        light: {
          background: "#F9FAFB",
          foreground: "#1F2937",
        },

        // Dark theme overrides
        dark: {
          background: "#0F172A",
          foreground: "#E5E7EB",
        },

        cobalt: {
          50: "#e0e7ff",
          100: "#c7d2fe",
          200: "#a5b4fc",
          300: "#818cf8",
          400: "#6366f1",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1a237e",
          950: "#0f172a",
        },
        amber: {
          50: "#fff8e1",
          100: "#ffecb3",
          200: "#ffe082",
          300: "#ffd54f",
          400: "#ffca28",
          500: "#ffc107",
          600: "#ffb300",
          700: "#ffa000",
          800: "#ff8f00",
          900: "#ff6f00",
          950: "#e65100",
        },
      },
    },
  },
  plugins: [],
};
