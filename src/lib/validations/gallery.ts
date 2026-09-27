import { z } from "zod";
import { nameField, optionalText, slugInput } from "./common";

export const galleryAlbumFormSchema = z.object({
  name: nameField("Album name", 191),
  slug: slugInput,
  description: optionalText(60000),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type GalleryAlbumFormData = z.infer<typeof galleryAlbumFormSchema>;

export const galleryItemFormSchema = z.object({
  mediaId: z.string().min(1, "Choose an image."),
  caption: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});

export type GalleryItemFormData = z.infer<typeof galleryItemFormSchema>;
