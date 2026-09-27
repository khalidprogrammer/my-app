import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/states";
import { MediaUpload, MediaItem } from "@/components/admin/media-components";

export const metadata = { title: "Media" };

export default async function AdminMediaPage() {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "media.view")) return <AccessDenied />;
  const canUpload = hasPermission(ctx, "media.create");
  const canDelete = hasPermission(ctx, "media.delete");

  const items = await db.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, url: true, fileName: true, altText: true, fileSize: true, createdAt: true },
  });

  return (
    <>
      <PageHeader
        title="Media"
        description="Image library for products and content. Files in use cannot be deleted."
      />
      {canUpload && <MediaUpload />}
      {items.length === 0 ? (
        <EmptyState title="Media library is empty" description="Upload the first image to get started." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <MediaItem key={m.id} media={m} canEdit={canUpload} canDelete={canDelete} />
          ))}
        </ul>
      )}
    </>
  );
}
