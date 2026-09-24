import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Power, Eye, GripVertical, Loader2 } from "lucide-react";
import AdminModuleShell from "../../components/AdminModuleShell";
import { tagApi } from "@/lib/api/tagApi";

export default function Tags() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        status: status !== "All" ? status : undefined,
        sortBy: "sortOrder",
        sortOrder: "asc",
        limit: 100,
      };
      const response = await tagApi.getTags(params);
      if (response && response.data) {
        setItems(response.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load tags from API:", err);
      setError(err.message || "Failed to load tags.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTags();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTags]);

  const toggle = async (item) => {
    try {
      const nextStatus = item.status === "Active" ? "Inactive" : "Active";
      await tagApi.updateTag(item.id, { status: nextStatus });
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x))
      );
    } catch (err) {
      alert(err.message || "Failed to update tag status.");
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Are you sure you want to delete tag "${item.name}"?`)) {
      return;
    }

    try {
      const response = await tagApi.deleteTag(item.id);
      const data = response?.data || response;
      if (data?.archived) {
        alert(data.message || `Tag "${item.name}" is assigned to products and was archived to Inactive.`);
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: "Inactive" } : x))
        );
      } else {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
      }
    } catch (err) {
      alert(err.message || "Failed to delete tag.");
    }
  };

  return (
    <AdminModuleShell
      title="Tags"
      description="Create and maintain reusable catalogue tags for discovery and filtering."
      actionLabel="Add Tag"
      onAction={() => nav("/admin/tags/new")}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search tags..."
      filters={
        <select
          className="module-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
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
            <h2>Tags list</h2>
            <p>{items.length} records</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "#d4af37" }} />
          </div>
        ) : error ? (
          <div className="products-empty">
            <h3>Error loading tags</h3>
            <p>{error}</p>
            <button className="add-product-btn" onClick={fetchTags}>Retry</button>
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
                          {item.name ? item.name.slice(0, 1).toUpperCase() : "T"}
                        </div>
                        <div>
                          <strong className="product-name">{item.name}</strong>
                          <span className="sku">
                            {item.description || (item._count?.productTags ? `${item._count.productTags} products` : "ASH Jewellery catalogue tag")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sku">/{item.slug}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${(item.status || "active").toLowerCase()}`}>
                        {item.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="module-actions">
                        <button
                          title="View tag details"
                          onClick={() =>
                            alert(`${item.name}\nSlug: /${item.slug}\nStatus: ${item.status}\nOrder: ${item.sortOrder ?? 0}\nDescription: ${item.description || "None"}`)
                          }
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Edit tag"
                          onClick={() => nav(`/admin/tags/${item.id}/edit`)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title={`Toggle status (currently ${item.status})`}
                          onClick={() => toggle(item)}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          title="Delete or archive tag"
                          className="danger-icon"
                          onClick={() => remove(item)}
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

        {!loading && !error && items.length === 0 && (
          <div className="products-empty">
            <h3>No tags found</h3>
            <p>Try another search or create a new record.</p>
          </div>
        )}
      </div>
    </AdminModuleShell>
  );
}
