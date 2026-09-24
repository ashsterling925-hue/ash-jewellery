import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import subcategoryRoutes from "./subcategory.routes.js";
import collectionRoutes from "./collection.routes.js";
import productRoutes from "./product.routes.js";
import attributeRoutes from "./attribute.routes.js";
import attributeValueRoutes from "./attributeValue.routes.js";
import tagRoutes from "./tag.routes.js";
import mediaRoutes from "./media.routes.js";
import storefrontRoutes from "./storefront.routes.js";
import adminCmsRoutes from "./adminCms.routes.js";

import adminManagementRoutes from "./adminManagement.routes.js";

const router = Router();

// 1. Core Health Check (Public)
router.use("/health", healthRoutes);

// 2. Authentication Routes (Login, Refresh, Logout, Forgot, Reset)
router.use("/auth", authRoutes);

// 3. Customer Storefront Catalogue (Public)
router.use("/storefront", storefrontRoutes);

// 4. Admin Management Modules (Protected by Authentication & Permissions)
router.use("/admin", adminCmsRoutes);
router.use("/admin", adminManagementRoutes);
router.use("/homepage", adminCmsRoutes);
router.use("/banners", adminCmsRoutes);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/collections", collectionRoutes);
router.use("/products", productRoutes);
router.use("/attributes", attributeRoutes);
router.use("/attribute-values", attributeValueRoutes);
router.use("/tags", tagRoutes);
router.use("/media", mediaRoutes);

// 4.1 Admin namespace aliases (e.g. /api/v1/admin/products -> productRoutes)
router.use("/admin/products", productRoutes);
router.use("/admin/categories", categoryRoutes);
router.use("/admin/subcategories", subcategoryRoutes);
router.use("/admin/collections", collectionRoutes);
router.use("/admin/attributes", attributeRoutes);
router.use("/admin/tags", tagRoutes);
router.use("/admin/media", mediaRoutes);

// 4.2 Super Admin direct module routes
router.use("/enquiries", adminManagementRoutes);
router.use("/customers", adminManagementRoutes);
router.use("/navigation", adminManagementRoutes);
router.use("/pages", adminManagementRoutes);
router.use("/analytics", adminManagementRoutes);
router.use("/settings", adminManagementRoutes);

// 5. Module Placeholders Generator for future phases
function createModulePlaceholder(moduleName) {
  const placeholderRouter = Router();
  placeholderRouter.all("*", (req, res) => {
    res.status(501).json({
      success: false,
      message: `${moduleName} API module is scheduled for implementation in a future phase.`,
      code: "MODULE_NOT_YET_IMPLEMENTED",
      data: {
        module: moduleName,
        endpoint: req.originalUrl,
      },
    });
  });
  return placeholderRouter;
}

router.use("/users", createModulePlaceholder("Users"));
router.use("/admins", createModulePlaceholder("Admins"));
router.use("/audit", createModulePlaceholder("Audit Log"));

export default router;
