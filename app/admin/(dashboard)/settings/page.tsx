import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { SettingsForm, HomepageSectionForm } from "@/components/admin/settings-forms";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const ctx = await getAdminContext();
  const canSettings = hasPermission(ctx, "settings.manage");
  const canHomepage = hasPermission(ctx, "homepage.manage");
  if (!canSettings && !canHomepage) return <AccessDenied />;

  const [settings, sections] = await Promise.all([
    canSettings
      ? db.siteSetting.findMany({ orderBy: { key: "asc" }, select: { id: true, key: true, value: true, type: true } })
      : Promise.resolve([]),
    canHomepage
      ? db.homepageSection.findMany({
          orderBy: { sortOrder: "asc" },
          select: { id: true, sectionKey: true, title: true, subtitle: true, content: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader title="Settings" description="Website settings and homepage sections. Changes apply immediately." />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        {canSettings && <SettingsForm settings={settings} />}
        {canHomepage && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold">Homepage sections</h2>
            {sections.map((s) => (
              <HomepageSectionForm key={s.id} section={s} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
