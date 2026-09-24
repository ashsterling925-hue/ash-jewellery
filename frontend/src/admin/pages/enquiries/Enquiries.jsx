import { useState, useEffect } from "react";
import ContentListPage from "../../components/ContentListPage";
import { adminApi } from "@/lib/api/adminApi";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnquiries() {
      try {
        setLoading(true);
        const res = await adminApi.getEnquiries({ limit: 50 });
        if (res?.data) {
          setEnquiries(res.data);
        } else {
          setEnquiries([]);
        }
      } catch (err) {
        console.error("Failed to load enquiries:", err);
        setEnquiries([]);
      } finally {
        setLoading(false);
      }
    }
    loadEnquiries();
  }, []);

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await adminApi.updateEnquiry(enquiryId, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      alert(err.message || "Failed to update status.");
    }
  };

  const rows = enquiries.map((item) => [
    <strong className="product-name" key={item.id}>
      {item.enquiryNumber || item.id.slice(0, 8)}
    </strong>,
    <div key={`user-${item.id}`}>
      <strong>{item.name}</strong>
      <span className="sku" style={{ display: "block" }}>
        {item.phone || item.email || "—"}
      </span>
    </div>,
    item.product ? (
      <span key={`prod-${item.id}`} style={{ fontWeight: 500 }}>
        {item.product.name}
      </span>
    ) : (
      "Store Enquiry"
    ),
    <select
      key={`status-${item.id}`}
      value={item.status}
      onChange={(e) => handleStatusChange(item.id, e.target.value)}
      className={`status-badge ${(item.status || "NEW").toLowerCase()}`}
      style={{
        border: "none",
        cursor: "pointer",
        background: "transparent",
        fontWeight: 600,
      }}
    >
      <option value="NEW">New</option>
      <option value="CONTACTED">Contacted</option>
      <option value="RESOLVED">Resolved</option>
      <option value="CLOSED">Closed</option>
    </select>,
    item.source || "Website",
    <button
      className="module-text-button"
      key={`act-${item.id}`}
      type="button"
      onClick={() =>
        alert(
          `Enquiry: ${item.enquiryNumber}\nCustomer: ${item.name} (${
            item.phone || "No phone"
          })\nProduct: ${item.product?.name || "General"}\nMessage: "${
            item.message
          }"\nStatus: ${item.status}`
        )
      }
    >
      View Details
    </button>,
  ]);

  return (
    <ContentListPage
      eyebrow="MANAGEMENT / ENQUIRIES"
      title="Enquiries"
      description="Manage enquiries, customer interest, status and contact requests."
      columns={["ID", "CUSTOMER", "PRODUCT", "STATUS", "ORIGIN", "ACTIONS"]}
      rows={rows}
      loading={loading}
      emptyMessage="No customer enquiries received yet. Enquiries from storefront jewellery cards will appear here."
      actionLabel={null}
    />
  );
}
