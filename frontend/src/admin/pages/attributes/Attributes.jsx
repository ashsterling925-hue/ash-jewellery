import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Power,
  Eye,
  GripVertical,
  Loader2,
  X,
} from "lucide-react";
import AdminModuleShell from "../../components/AdminModuleShell";
import { attributeApi } from "@/lib/api/attributeApi";

export default function Attributes() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [viewItem, setViewItem] = useState(null);

  const fetchAttributes = useCallback(async () => {
    try {
      setLoading(true);

      // Clean up legacy localStorage cache
      try {
        localStorage.removeItem("ashAttributes");
      } catch {
        // ignore
      }

      const params = {
        search: search.trim() || undefined,
        status: status !== "All" ? status : undefined,
        limit: 100,
        sortBy: "sortOrder",
        sortOrder: "asc",
      };

      const res = await attributeApi.getAttributes(params);
      if (res && res.data) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load attributes:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const toggle = async (item) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      await attributeApi.updateAttribute(item.id, { status: nextStatus });
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x))
      );
    } catch (err) {
      alert(err.message || "Failed to toggle status.");
    }
  };

  const remove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete attribute "${name}"?`)) {
      return;
    }
    try {
      await attributeApi.deleteAttribute(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete attribute.");
    }
  };

  return (
    <AdminModuleShell
      title="Attributes"
      description="Configure jewellery specifications and filterable attribute values."
      actionLabel="Add Attribute"
      onAction={() => nav("/admin/attributes/new")}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search attributes..."
      filters={
        <select
          className="module-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      }
    >
      <div className="products-card module-card">
        <div className="products-card-header">
          <div>
            <h2>Attributes list</h2>
            <p>{items.length} records</p>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: "#8a8277",
            }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ margin: "0 auto 8px auto", display: "block" }}
            />
            <span>Loading attributes from database...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="products-empty">
            <h3>No attributes found</h3>
            <p>
              Your catalogue has no custom attributes configured yet. Click "Add Attribute" to create one.
            </p>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table module-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>NAME</th>
                  <th>SLUG</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>
                      <GripVertical size={14} /> {item.sortOrder ?? idx + 1}
                    </td>
                    <td>
                      <div className="product-cell">
                        <div className="module-record-icon">
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <strong className="product-name">{item.name}</strong>
                          <span className="sku">
                            {item.description || "ASH Jewellery attribute"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sku">/{item.slug}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${(
                          item.status || "active"
                        ).toLowerCase()}`}
                      >
                        {item.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="module-actions">
                        <button
                          type="button"
                          title="View attribute"
                          onClick={() => setViewItem(item)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit attribute"
                          onClick={() => nav(`/admin/attributes/${item.id}/edit`)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title="Toggle status"
                          onClick={() => toggle(item)}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          type="button"
                          className="danger-icon"
                          title="Delete attribute"
                          onClick={() => remove(item.id, item.name)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK VIEW MODAL */}
      {viewItem && (
        <div
          className="product-view-overlay"
          onClick={() => setViewItem(null)}
        >
          <div
            className="product-view-modal category-view-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="product-view-close"
              onClick={() => setViewItem(null)}
            >
              <X size={18} />
            </button>

            <div
              className="product-view-content"
              style={{ width: "100%", padding: "20px" }}
            >
              <p className="eyebrow">ATTRIBUTE PREVIEW</p>
              <h2>{viewItem.name}</h2>
              <p className="product-view-sku">Slug: /{viewItem.slug}</p>

              <div className="product-view-details">
                <div>
                  <span>Status</span>
                  <strong>{viewItem.status}</strong>
                </div>

                <div>
                  <span>Sort Order</span>
                  <strong>{viewItem.sortOrder ?? 0}</strong>
                </div>

                <div>
                  <span>Description</span>
                  <strong>{viewItem.description || "No description"}</strong>
                </div>
              </div>

              <div
                className="product-view-actions"
                style={{ marginTop: "20px" }}
              >
                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => {
                    const id = viewItem.id;
                    setViewItem(null);
                    nav(`/admin/attributes/${id}/edit`);
                  }}
                >
                  <Pencil size={15} />
                  Edit Attribute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminModuleShell>
  );
}
