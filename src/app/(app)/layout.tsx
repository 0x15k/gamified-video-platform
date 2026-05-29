import { UserShell } from "@/components/layout/UserShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <UserShell>{children}</UserShell>;
}
