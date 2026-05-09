export function PageMain({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <main className={`m-page-main   ${className}`}>{children}</main>;
}
