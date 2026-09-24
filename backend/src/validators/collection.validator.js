import { z } from "zod";
import { statusEnum } from "./category.validator.js";

export const collectionIdParamSchema = z.object({
  id: z.string().trim().min(1, "ID is required"),
});

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase alphanumeric characters and hyphens"
    )
    .optional()
    .or(z.literal("")),
  description: z.string().trim().optional().nullable(),
  image: z.string().optional().nullable(),
  mediaAssetId: z.string().trim().optional().nullable(),
  status: statusEnum.default("Active"),
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
});

export const updateCollectionSchema = z
  .object({
    name: z.string().trim().min(1, "Collection name cannot be empty").optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must only contain lowercase alphanumeric characters and hyphens"
      )
      .optional()
      .or(z.literal("")),
    description: z.string().trim().optional().nullable(),
    image: z.string().optional().nullable(),
    mediaAssetId: z.string().trim().optional().nullable(),
    status: statusEnum.optional(),
    sortOrder: z.coerce.number().int().optional(),
    seoTitle: z.string().trim().optional().nullable(),
    seoDescription: z.string().trim().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const collectionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(["All", "Active", "Inactive", "ALL", "ACTIVE", "INACTIVE"])
    .optional()
    .transform((val) => {
      if (!val || val.toUpperCase() === "ALL") return undefined;
      return val.toLowerCase() === "active" ? "Active" : "Inactive";
    }),
  sortBy: z
    .enum(["name", "sortOrder", "createdAt", "updatedAt", "status"])
    .optional()
    .default("sortOrder"),
  sortOrder: z
    .enum(["asc", "desc", "ASC", "DESC"])
    .optional()
    .transform((val) => (val ? val.toLowerCase() : "asc")),
  order: z
    .enum(["asc", "desc", "ASC", "DESC"])
    .optional()
    .transform((val) => (val ? val.toLowerCase() : undefined)),
});
