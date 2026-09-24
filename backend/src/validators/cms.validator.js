import { z } from "zod";

const statusEnum = z
  .enum(["ACTIVE", "INACTIVE", "Active", "Inactive", "active", "inactive"])
  .transform((val) => (val.toLowerCase() === "active" ? "ACTIVE" : "INACTIVE"));

const dateTransform = z
  .union([z.string().datetime(), z.string().trim(), z.date(), z.null(), z.undefined()])
  .optional()
  .nullable()
  .transform((val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  });

// ==========================================
// 1. HERO VALIDATION
// ==========================================

export const heroSchema = z.object({
  heading: z.string().trim().min(1, "Hero heading is required"),
  subheading: z.string().trim().optional().nullable(),
  mediaAssetId: z.string().trim().optional().nullable(),
  buttonText: z.string().trim().optional().nullable(),
  buttonUrl: z.string().trim().optional().nullable(),
  status: statusEnum.default("ACTIVE"),
});

export const updateHeroSchema = heroSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

// ==========================================
// 2. BANNER VALIDATION
// ==========================================

export const createBannerSchema = z.object({
  title: z.string().trim().min(1, "Banner title is required"),
  subtitle: z.string().trim().optional().nullable(),
  mediaAssetId: z.string().trim().optional().nullable(),
  targetUrl: z.string().trim().optional().nullable(),
  position: z.string().trim().optional().default("HOME_PROMOTION"),
  status: statusEnum.default("ACTIVE"),
  sortOrder: z.coerce.number().int().optional().default(0),
  startAt: dateTransform,
  endAt: dateTransform,
});

export const updateBannerSchema = createBannerSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export const bannerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(["ALL", "All", "all", "ACTIVE", "INACTIVE", "Active", "Inactive"])
    .optional()
    .transform((val) => {
      if (!val || val.toUpperCase() === "ALL") return undefined;
      return val.toLowerCase() === "active" ? "ACTIVE" : "INACTIVE";
    }),
  position: z.string().trim().optional(),
  sortBy: z.enum(["title", "sortOrder", "startAt", "endAt", "createdAt", "updatedAt"]).optional().default("sortOrder"),
  sortOrder: z.enum(["asc", "desc", "ASC", "DESC"]).optional().transform((v) => (v ? v.toLowerCase() : "asc")),
});

// ==========================================
// 3. SPECIAL OFFER VALIDATION
// ==========================================

export const targetTypeEnum = z
  .enum(["PRODUCT", "COLLECTION", "CATEGORY", "CUSTOM", "Product", "Collection", "Category", "Custom"])
  .transform((val) => val.toUpperCase());

export const createSpecialOfferSchema = z.object({
  title: z.string().trim().min(1, "Offer title is required"),
  description: z.string().trim().optional().nullable(),
  mediaAssetId: z.string().trim().optional().nullable(),
  targetType: targetTypeEnum.default("CUSTOM"),
  targetId: z.string().trim().optional().nullable(),
  buttonText: z.string().trim().optional().nullable().default("SHOP NOW"),
  buttonUrl: z.string().trim().optional().nullable(),
  status: statusEnum.default("ACTIVE"),
  sortOrder: z.coerce.number().int().optional().default(0),
  startAt: dateTransform,
  endAt: dateTransform,
});

export const updateSpecialOfferSchema = createSpecialOfferSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export const specialOfferQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(["ALL", "All", "all", "ACTIVE", "INACTIVE", "Active", "Inactive"])
    .optional()
    .transform((val) => {
      if (!val || val.toUpperCase() === "ALL") return undefined;
      return val.toLowerCase() === "active" ? "ACTIVE" : "INACTIVE";
    }),
  targetType: z.string().trim().optional(),
  sortBy: z.enum(["title", "sortOrder", "startAt", "endAt", "createdAt", "updatedAt"]).optional().default("sortOrder"),
  sortOrder: z.enum(["asc", "desc", "ASC", "DESC"]).optional().transform((v) => (v ? v.toLowerCase() : "asc")),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1, "ID is required"),
});
