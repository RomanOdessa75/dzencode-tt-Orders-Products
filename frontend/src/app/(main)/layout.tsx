import ClientLayoutShell from "./ClientLayoutShell";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutShell>{children}</ClientLayoutShell>;
}
