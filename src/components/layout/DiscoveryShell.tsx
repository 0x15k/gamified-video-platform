import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdProvider } from "@/components/ads/AdContext";
import { DiscoveryHeader } from "@/components/layout/DiscoveryHeader";
import { getAdConfig } from "@/lib/ads/config";
import { getPlatformSettings } from "@/lib/platform/settings";
import { shouldShowAds } from "@/lib/ads/should-show-ads";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import type { SubscriptionPlan } from "@/lib/rbac/types";

export async function DiscoveryShell({
  children,
  showTopAd = true,
}: {
  children: React.ReactNode;
  showTopAd?: boolean;
}) {
  const [platform, adConfig] = await Promise.all([
    getPlatformSettings(),
    Promise.resolve(getAdConfig()),
  ]);
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyAccessToken(token) : null;
  const plan = (payload?.plan as SubscriptionPlan | undefined) ?? null;
  const staff = payload?.accountType === "ADMIN";
  const adsOn =
    platform.adsEnabled &&
    adConfig.enabled &&
    shouldShowAds({ adsEnabled: true, plan, isStaff: staff });

  return (
    <AdProvider config={adConfig}>
      <div className="min-h-screen bg-[var(--bg-base)]">
        <div className="mx-auto max-w-[1540px] px-4 sm:px-6">
          <DiscoveryHeader
            siteName={platform.siteName}
            isAdult={platform.vertical === "ADULT"}
          />
          {showTopAd && adsOn && (
            <div className="mb-4 overflow-hidden rounded-lg">
              <AdSlot
                placement="catalog_top"
                zoneId={adConfig.zones.catalog_top}
                scriptUrl={adConfig.scriptUrl}
                className="min-h-[90px]"
              />
            </div>
          )}
          <div className="flex gap-6 pb-12">
            <div className="min-w-0 flex-1">{children}</div>
            {adsOn && (
              <aside className="hidden w-40 shrink-0 xl:block 2xl:w-52">
                <div className="sticky top-24">
                  <AdSlot
                    placement="catalog_sidebar"
                    zoneId={adConfig.zones.catalog_sidebar}
                    scriptUrl={adConfig.scriptUrl}
                    className="min-h-[560px] rounded-lg"
                  />
                </div>
              </aside>
            )}
          </div>
          <footer className="border-t border-[var(--border-subtle)] py-8 text-center text-xs text-[var(--text-dim)]">
            <Link href="/legal/terms" className="hover:text-[var(--accent)]">
              Términos
            </Link>
            {" · "}
            <Link href="/legal/privacy" className="hover:text-[var(--accent)]">
              Privacidad
            </Link>
            {platform.vertical === "ADULT" && (
              <>
                {" · "}
                <span className="text-[var(--text-muted)]">Solo +18</span>
              </>
            )}
            <span className="mt-3 block text-[var(--text-dim)]">Hecho por YL :)</span>
          </footer>
        </div>
      </div>
    </AdProvider>
  );
}
