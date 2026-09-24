import { prisma } from "../config/prisma.js";
import { sendSuccess, sendPaginated } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Admin Management Controller
 * Supplies dynamic database-driven data for Super Admin Portal
 */
export const adminManagementController = {
  /**
   * GET /api/v1/admin/dashboard-stats
   * Aggregates real-time metrics across catalogue, customers, and enquiries
   */
  async getDashboardStats(req, res, next) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalProducts,
        publishedThisMonth,
        totalCustomers,
        newCustomersThisMonth,
        totalEnquiries,
        newEnquiriesCount,
        outOfStockCount,
        enquiryGroups,
        topProductsList,
        recentProducts,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({
          where: {
            status: "PUBLISHED",
            createdAt: { gte: startOfMonth },
          },
        }),
        prisma.user.count({
          where: { role: "STAFF" },
        }),
        prisma.user.count({
          where: {
            role: "STAFF",
            createdAt: { gte: startOfMonth },
          },
        }),
        prisma.enquiry.count(),
        prisma.enquiry.count({
          where: { status: "NEW" },
        }),
        prisma.product.count({
          where: { stockStatus: "OUT_OF_STOCK" },
        }),
        prisma.enquiry.groupBy({
          by: ["status"],
          _count: { id: true },
        }),
        prisma.product.findMany({
          take: 5,
          orderBy: [
            { enquiries: { _count: "desc" } },
            { createdAt: "desc" },
          ],
          include: {
            category: { select: { name: true } },
            _count: { select: { enquiries: true } },
          },
        }),
        prisma.product.findMany({
          take: 5,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            name: true,
            status: true,
            updatedAt: true,
            createdAt: true,
          },
        }),
      ]);

      // Map enquiry counts by status
      const statusMap = {
        NEW: 0,
        CONTACTED: 0,
        RESOLVED: 0,
        CLOSED: 0,
      };
      enquiryGroups.forEach((group) => {
        if (statusMap[group.status] !== undefined) {
          statusMap[group.status] = group._count.id;
        }
      });

      const enquiryBreakdown = [
        { label: "New", value: statusMap.NEW },
        { label: "Contacted", value: statusMap.CONTACTED },
        { label: "Resolved", value: statusMap.RESOLVED },
        { label: "Closed", value: statusMap.CLOSED },
      ];

      // Format top products
      const formattedTopProducts = topProductsList.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || "Unassigned",
        enquiries: p._count.enquiries,
      }));

      // Format recent activities
      const activities = recentProducts.map((p) => {
        const isNew =
          Math.abs(new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime()) < 5000;
        return {
          id: p.id,
          text: `Product "${p.name}" ${isNew ? "created" : "updated"}`,
          time: new Date(p.updatedAt).toLocaleDateString(),
          type: isNew ? "published" : "updated",
        };
      });

      return sendSuccess(res, {
        message: "Dashboard metrics fetched successfully",
        data: {
          stats: [
            {
              title: "Total Products",
              value: totalProducts.toLocaleString(),
              subtitle: `${publishedThisMonth} published this month`,
              numericValue: totalProducts,
            },
            {
              title: "Customers",
              value: totalCustomers.toLocaleString(),
              subtitle: `${newCustomersThisMonth} new this month`,
              numericValue: totalCustomers,
            },
            {
              title: "Enquiries",
              value: totalEnquiries.toLocaleString(),
              subtitle: `${newEnquiriesCount} new enquiries`,
              numericValue: totalEnquiries,
            },
            {
              title: "Out of Stock",
              value: String(outOfStockCount).padStart(2, "0"),
              subtitle: outOfStockCount > 0 ? "Needs attention" : "All in stock",
              numericValue: outOfStockCount,
            },
          ],
          enquiryBreakdown,
          topProducts: formattedTopProducts,
          activities,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/customers
   * Fetch registered customers
   */
  async getCustomers(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;
      const search = (req.query.search || "").trim();

      const where = {
        role: "STAFF", // Front-facing customers/users
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      const [customers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
            _count: {
              select: { enquiries: true },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return sendPaginated(res, {
        message: "Customers fetched successfully",
        data: customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/enquiries
   * Fetch customer enquiries
   */
  async getEnquiries(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;
      const search = (req.query.search || "").trim();
      const status = req.query.status;

      const where = {};

      if (status && status !== "ALL") {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { enquiryNumber: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
        ];
      }

      const [enquiries, total] = await Promise.all([
        prisma.enquiry.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        }),
        prisma.enquiry.count({ where }),
      ]);

      return sendPaginated(res, {
        message: "Enquiries fetched successfully",
        data: enquiries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/admin/enquiries/:id
   * Update enquiry status or notes
   */
  async updateEnquiry(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await prisma.enquiry.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
      });

      return sendSuccess(res, {
        message: "Enquiry updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/analytics
   * Aggregates catalogue and enquiry insights
   */
  async getAnalytics(req, res, next) {
    try {
      const [products, categoryBreakdown, statusBreakdown] = await Promise.all([
        prisma.product.findMany({
          take: 20,
          orderBy: [
            { enquiries: { _count: "desc" } },
            { createdAt: "desc" },
          ],
          include: {
            category: { select: { name: true } },
            _count: { select: { enquiries: true } },
          },
        }),
        prisma.category.findMany({
          select: {
            name: true,
            _count: { select: { products: true } },
          },
        }),
        prisma.enquiry.groupBy({
          by: ["status"],
          _count: { id: true },
        }),
      ]);

      return sendSuccess(res, {
        message: "Analytics fetched successfully",
        data: {
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category?.name || "Unassigned",
            enquiryCount: p._count.enquiries,
            activityLevel:
              p._count.enquiries > 10 ? "High" : p._count.enquiries > 2 ? "Medium" : "Low",
          })),
          categories: categoryBreakdown,
          enquiryStats: statusBreakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/navigation
   * Fetch navigation menus
   */
  async getNavigation(req, res, next) {
    try {
      const navigation = await prisma.navigation.findMany({
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      return sendSuccess(res, {
        message: "Navigation items fetched successfully",
        data: navigation,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/pages
   * Fetch CMS static pages
   */
  async getPages(req, res, next) {
    try {
      const pages = await prisma.staticPage.findMany({
        orderBy: { updatedAt: "desc" },
      });

      return sendSuccess(res, {
        message: "Static pages fetched successfully",
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/settings
   * Fetch store configuration
   */
  async getSettings(req, res, next) {
    try {
      const section = await prisma.homepageSection.findUnique({
        where: { sectionKey: "STORE_SETTINGS" },
      });

      const settings = (section?.configuration) || {
        businessName: "ASH Jewellery",
        currency: "INR",
        enquiryChannel: "WhatsApp",
        whatsappNumber: "",
        storefrontStatus: "Live",
      };

      return sendSuccess(res, {
        message: "Store settings fetched successfully",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/admin/settings
   * Save store configuration
   */
  async updateSettings(req, res, next) {
    try {
      const config = req.body;

      const updated = await prisma.homepageSection.upsert({
        where: { sectionKey: "STORE_SETTINGS" },
        create: {
          sectionKey: "STORE_SETTINGS",
          title: "Store Settings",
          configuration: config,
          status: "Active",
        },
        update: {
          configuration: config,
        },
      });

      return sendSuccess(res, {
        message: "Store settings saved successfully",
        data: updated.configuration,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default adminManagementController;
