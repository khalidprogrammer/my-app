import { db } from "@/lib/db";

/**
 * Reference check before media deletion (database_schema.md §25):
 * media referenced by content must not disappear silently.
 * Returns human-readable usage labels; empty means safe to delete.
 */
export async function mediaUsage(mediaId: string): Promise<string[]> {
  const [productImages, categories, services, markets, articles, quotes, sections, galleryCovers, galleryItems] = await Promise.all([
    db.productImage.count({ where: { mediaId } }),
    db.category.findMany({ where: { imageId: mediaId }, select: { name: true } }),
    db.service.findMany({ where: { imageId: mediaId }, select: { name: true } }),
    db.market.findMany({ where: { imageId: mediaId }, select: { name: true } }),
    db.newsArticle.findMany({ where: { featuredImageId: mediaId }, select: { title: true } }),
    db.quote.findMany({ where: { attachmentId: mediaId }, select: { referenceNo: true } }),
    db.homepageSection.findMany({ where: { imageId: mediaId }, select: { sectionKey: true } }),
    db.galleryAlbum.findMany({ where: { coverId: mediaId }, select: { name: true } }),
    db.galleryItem.count({ where: { mediaId } }),
  ]);

  const usage: string[] = [];
  if (productImages > 0) usage.push(`${productImages} product image${productImages === 1 ? "" : "s"}`);
  for (const c of categories) usage.push(`category “${c.name}”`);
  for (const s of services) usage.push(`service “${s.name}”`);
  for (const m of markets) usage.push(`market “${m.name}”`);
  for (const a of articles) usage.push(`article “${a.title}”`);
  for (const q of quotes) usage.push(`quote ${q.referenceNo}`);
  for (const s of sections) usage.push(`homepage section “${s.sectionKey}”`);
  for (const g of galleryCovers) usage.push(`gallery album cover “${g.name}”`);
  if (galleryItems > 0) usage.push(`${galleryItems} gallery photo${galleryItems === 1 ? "" : "s"}`);
  return usage;
}
