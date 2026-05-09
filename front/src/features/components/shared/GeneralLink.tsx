import Link from "next/link";

export function GeneralLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: any;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
