import { Router } from "express";
import { adminManagementController } from "../../controllers/adminManagement.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

// Protect all admin management routes with authentication
router.use(authenticate);

// 1. Dashboard
router.get("/dashboard-stats", adminManagementController.getDashboardStats);

// 2. Customers
router.get("/customers", adminManagementController.getCustomers);

// 3. Enquiries
router.get("/enquiries", adminManagementController.getEnquiries);
router.patch("/enquiries/:id", adminManagementController.updateEnquiry);

// 4. Analytics
router.get("/analytics", adminManagementController.getAnalytics);

// 5. Navigation & Pages
router.get("/navigation", adminManagementController.getNavigation);
router.get("/pages", adminManagementController.getPages);

// 6. Settings
router.get("/settings", adminManagementController.getSettings);
router.put("/settings", adminManagementController.updateSettings);

export default router;
