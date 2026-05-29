import { DiscoveryShell } from "@/components/layout/DiscoveryShell";

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return <DiscoveryShell>{children}</DiscoveryShell>;
}
