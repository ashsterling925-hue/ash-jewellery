import { z } from "zod";

export const productStatusEnum = z
  .enum(["DRAFT", "PUBLISHED", "ARCHIVED", "Draft", "Published", "Archived", "draft", "published", "archived"])
  .transform((val) => val.toUpperCase());

export const stockStatusEnum = z
  .enum([
    "IN_STOCK",
    "LOW_STOCK",
    "OUT_OF_STOCK",
    "BACKORDER",
    "in-stock",
    "low-stock",
    "out-of-stock",
    "backorder",
    "In Stock",
    "Low Stock",
    "Out of Stock",
    "Backorder",
  ])
  .transform((val) => {
    const normalized = val.toUpperCase().replace(/[\s-]+/g, "_");
    if (normalized === "IN_STOCK") return "IN_STOCK";
    if (normalized === "LOW_STOCK") return "LOW_STOCK";
    if (normalized === "OUT_OF_STOCK") return "OUT_OF_STOCK";
    if (normalized === "BACKORDER") return "BACKORDER";
    return "IN_STOCK";
  });

export const productIdParamSchema = z.object({
  id: z.string().trim().min(1, "Product ID is required"),
});

const productImageItemSchema = z.object({
  id: z.string().optional(),
  mediaAssetId: z.string().trim().optional().nullable(),
  url: z.string().min(1, "Image URL is required"),
  altText: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional().default(0),
  isPrimary: z.boolean().optional().default(false),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
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
  productType: z.string().trim().optional().nullable(),
  shortDescription: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  comparePrice: z.coerce.number().min(0, "Compare price must be non-negative").optional().nullable(),
  taxRate: z.coerce.number().min(0, "Tax rate must be non-negative").optional().default(3.0),
  stockQuantity: z.coerce.number().int().min(0, "Stock quantity cannot be negative").default(0),
  lowStockThreshold: z.coerce.number().int().min(0, "Low stock threshold cannot be negative").default(5),
  stockStatus: stockStatusEnum.optional(),
  categoryId: z.string().trim().min(1, "Category is required"),
  subcategoryId: z.string().trim().optional().nullable().or(z.literal("")),
  collectionId: z.string().trim().optional().nullable().or(z.literal("")),
  material: z.string().trim().optional().nullable(),
  metal: z.string().trim().optional().nullable(),
  gender: z.string().trim().optional().nullable(),
  colour: z.string().trim().optional().nullable(),
  finish: z.string().trim().optional().nullable(),
  metaTitle: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable(),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  status: productStatusEnum.default("DRAFT"),
  isFeatured: z.boolean().optional().default(false),
  images: z.array(productImageItemSchema).optional().default([]),
  attributes: z
    .array(
      z.object({
        attributeId: z.string().trim().min(1, "Attribute ID is required"),
        attributeValueIds: z.array(z.string().trim().min(1)),
      })
    )
    .optional(),
  attributeValueIds: z.array(z.string().trim()).optional(),
  tagIds: z.array(z.string().trim().min(1)).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name cannot be empty").optional(),
    sku: z.string().trim().min(1, "SKU cannot be empty").optional(),
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
    productType: z.string().trim().optional().nullable(),
    shortDescription: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    price: z.coerce.number().min(0, "Price must be non-negative").optional(),
    comparePrice: z.coerce.number().min(0, "Compare price must be non-negative").optional().nullable(),
    taxRate: z.coerce.number().min(0, "Tax rate must be non-negative").optional().nullable(),
    stockQuantity: z.coerce.number().int().min(0, "Stock quantity cannot be negative").optional(),
    lowStockThreshold: z.coerce.number().int().min(0, "Low stock threshold cannot be negative").optional(),
    stockStatus: stockStatusEnum.optional(),
    categoryId: z.string().trim().min(1, "Category cannot be empty").optional(),
    subcategoryId: z.string().trim().optional().nullable().or(z.literal("")),
    collectionId: z.string().trim().optional().nullable().or(z.literal("")),
    material: z.string().trim().optional().nullable(),
    metal: z.string().trim().optional().nullable(),
    gender: z.string().trim().optional().nullable(),
    colour: z.string().trim().optional().nullable(),
    finish: z.string().trim().optional().nullable(),
    metaTitle: z.string().trim().optional().nullable(),
    metaDescription: z.string().trim().optional().nullable(),
    seoTitle: z.string().trim().optional().nullable(),
    seoDescription: z.string().trim().optional().nullable(),
    status: productStatusEnum.optional(),
    isFeatured: z.boolean().optional(),
    images: z.array(productImageItemSchema).optional(),
    attributes: z
      .array(
        z.object({
          attributeId: z.string().trim().min(1, "Attribute ID is required"),
          attributeValueIds: z.array(z.string().trim().min(1)),
        })
      )
      .optional(),
    attributeValueIds: z.array(z.string().trim()).optional(),
    tagIds: z.array(z.string().trim().min(1)).optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(["All", "ALL", "all", "DRAFT", "PUBLISHED", "ARCHIVED", "Draft", "Published", "Archived"])
    .optional()
    .transform((val) => {
      if (!val || val.toUpperCase() === "ALL") return undefined;
      return val.toUpperCase();
    }),
  stockStatus: z
    .enum(["All", "ALL", "all", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "BACKORDER", "in-stock", "low-stock", "out-of-stock", "backorder", "In Stock", "Low Stock", "Out of Stock", "Backorder"])
    .optional()
    .transform((val) => {
      if (!val || val.toUpperCase() === "ALL") return undefined;
      const normalized = val.toUpperCase().replace(/[\s-]+/g, "_");
      return normalized;
    }),
  categoryId: z.string().trim().optional(),
  subcategoryId: z.string().trim().optional(),
  collectionId: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  subcategorySlug: z.string().trim().optional(),
  collectionSlug: z.string().trim().optional(),
  tagId: z.string().trim().optional(),
  tagSlug: z.string().trim().optional(),
  attributeValueIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }),
  sortBy: z
    .enum(["name", "price", "stockQuantity", "createdAt", "updatedAt", "sku", "sortOrder"])
    .optional()
    .default("createdAt"),
  sortOrder: z
    .enum(["asc", "desc", "ASC", "DESC"])
    .optional()
    .transform((val) => (val ? val.toLowerCase() : "desc")),
  order: z
    .enum(["asc", "desc", "ASC", "DESC"])
    .optional()
    .transform((val) => (val ? val.toLowerCase() : undefined)),
});

