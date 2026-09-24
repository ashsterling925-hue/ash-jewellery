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
import { collectionApi } from "@/lib/api/collectionApi";

export default function Collections() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [viewItem, setViewItem] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch collections from API
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: status !== "All" ? status : undefined,
        sortBy: "sortOrder",
        sortOrder: "asc",
      };

      const res = await collectionApi.getCollections(params);
      if (res && res.data) {
        setItems(res.data);
        if (res.pagination) {
          setTotal(res.pagination.total);
        }
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCollections();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchCollections]);

  // Toggle status
  const toggle = async (item) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      await collectionApi.updateCollection(item.id, { status: nextStatus });
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x))
      );
    } catch (err) {
      console.error("Failed to toggle collection status:", err);
      alert(err.message || "Failed to toggle status.");
    }
  };

  // Safe delete
  const remove = async (id) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;

    if (!confirm(`Are you sure you want to delete collection "${item.name}"?`)) {
      return;
    }

    try {
      const res = await collectionApi.deleteCollection(id);
      if (res && res.message) {
        alert(res.message);
      }
      fetchCollections();
    } catch (err) {
      console.error("Failed to delete collection:", err);
      alert(err.message || "Failed to delete collection.");
    }
  };

  return (
    <AdminModuleShell
      title="Collections"
      description="Manage editorial jewellery collections and their catalogue assignments."
      actionLabel="Add Collection"
      onAction={() => nav("/admin/collections/new")}
      search={search}
      onSearch={(val) => {
        setSearch(val);
        setPage(1);
      }}
      searchPlaceholder="Search collections..."
      filters={
        <select
          className="module-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      }
    >
      <div className="products-card module-card">
        <div className="products-card-header">
          <div>
            <h2>Collections list</h2>
            <p>
              {total} {total === 1 ? "record" : "records"}
            </p>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: "var(--muted, #7c7267)",
            }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ margin: "0 auto 8px auto", display: "block" }}
            />
            <span>Loading collections from Neon database...</span>
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
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <GripVertical size={14} />{" "}
                      {item.sortOrder ?? item.order ?? 0}
                    </td>

                    <td>
                      <div className="product-cell">
                        <div className="module-record-icon">
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <strong className="product-name">{item.name}</strong>
                          <span className="sku">
                            {item.description || "ASH Jewellery catalogue record"}
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
                          item.status || "Active"
                        ).toLowerCase()}`}
                      >
                        {item.status || "Active"}
                      </span>
                    </td>

                    <td>
                      <div className="module-actions">
                        <button
                          type="button"
                          title="View collection"
                          onClick={() => setViewItem(item)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit collection"
                          onClick={() => nav(`/admin/collections/${item.id}/edit`)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title="Toggle active status"
                          onClick={() => toggle(item)}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          type="button"
                          className="danger-icon"
                          title="Delete collection"
                          onClick={() => remove(item.id)}
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

        {!loading && items.length === 0 && (
          <div className="products-empty">
            <h3>No collections found</h3>
            <p>Try another search or create a new record.</p>
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
              <p className="eyebrow">COLLECTION PREVIEW</p>
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
                    nav(`/admin/collections/${id}/edit`);
                  }}
                >
                  <Pencil size={15} />
                  Edit Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminModuleShell>
  );
}
