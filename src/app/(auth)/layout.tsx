import { MarketingNav } from "@/components/layout/MarketingNav";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg">
      <MarketingNav />
      {children}
    </div>
  );
}
