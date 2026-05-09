export function PageRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`m-page-row mb-md text-xs     ${className}`}>
      {children}
    </div>
  );
}
