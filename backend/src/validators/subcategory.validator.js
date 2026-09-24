import { z } from "zod";
import { statusEnum } from "./category.validator.js";

export const subcategoryIdParamSchema = z.object({
  id: z.string().trim().min(1, "ID is required"),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.string().trim().min(1, "Category ID is required"),
});

export const createSubcategorySchema = z.object({
  categoryId: z.string().trim().min(1, "Category ID is required"),
  name: z.string().trim().min(1, "Subcategory name is required"),
  slug: z.string().trim().optional().nullable().or(z.literal("")),
  description: z.string().trim().optional().nullable(),
  status: statusEnum.default("Active"),
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
});

export const updateSubcategorySchema = z
  .object({
    categoryId: z.string().trim().min(1, "Category ID cannot be empty").optional(),
    name: z.string().trim().min(1, "Subcategory name cannot be empty").optional(),
    slug: z.string().trim().optional().nullable().or(z.literal("")),
    description: z.string().trim().optional().nullable(),
    status: statusEnum.optional(),
    sortOrder: z.coerce.number().int().optional(),
    seoTitle: z.string().trim().optional().nullable(),
    seoDescription: z.string().trim().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const subcategoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
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
