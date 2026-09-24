import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { tagApi } from "@/lib/api/tagApi";

export default function EditTags() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTag() {
      try {
        setLoading(true);
        setError(null);
        const res = await tagApi.getTagById(id);
        const tag = res?.data || res;
        if (tag) {
          setItem({
            name: tag.name || "",
            slug: tag.slug || "",
            description: tag.description || "",
            sortOrder: tag.sortOrder ?? 0,
            status: tag.status || "Active",
          });
        } else {
          setItem(null);
        }
      } catch (err) {
        console.error("Failed to load tag:", err);
        setError(err.message || "Failed to load tag details.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadTag();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <Loader2 className="animate-spin" size={28} style={{ color: "#d4af37" }} />
      </div>
    );
  }

  if (!item && !loading) {
    return (
      <div className="products-empty">
        <h3>Tag not found</h3>
        <p>{error || "The requested tag does not exist or may have been deleted."}</p>
        <button className="add-product-btn" onClick={() => nav("/admin/tags")}>
          Back to Tags
        </button>
      </div>
    );
  }

  const saveIt = async (e) => {
    e.preventDefault();
    if (!item.name?.trim()) {
      setError("Tag name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await tagApi.updateTag(id, {
        name: item.name.trim(),
        slug: item.slug?.trim() || undefined,
        description: item.description?.trim() || "",
        sortOrder: Number(item.sortOrder) || 0,
        status: item.status,
      });

      nav("/admin/tags");
    } catch (err) {
      console.error("Failed to update tag:", err);
      if (err.status === 409) {
        setError(
          err.code === "DUPLICATE_NAME"
            ? "A tag with this name already exists."
            : "A tag with this slug already exists."
        );
      } else {
        setError(err.message || "Failed to update tag. Please check inputs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="product-form-page">
      <div className="product-form-heading">
        <button className="back-link" onClick={() => nav("/admin/tags")}>
          <ArrowLeft size={15} /> Back to Tags
        </button>
        <div className="eyebrow">CATALOGUE / TAGS</div>
        <h1>Edit Tag</h1>
        <p>Update this catalogue record in Neon PostgreSQL.</p>
      </div>

      <form className="product-form-layout" onSubmit={saveIt}>
        <main className="product-form-main">
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #ef4444",
                color: "#991b1b",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div className="product-form-card">
            <div className="product-form-card-header">
              <h2>Basic Information</h2>
            </div>
            <div className="product-form-grid">
              <label className="form-field full-width">
                <span>Name *</span>
                <input
                  required
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                />
              </label>

              <label className="form-field full-width">
                <span>Slug</span>
                <input
                  value={item.slug}
                  onChange={(e) => setItem({ ...item, slug: e.target.value })}
                />
              </label>

              <label className="form-field full-width">
                <span>Sort Order</span>
                <input
                  type="number"
                  value={item.sortOrder}
                  onChange={(e) => setItem({ ...item, sortOrder: e.target.value })}
                />
              </label>

              <label className="form-field full-width">
                <span>Description</span>
                <textarea
                  rows="4"
                  value={item.description || ""}
                  onChange={(e) => setItem({ ...item, description: e.target.value })}
                />
              </label>
            </div>
          </div>
        </main>

        <aside className="product-form-sidebar">
          <div className="product-form-card">
            <div className="product-form-card-header">
              <h2>Publishing</h2>
            </div>
            <label className="publish-option" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={item.status === "Active"}
                onChange={(e) =>
                  setItem({ ...item, status: e.target.checked ? "Active" : "Inactive" })
                }
              />
              <span>Active</span>
            </label>
            <button className="save-product-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="cancel-product-btn"
              onClick={() => nav("/admin/tags")}
            >
              Cancel
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}
