import { useState, useEffect } from "react";
import ContentListPage from "../../components/ContentListPage";
import { adminApi } from "@/lib/api/adminApi";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await adminApi.getCustomers({ limit: 50 });
        if (res?.data) {
          setCustomers(res.data);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error("Failed to load customers:", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const rows = customers.map((c) => [
    <div className="product-cell" key={c.id}>
      <div className="module-record-icon">
        {c.name ? c.name[0].toUpperCase() : "C"}
      </div>
      <div>
        <strong className="product-name">{c.name || "Customer"}</strong>
        <span className="sku">{c.email}</span>
      </div>
    </div>,
    c.phone || "—",
    c._count?.enquiries ?? 0,
    <span
      className={`status-badge ${(c.status || "ACTIVE").toLowerCase()}`}
      key={`status-${c.id}`}
    >
      {c.status || "ACTIVE"}
    </span>,
    <button
      className="module-text-button"
      key={`btn-${c.id}`}
      type="button"
      onClick={() =>
        alert(
          `Customer Profile:\nName: ${c.name}\nEmail: ${c.email}\nPhone: ${
            c.phone || "N/A"
          }\nEnquiries: ${c._count?.enquiries ?? 0}`
        )
      }
    >
      View profile
    </button>,
  ]);

  return (
    <ContentListPage
      eyebrow="MANAGEMENT / CUSTOMERS"
      title="Customers"
      description="View registered customer records and enquiry history."
      columns={["CUSTOMER", "PHONE", "ENQUIRIES", "STATUS", "ACTIONS"]}
      rows={rows}
      loading={loading}
      emptyMessage="No customer records registered yet. Customers created via checkout or enquiry forms will appear here."
      actionLabel={null}
    />
  );
}
