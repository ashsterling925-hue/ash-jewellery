import { z } from "zod";

export const attributeSelectionTypeEnum = z
  .enum(["SINGLE", "MULTIPLE", "Single", "Multiple", "single", "multiple"])
  .transform((val) => val.toUpperCase());

export const attributeStatusEnum = z
  .enum(["Active", "Inactive", "ACTIVE", "INACTIVE", "active", "inactive"])
  .transform((val) => {
    const lower = val.toLowerCase();
    return lower === "active" ? "Active" : "Inactive";
  });

export const attributeIdParamSchema = z.object({
  id: z.string().trim().min(1, "Attribute ID is required"),
});

export const attributeValueIdParamSchema = z.object({
  id: z.string().trim().min(1, "Attribute Value ID is required"),
});

export const attributeValueParentParamSchema = z.object({
  attributeId: z.string().trim().min(1, "Attribute ID is required"),
});

const initialAttributeValueSchema = z.object({
  value: z.string().trim().min(1, "Value is required"),
  slug: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
  status: attributeStatusEnum.optional().default("Active"),
});

export const createAttributeSchema = z.object({
  name: z.string().trim().min(1, "Attribute name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().optional().nullable(),
  status: attributeStatusEnum.optional().default("Active"),
  selectionType: attributeSelectionTypeEnum.optional().default("SINGLE"),
  filterable: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
  values: z.array(initialAttributeValueSchema).optional(),
});

export const updateAttributeSchema = z
  .object({
    name: z.string().trim().min(1, "Attribute name cannot be empty").optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
      .optional()
      .or(z.literal("")),
    description: z.string().trim().optional().nullable(),
    status: attributeStatusEnum.optional(),
    selectionType: attributeSelectionTypeEnum.optional(),
    filterable: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const attributeQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(50),
  search: z.string().trim().optional(),
  status: z
    .enum(["All", "ALL", "all", "Active", "Inactive", "ACTIVE", "INACTIVE"])
    .optional()
    .transform((val) => {
      if (!val || val.toUpperCase() === "ALL") return undefined;
      return val.toLowerCase() === "active" ? "Active" : "Inactive";
    }),
  filterable: z
    .union([z.boolean(), z.enum(["true", "false", "TRUE", "FALSE"])])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === "boolean") return val;
      return val.toLowerCase() === "true";
    }),
  includeValues: z
    .union([z.boolean(), z.enum(["true", "false", "TRUE", "FALSE"])])
    .optional()
    .transform((val) => {
      if (val === undefined) return false;
      if (typeof val === "boolean") return val;
      return val.toLowerCase() === "true";
    }),
  sortBy: z
    .enum(["name", "slug", "sortOrder", "createdAt", "updatedAt"])
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

export const createAttributeValueSchema = z.object({
  value: z.string().trim().min(1, "Value is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .optional()
    .or(z.literal("")),
  status: attributeStatusEnum.optional().default("Active"),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const updateAttributeValueSchema = z
  .object({
    value: z.string().trim().min(1, "Value cannot be empty").optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
      .optional()
      .or(z.literal("")),
    status: attributeStatusEnum.optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const attributeValueQuerySchema = z.object({
  status: z
    .enum(["All", "ALL", "all", "Active", "Inactive", "ACTIVE", "INACTIVE"])
    .optional()
    .transform((val) => {
      if (!val || val.toUpperCase() === "ALL") return undefined;
      return val.toLowerCase() === "active" ? "Active" : "Inactive";
    }),
  search: z.string().trim().optional(),
});
