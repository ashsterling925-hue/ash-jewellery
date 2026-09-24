import { useState, useEffect } from "react";
import ContentListPage from "../../components/ContentListPage";
import { adminApi } from "@/lib/api/adminApi";

export default function Navigation() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNav() {
      try {
        setLoading(true);
        const res = await adminApi.getNavigation();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const allItems = res.data.flatMap((n) => n.items || []);
          setItems(allItems);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Failed to load navigation items:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadNav();
  }, []);

  const rows = items.map((item, idx) => [
    item.sortOrder ?? idx + 1,
    <strong className="product-name" key={item.id}>
      {item.label}
    </strong>,
    <span className="sku" key={`url-${item.id}`}>
      {item.url}
    </span>,
    <span
      className={`status-badge ${(item.status || "active").toLowerCase()}`}
      key={`status-${item.id}`}
    >
      {item.status || "Active"}
    </span>,
    <button
      className="module-text-button"
      key={`btn-${item.id}`}
      type="button"
      onClick={() => alert(`Edit navigation item: ${item.label}`)}
    >
      Edit
    </button>,
  ]);

  return (
    <ContentListPage
      eyebrow="CONTENT / NAVIGATION"
      title="Navigation"
      description="Manage customer-facing navigation labels, links and ordering."
      columns={["ORDER", "LABEL", "LINK", "STATUS", "ACTIONS"]}
      rows={rows}
      loading={loading}
      emptyMessage="No custom navigation items configured yet."
      actionLabel={null}
    />
  );
}
