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
} from "lucide-react";

const stats = [
  {
    title: "Total Products",
    value: "128",
    subtitle: "12 published this month",
    icon: Package,
  },
  {
    title: "Customers",
    value: "1,284",
    subtitle: "84 new this month",
    icon: Users,
  },
  {
    title: "Enquiries",
    value: "42",
    subtitle: "12 new enquiries",
    icon: MessageSquare,
  },
  {
    title: "Out of Stock",
    value: "07",
    subtitle: "Needs attention",
    icon: AlertCircle,
  },
];

const enquiries = [
  { label: "New", value: 12 },
  { label: "Contacted", value: 8 },
  { label: "Resolved", value: 15 },
  { label: "Closed", value: 7 },
];

const topProducts = [
  {
    name: "Heritage Gold Necklace",
    sku: "ASH-NK-001",
    enquiries: 24,
  },
  {
    name: "Classic Temple Jhumka",
    sku: "ASH-EA-014",
    enquiries: 19,
  },
  {
    name: "Traditional Silver Bangle",
    sku: "ASH-BG-008",
    enquiries: 16,
  },
  {
    name: "Pearl Drop Earrings",
    sku: "ASH-EA-021",
    enquiries: 12,
  },
];

const activities = [
  {
    text: 'Product "Heritage Gold Necklace" published',
    time: "12 minutes ago",
    type: "published",
  },
  {
    text: "New customer enquiry received",
    time: "35 minutes ago",
    type: "enquiry",
  },
  {
    text: 'Category "Bangles" updated',
    time: "1 hour ago",
    type: "updated",
  },
  {
    text: 'Product "Pearl Drop Earrings" updated',
    time: "2 hours ago",
    type: "updated",
  },
];

export default function Dashboard() {
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

          <button className="view-store-btn">
            View Store
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="dashboard-stats">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="stat-card"
              key={stat.title}
            >
              <div className="stat-card-top">

                <span className="stat-card-label">
                  {stat.title}
                </span>

                <div className="stat-card-icon">
                  <Icon
                    size={17}
                    strokeWidth={1.7}
                  />
                </div>

              </div>

              <p className="stat-card-value">
                {stat.value}
              </p>

              <div className="stat-card-meta">
                {stat.title === "Out of Stock" ? (
                  <>
                    <strong>{stat.subtitle}</strong>
                  </>
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

              <p>
                Current enquiry status across your store
              </p>
            </div>

            <button className="card-link">
              View all
              <ArrowRight size={13} />
            </button>

          </div>

          <div className="dashboard-card-body">

            <div className="enquiry-chart">

              {enquiries.map((item) => {
                const maxValue = 15;
                const height = `${(item.value / maxValue) * 100}%`;

                return (
                  <div
                    className="enquiry-bar-group"
                    key={item.label}
                  >
                    <div
                      className="enquiry-bar"
                      style={{ height }}
                      title={`${item.value} ${item.label} enquiries`}
                    />

                    <span className="enquiry-day">
                      {item.label}
                    </span>
                  </div>
                );
              })}

            </div>

            <div className="enquiry-summary">

              {enquiries.map((item) => (
                <div
                  className="enquiry-summary-item"
                  key={item.label}
                >
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

              <p>
                Latest changes in your admin panel
              </p>
            </div>

            <button className="card-link">
              View all
              <ArrowRight size={13} />
            </button>

          </div>

          <div className="activity-list">

            {activities.map((activity, index) => (
              <div
                className="activity-item"
                key={index}
              >

                <div className="activity-icon">

                  {activity.type === "published" ? (
                    <CheckCircle2
                      size={15}
                      strokeWidth={1.8}
                    />
                  ) : activity.type === "enquiry" ? (
                    <MessageSquare
                      size={15}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Clock3
                      size={15}
                      strokeWidth={1.8}
                    />
                  )}

                </div>

                <div className="activity-content">

                  <strong>
                    {activity.text}
                  </strong>

                  <span>
                    {activity.time}
                  </span>

                </div>

              </div>
            ))}

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

            <p>
              Products receiving the most customer interest
            </p>
          </div>

          <button className="card-link">
            View products
            <ArrowRight size={13} />
          </button>

        </div>

        <div className="top-products-list">

          {topProducts.map((product, index) => (
            <div
              className="top-product-row"
              key={product.sku}
            >

              <div className="product-rank">
                0{index + 1}
              </div>

              <div className="top-product-info">

                <strong>
                  {product.name}
                </strong>

                <span>
                  {product.sku}
                </span>

              </div>

              <div className="top-product-enquiries">

                <strong>
                  {product.enquiries}
                </strong>

                <span>
                  enquiries
                </span>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="dashboard-quick-actions">

        <div className="quick-action-card">

          <div className="quick-action-icon">
            <Package size={18} />
          </div>

          <div>
            <strong>Add Product</strong>
            <span>Create a new jewellery product</span>
          </div>

          <ArrowRight size={15} />

        </div>

        <div className="quick-action-card">

          <div className="quick-action-icon">
            <Tag size={18} />
          </div>

          <div>
            <strong>Manage Catalogue</strong>
            <span>Categories, collections and tags</span>
          </div>

          <ArrowRight size={15} />

        </div>

        <div className="quick-action-card">

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