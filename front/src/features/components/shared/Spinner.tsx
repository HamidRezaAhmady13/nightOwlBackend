// "use client";
// type SpinnerProps = { message?: string; size?: number; padding?: boolean };

// export default function Spinner({
//   message,
//   size = 50,
//   padding = true,
// }: SpinnerProps) {
//   return (
//     <div>
//       <div className={`u-flex-col-center ${padding ? "py-xl" : ""}   `}>
//         <div
//           style={{ width: size, height: size }}
//           className={` border-4 border-amber-600 dark:border-cobalt-600
//         border-t-transparent dark:border-t-transparent rounded-full animate-spin  `}
//         />
//         {message && <p className="mt-md u-text-tertiary">{message}</p>}
//       </div>
//     </div>
//   );
// }

"use client";

type SpinnerProps2 = { message?: string; size?: number; padding?: boolean };

export function Spinner2({
  message,
  size = 48,
  padding = true,
}: SpinnerProps2) {
  return (
    <div className={`u-flex-col-center ${padding ? "py-xl" : ""}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center"
      >
        {/* Subtle background track */}
        <svg
          className="absolute inset-0 animate-spin"
          viewBox="0 0 50 50"
          style={{ width: size, height: size }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            className="stroke-amber-600/20 dark:stroke-cobalt-600/20"
            strokeWidth="4"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            className="stroke-amber-600 dark:stroke-cobalt-500"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80, 200"
            strokeDashoffset="0"
          />
        </svg>
      </div>
      {message && (
        <p className="mt-md u-text-tertiary text-sm font-medium">{message}</p>
      )}
    </div>
  );
}

// "use client";

// type SpinnerProps = { message?: string; size?: number; padding?: boolean };

// export default function Spinner({
//   message,
//   size = 48,
//   padding = true,
// }: SpinnerProps) {
//   return (
//     <div className={`u-flex-col-center ${padding ? "py-xl" : ""}`}>
//       <div
//         style={{ width: size, height: size }}
//         className="relative flex items-center justify-center"
//       >
//         <svg
//           className="animate-spin"
//           viewBox="0 0 50 50"
//           style={{ width: size, height: size }}
//         >
//           <defs>
//             <linearGradient
//               id="spinner-gradient"
//               x1="0%"
//               y1="0%"
//               x2="100%"
//               y2="100%"
//             >
//               <stop offset="0%" stopColor="#f09433" />
//               <stop offset="25%" stopColor="#e6683c" />
//               <stop offset="50%" stopColor="#dc2743" />
//               <stop offset="75%" stopColor="#cc2366" />
//               <stop offset="100%" stopColor="#bc1888" />
//             </linearGradient>
//           </defs>
//           <circle
//             cx="25"
//             cy="25"
//             r="20"
//             fill="none"
//             stroke="url(#spinner-gradient)"
//             strokeWidth="4"
//             strokeLinecap="round"
//             strokeDasharray="90, 150"
//             strokeDashoffset="0"
//           />
//         </svg>
//       </div>
//       {message && (
//         <p className="mt-md u-text-tertiary text-sm font-medium">{message}</p>
//       )}
//     </div>
//   );
// }

type SpinnerProps = {
  message?: string;
  className?: string; // Let it adapt to whatever size you want!
};

export default function Spinner({
  message,
  className = "min-h-[50vh]", // Default to taking up a good chunk of the screen
}: SpinnerProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-gray-100 dark:bg-slate-800/40 rounded-xl flex items-center justify-center ${className}`}
    >
      {/* Zero-config CSS animation injected directly! */}
      <style>{`
        @keyframes giantWave {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* The giant passing light wave */}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent"
        style={{ animation: "giantWave 1.5s infinite" }}
      />

      {/* Optional floating message in the middle */}
      {message && (
        <p className="relative z-10 text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase text-sm font-bold animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
