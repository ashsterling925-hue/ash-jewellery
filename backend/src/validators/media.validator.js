import { z } from "zod";

const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "fileName", "sizeBytes", "fileSize"];

export const mediaQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  mimeType: z.string().trim().optional(),
  status: z.string().trim().optional(),
  folder: z.string().trim().optional(),
  sortBy: z
    .string()
    .trim()
    .refine((val) => ALLOWED_SORT_FIELDS.includes(val), {
      message: `sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`,
    })
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateMediaSchema = z.object({
  altText: z.string().trim().max(500, "Alt text cannot exceed 500 characters").optional().nullable(),
  title: z.string().trim().max(255, "Title cannot exceed 255 characters").optional().nullable(),
  status: z.enum(["ACTIVE", "ARCHIVED", "Active", "Inactive"]).optional(),
});

export const mediaIdParamSchema = z.object({
  id: z.string().trim().min(1, "Media ID is required"),
});
