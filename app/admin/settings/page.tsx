/**
 * Settings page — Server Component wrapper.
 *
 * READ COST: 1 cached Firestore doc read (getSettings, 5-min TTL).
 * Settings are pre-loaded server-side and passed as props to the form,
 * eliminating the client-side fetch("/api/settings") on every mount.
 */
import { getSettings } from "@/lib/db";
import SettingsForm from "./_components/SettingsForm";

// Render fresh HTML each request; settings data still served from 5-min cache
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // READ: getSettings() — 0 Firestore reads if cache is warm (5 min TTL)
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="ios-large-title pt-1">Settings</h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
          Preferences &amp; configuration
        </p>
      </div>

      {/* SettingsForm is a client component — receives initial data via props, no fetch on mount */}
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
