"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { USER_NAV } from "@/lib/rbac/navigation";
import { usePlatformBrand } from "@/components/platform/PlatformBrand";
import { UserMenu } from "@/components/layout/UserMenu";

export function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const siteName = usePlatformBrand();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    void fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnread(d.unreadCount ?? 0))
      .catch(() => setUnread(0));
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-xs font-black text-black">
              ▶
            </span>
            {siteName}
          </Link>
          <UserMenu />
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-6">
            {USER_NAV.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {section.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                          active
                            ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-white"
                        }`}
                      >
                        {item.label}
                        {item.badge === "notifications" && unread > 0 && (
                          <span className="ml-2 rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-bold text-black">
                            {unread}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
