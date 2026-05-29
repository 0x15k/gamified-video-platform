import Link from "next/link";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdProvider } from "@/components/ads/AdContext";
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
  const [platform, adConfig] = await Promise.all([getPlatformSettings(), Promise.resolve(getAdConfig())]);
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
      <MarketingNav siteName={platform.siteName} />
      {showTopAd && adsOn && (
        <div className="mb-6">
          <AdSlot
            placement="catalog_top"
            zoneId={adConfig.zones.catalog_top}
            scriptUrl={adConfig.scriptUrl}
          />
        </div>
      )}
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">{children}</div>
        {adsOn && (
          <aside className="hidden w-48 shrink-0 lg:block">
            <AdSlot
              placement="catalog_sidebar"
              zoneId={adConfig.zones.catalog_sidebar}
              scriptUrl={adConfig.scriptUrl}
              className="sticky top-4 min-h-[600px]"
            />
          </aside>
        )}
      </div>
      <footer className="mt-12 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
        <Link href="/legal/terms" className="hover:text-zinc-400">
          Términos
        </Link>
        {" · "}
        <Link href="/legal/privacy" className="hover:text-zinc-400">
          Privacidad
        </Link>
        {platform.vertical === "ADULT" && (
          <>
            {" · "}
            <span>+18</span>
          </>
        )}
      </footer>
    </AdProvider>
  );
}
