import Link from "next/link";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { GalleryAlbumForm } from "@/components/admin/gallery-album-form";
import { AddPhotosForm, PhotoRow } from "@/components/admin/gallery-items";
import { deleteGalleryAlbum } from "@/actions/gallery";

export const metadata = { title: "Gallery" };

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; album?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "gallery.manage")) return <AccessDenied />;

  const { edit, album: albumId } = await searchParams;
  const [albums, editing, activeAlbum, media] = await Promise.all([
    db.galleryAlbum.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, name: true, slug: true, sortOrder: true, status: true,
        _count: { select: { items: true } },
      },
    }),
    edit
      ? db.galleryAlbum.findUnique({
          where: { id: edit },
          select: { id: true, name: true, slug: true, description: true, sortOrder: true, status: true },
        })
      : Promise.resolve(null),
    albumId
      ? db.galleryAlbum.findUnique({
          where: { id: albumId },
          select: {
            id: true, name: true, slug: true,
            items: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              select: {
                id: true, caption: true, sortOrder: true,
                media: { select: { id: true, url: true, fileName: true, altText: true } },
              },
            },
          },
        })
      : Promise.resolve(null),
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, url: true, fileName: true, altText: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Gallery" description="Photo albums for the public gallery page. Images come from the media library." />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {albums.length === 0 ? (
            <EmptyState title="No albums" description="Create the first album, then add photos to it." />
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Album</TableHead>
                    <TableHead>Photos</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {albums.map((a) => (
                    <TableRow key={a.id} className={edit === a.id || albumId === a.id ? "bg-primary-tint/50" : undefined}>
                      <TableCell>
                        <Link href={`/admin/gallery?album=${a.id}`} className="rounded font-semibold text-primary hover:underline">
                          {a.name}
                        </Link>
                        <p className="text-xs text-muted">/{a.slug}</p>
                      </TableCell>
                      <TableCell>{a._count.items}</TableCell>
                      <TableCell>{a.sortOrder}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell>
                        <span className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/gallery?edit=${a.id}`}
                            aria-label={`Edit ${a.name}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                          >
                            <Pencil aria-hidden className="size-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </Link>
                          <DeleteButton
                            action={deleteGalleryAlbum}
                            id={a.id}
                            title="Delete album?"
                            description={`“${a.name}” will be removed. Albums holding photos cannot be deleted.`}
                          />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          )}

          {activeAlbum && (
            <section className="flex flex-col gap-4 rounded-lg border border-border bg-faint/40 p-4" aria-label={`Photos in ${activeAlbum.name}`}>
              <h2 className="text-base font-semibold">
                Photos in {activeAlbum.name}
                <span className="ml-2 text-sm font-normal text-muted">{activeAlbum.items.length} total</span>
              </h2>
              {activeAlbum.items.length === 0 ? (
                <EmptyState title="No photos yet" description="Pick images from the media library below." />
              ) : (
                <ul className="flex flex-col gap-3">
                  {activeAlbum.items.map((item, i) => (
                    <PhotoRow
                      key={item.id}
                      item={item}
                      isFirst={i === 0}
                      isLast={i === activeAlbum.items.length - 1}
                    />
                  ))}
                </ul>
              )}
              <AddPhotosForm albumId={activeAlbum.id} media={media} />
            </section>
          )}
        </div>
        <GalleryAlbumForm key={editing?.id ?? "new"} initial={editing ?? undefined} />
      </div>
    </>
  );
}
