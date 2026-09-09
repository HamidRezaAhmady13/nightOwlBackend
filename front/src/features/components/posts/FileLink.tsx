export default function FileLink({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-sm p-sm u-bg-soft u-text-cobalt rounded shadow-sm">
      <svg
        className="w-lg h-lg u-text-cobalt "
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>

      <button
        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        className="text-sm u-text-cobalt-sharp underline hover:u-text-cobalt-sharper transition-all duration-normal"
      >
        {url.split("/").pop()}
      </button>
    </div>
  );
}
