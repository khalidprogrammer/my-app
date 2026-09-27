import { z } from "zod";
import { nameField, optionalText } from "./common";

export const quoteUpdateSchema = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUOTATION_SENT",
    "NEGOTIATION",
    "CONFIRMED",
    "COMPLETED",
    "REJECTED",
    "ARCHIVED",
  ]),
  assignedTo: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  note: optionalText(2000),
});

export type QuoteUpdateData = z.infer<typeof quoteUpdateSchema>;

export const userFormSchema = z.object({
  name: nameField("Name", 191),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address.").max(191),
  password: z.string().max(200).optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  roles: z.array(z.string().min(1)).min(1, "Assign at least one role."),
});

export type UserFormData = z.infer<typeof userFormSchema>;
