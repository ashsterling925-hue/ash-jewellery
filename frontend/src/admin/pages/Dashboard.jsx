import { useState, useEffect } from "react";
import {
  Package,
  Users,
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  Tag,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/api/adminApi";

const STAT_ICONS = {
  "Total Products": Package,
  Customers: Users,
  Enquiries: MessageSquare,
  "Out of Stock": AlertCircle,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: [
      {
        title: "Total Products",
        value: "0",
        subtitle: "0 published this month",
        numericValue: 0,
      },
      {
        title: "Customers",
        value: "0",
        subtitle: "0 new this month",
        numericValue: 0,
      },
      {
        title: "Enquiries",
        value: "0",
        subtitle: "0 new enquiries",
        numericValue: 0,
      },
      {
        title: "Out of Stock",
        value: "00",
        subtitle: "All in stock",
        numericValue: 0,
      },
    ],
    enquiryBreakdown: [
      { label: "New", value: 0 },
      { label: "Contacted", value: 0 },
      { label: "Resolved", value: 0 },
      { label: "Closed", value: 0 },
    ],
    topProducts: [],
    activities: [],
  });

  useEffect(() => {
    // Clear any leftover mock cache
    try {
      localStorage.removeItem("ashProducts");
      localStorage.removeItem("ashAttributes");
    } catch {
      // ignore
    }

    async function fetchStats() {
      try {
        setLoading(true);
        const res = await adminApi.getDashboardStats();
        if (res && res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const totalEnquiriesCount = dashboardData.enquiryBreakdown.reduce(
    (acc, curr) => acc + (curr.value || 0),
    0
  );
  const maxEnquiryValue = Math.max(
    ...dashboardData.enquiryBreakdown.map((item) => item.value),
    1
  );

  return (
    <div className="dashboard-page">
      {/* =====================================================
          PAGE INTRO
      ===================================================== */}

      <section className="dashboard-heading">
        <p className="eyebrow">ASH JEWELLERY</p>

        <div className="dashboard-heading-row">
          <div>
            <h1>Welcome back, Admin</h1>
            <p>
              Here's an overview of your jewellery store and today's activity.
            </p>
          </div>

          <button
            className="view-store-btn"
            type="button"
            onClick={() => window.open("/", "_blank")}
          >
            View Store
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="dashboard-stats">
        {dashboardData.stats.map((stat) => {
          const Icon = STAT_ICONS[stat.title] || Package;

          return (
            <div className="stat-card" key={stat.title}>
              <div className="stat-card-top">
                <span className="stat-card-label">{stat.title}</span>

                <div className="stat-card-icon">
                  <Icon size={17} strokeWidth={1.7} />
                </div>
              </div>

              <p className="stat-card-value">
                {loading ? "..." : stat.value}
              </p>

              <div className="stat-card-meta">
                {stat.title === "Out of Stock" ? (
                  <strong>{stat.subtitle}</strong>
                ) : (
                  stat.subtitle
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* =====================================================
          MAIN DASHBOARD
      ===================================================== */}

      <section className="dashboard-grid">
        {/* =================================================
            ENQUIRY OVERVIEW
        ================================================= */}

        <div className="dashboard-card enquiry-overview">
          <div className="dashboard-card-header">
            <div>
              <h2>Enquiry Overview</h2>
              <p>Current enquiry status across your store</p>
            </div>

            <button
              className="card-link"
              type="button"
              onClick={() => navigate("/admin/enquiries")}
            >
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="dashboard-card-body">
            {totalEnquiriesCount === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  color: "#8a8277",
                  fontSize: "12px",
                }}
              >
                <MessageSquare
                  size={24}
                  style={{ margin: "0 auto 8px", opacity: 0.4 }}
                />
                <p>No customer enquiries recorded yet.</p>
                <span style={{ fontSize: "11px", color: "#a8a29e" }}>
                  Enquiries submitted from product pages will show up here.
                </span>
              </div>
            ) : (
              <div className="enquiry-chart">
                {dashboardData.enquiryBreakdown.map((item) => {
                  const height = `${(item.value / maxEnquiryValue) * 100}%`;

                  return (
                    <div className="enquiry-bar-group" key={item.label}>
                      <div
                        className="enquiry-bar"
                        style={{ height: item.value > 0 ? height : "4px" }}
                        title={`${item.value} ${item.label} enquiries`}
                      />

                      <span className="enquiry-day">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="enquiry-summary">
              {dashboardData.enquiryBreakdown.map((item) => (
                <div className="enquiry-summary-item" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest changes in your admin panel</p>
            </div>

            <button
              className="card-link"
              type="button"
              onClick={() => navigate("/admin/products")}
            >
              View all
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="activity-list">
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "40px",
                }}
              >
                <Loader2 size={20} className="animate-spin text-[#b99657]" />
              </div>
            ) : dashboardData.activities.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  color: "#8a8277",
                  fontSize: "12px",
                }}
              >
                <Clock3
                  size={24}
                  style={{ margin: "0 auto 8px", opacity: 0.4 }}
                />
                <p>No recent activity recorded yet.</p>
                <span style={{ fontSize: "11px", color: "#a8a29e" }}>
                  Add products, categories or banners to start recording activity.
                </span>
              </div>
            ) : (
              dashboardData.activities.map((activity, index) => (
                <div className="activity-item" key={activity.id || index}>
                  <div className="activity-icon">
                    {activity.type === "published" ? (
                      <CheckCircle2 size={15} strokeWidth={1.8} />
                    ) : activity.type === "enquiry" ? (
                      <MessageSquare size={15} strokeWidth={1.8} />
                    ) : (
                      <Clock3 size={15} strokeWidth={1.8} />
                    )}
                  </div>

                  <div className="activity-content">
                    <strong>{activity.text}</strong>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          TOP ENQUIRED PRODUCTS
      ===================================================== */}

      <section className="dashboard-card top-products-card">
        <div className="dashboard-card-header">
          <div>
            <h2>Top Enquired Products</h2>
            <p>Products receiving the most customer interest</p>
          </div>

          <button
            className="card-link"
            type="button"
            onClick={() => navigate("/admin/products")}
          >
            View products
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="top-products-list">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "30px",
              }}
            >
              <Loader2 size={20} className="animate-spin text-[#b99657]" />
            </div>
          ) : dashboardData.topProducts.length === 0 ? (
            <div
              style={{
                padding: "36px 16px",
                textAlign: "center",
                color: "#8a8277",
                fontSize: "12px",
              }}
            >
              <Package
                size={24}
                style={{ margin: "0 auto 8px", opacity: 0.4 }}
              />
              <p>No product interest recorded yet.</p>
              <span style={{ fontSize: "11px", color: "#a8a29e" }}>
                Enquiries tied to specific products will appear here in ranking order.
              </span>
            </div>
          ) : (
            dashboardData.topProducts.map((product, index) => (
              <div className="top-product-row" key={product.id || product.sku}>
                <div className="product-rank">0{index + 1}</div>

                <div className="top-product-info">
                  <strong>{product.name}</strong>
                  <span>{product.sku}</span>
                </div>

                <div className="top-product-enquiries">
                  <strong>{product.enquiries}</strong>
                  <span>enquiries</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="dashboard-quick-actions">
        <div
          className="quick-action-card cursor-pointer"
          onClick={() => navigate("/admin/products/new")}
        >
          <div className="quick-action-icon">
            <Package size={18} />
          </div>

          <div>
            <strong>Add Product</strong>
            <span>Create a new jewellery product</span>
          </div>

          <ArrowRight size={15} />
        </div>

        <div
          className="quick-action-card cursor-pointer"
          onClick={() => navigate("/admin/categories")}
        >
          <div className="quick-action-icon">
            <Tag size={18} />
          </div>

          <div>
            <strong>Manage Catalogue</strong>
            <span>Categories, collections and tags</span>
          </div>

          <ArrowRight size={15} />
        </div>

        <div
          className="quick-action-card cursor-pointer"
          onClick={() => navigate("/admin/enquiries")}
        >
          <div className="quick-action-icon">
            <MessageSquare size={18} />
          </div>

          <div>
            <strong>View Enquiries</strong>
            <span>Manage customer enquiries</span>
          </div>

          <ArrowRight size={15} />
        </div>
      </section>
    </div>
  );
}