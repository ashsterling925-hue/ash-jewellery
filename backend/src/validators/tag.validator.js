import { z } from "zod";

export const tagStatusEnum = z
  .enum(["Active", "Inactive", "ACTIVE", "INACTIVE", "active", "inactive"])
  .transform((val) => {
    const lower = val.toLowerCase();
    if (lower === "active") return "Active";
    return "Inactive";
  });

export const tagIdParamSchema = z.object({
  id: z.string().trim().min(1, "Tag ID is required"),
});

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required").max(100, "Tag name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().optional().nullable().or(z.literal("")),
  status: tagStatusEnum.optional().default("Active"),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name cannot be empty").max(100, "Tag name cannot exceed 100 characters").optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().optional().nullable(),
  status: tagStatusEnum.optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const tagQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(["All", "ALL", "all", "Active", "Inactive", "ACTIVE", "INACTIVE", "active", "inactive"])
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
});
