export function AppShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`o-app-shell  ${className}`}>{children}</div>;
}
