import ProtectedClient from "@/features/components/ProtectedClient";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedClient>{children}</ProtectedClient>;
}
