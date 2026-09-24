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
import { subcategoryApi } from "@/lib/api/subcategoryApi";
import { categoryApi } from "@/lib/api/categoryApi";

export default function Subcategories() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewItem, setViewItem] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Load categories for filter dropdown
  useEffect(() => {
    async function loadCategoryOptions() {
      try {
        const res = await categoryApi.getCategories({ limit: 100 });
        if (res && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load category filters:", err);
      }
    }
    loadCategoryOptions();
  }, []);

  // Fetch subcategories
  const fetchSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: status !== "All" ? status : undefined,
        categoryId: categoryFilter !== "All" ? categoryFilter : undefined,
        sortBy: "sortOrder",
        sortOrder: "asc",
      };

      const res = await subcategoryApi.getSubcategories(params);
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
      console.error("Failed to load subcategories:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubcategories();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchSubcategories]);

  // Toggle status
  const toggle = async (item) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      await subcategoryApi.updateSubcategory(item.id, { status: nextStatus });
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x))
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert(err.message || "Failed to toggle status.");
    }
  };

  // Safe delete
  const remove = async (id) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;

    if (!confirm(`Are you sure you want to delete subcategory "${item.name}"?`)) {
      return;
    }

    try {
      const res = await subcategoryApi.deleteSubcategory(id);
      if (res && res.message) {
        alert(res.message);
      }
      fetchSubcategories();
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
      alert(err.message || "Failed to delete subcategory.");
    }
  };

  return (
    <AdminModuleShell
      title="Subcategories"
      description="Manage category-level groupings, ordering, status and SEO."
      actionLabel="Add Subcategory"
      onAction={() => nav("/admin/subcategories/new")}
      search={search}
      onSearch={(val) => {
        setSearch(val);
        setPage(1);
      }}
      searchPlaceholder="Search subcategories..."
      filters={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* CATEGORY FILTER */}
          <select
            className="module-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* STATUS FILTER */}
          <select
            className="module-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      }
    >
      <div className="products-card module-card">
        <div className="products-card-header">
          <div>
            <h2>Subcategories list</h2>
            <p>{total} {total === 1 ? "record" : "records"}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--muted, #7c7267)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px auto", display: "block" }} />
            <span>Loading subcategories from Neon database...</span>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table module-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>SLUG</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <GripVertical size={14} /> {item.sortOrder ?? item.order ?? 0}
                    </td>

                    <td>
                      <div className="product-cell">
                        <div className="module-record-icon">
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <strong className="product-name">{item.name}</strong>
                          <span className="sku">{item.description || "Subcategory record"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="sku" style={{ fontWeight: 600, color: "var(--ink, #1e1c19)" }}>
                        {item.category?.name || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="sku">/{item.slug}</span>
                    </td>

                    <td>
                      <span className={`status-badge ${(item.status || "Active").toLowerCase()}`}>
                        {item.status || "Active"}
                      </span>
                    </td>

                    <td>
                      <div className="module-actions">
                        <button
                          type="button"
                          title="View subcategory"
                          onClick={() => setViewItem(item)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit subcategory"
                          onClick={() => nav(`/admin/subcategories/${item.id}/edit`)}
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
                          title="Delete subcategory"
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
            <h3>No subcategories found</h3>
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

            <div className="product-view-content" style={{ width: "100%", padding: "20px" }}>
              <p className="eyebrow">SUBCATEGORY PREVIEW</p>
              <h2>{viewItem.name}</h2>
              <p className="product-view-sku">Slug: /{viewItem.slug}</p>

              <div className="product-view-details">
                <div>
                  <span>Category</span>
                  <strong>{viewItem.category?.name || "Unassigned"}</strong>
                </div>

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

              <div className="product-view-actions" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => {
                    const id = viewItem.id;
                    setViewItem(null);
                    nav(`/admin/subcategories/${id}/edit`);
                  }}
                >
                  <Pencil size={15} />
                  Edit Subcategory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminModuleShell>
  );
}
