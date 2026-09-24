import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { attributeApi } from "@/lib/api/attributeApi";

export default function EditAttributes() {
  const { id } = useParams();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAttribute() {
      try {
        setLoading(true);
        const res = await attributeApi.getAttributeById(id);
        if (res?.data) {
          setItem(res.data);
        } else {
          setItem(null);
        }
      } catch (err) {
        console.error("Failed to load attribute:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadAttribute();
    }
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
          color: "#8a8277",
        }}
      >
        <Loader2 size={24} className="animate-spin" />
        <span style={{ marginLeft: "8px" }}>Loading attribute...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="products-empty">
        <h3>Attribute not found</h3>
        <p>The requested attribute could not be found in the database.</p>
        <button
          className="add-product-btn"
          type="button"
          onClick={() => nav("/admin/attributes")}
        >
          Back to Attributes
        </button>
      </div>
    );
  }

  const saveIt = async (e) => {
    e.preventDefault();
    if (!item.name?.trim()) {
      alert("Name is required.");
      return;
    }

    try {
      setSaving(true);
      await attributeApi.updateAttribute(id, {
        name: item.name.trim(),
        slug: item.slug?.trim() || undefined,
        description: item.description?.trim() || null,
        status: item.status || "Active",
      });

      alert("Attribute updated successfully!");
      nav("/admin/attributes");
    } catch (err) {
      console.error("Failed to update attribute:", err);
      alert(err.message || "Failed to update attribute.");
    } finally {
      setSaving(false);
    }
  };

  const deleteIt = async () => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }
    try {
      await attributeApi.deleteAttribute(id);
      alert("Attribute deleted successfully!");
      nav("/admin/attributes");
    } catch (err) {
      alert(err.message || "Failed to delete attribute.");
    }
  };

  return (
    <section className="product-form-page">
      <div className="product-form-heading">
        <button
          className="back-link"
          type="button"
          onClick={() => nav("/admin/attributes")}
        >
          <ArrowLeft size={15} /> Back to Attributes
        </button>
        <div className="eyebrow">CATALOGUE / ATTRIBUTES</div>
        <h1>Edit Attribute</h1>
        <p>Update this catalogue specification record.</p>
      </div>

      <form className="product-form-layout" onSubmit={saveIt}>
        <main className="product-form-main">
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
                  value={item.slug || ""}
                  onChange={(e) => setItem({ ...item, slug: e.target.value })}
                />
              </label>
              <label className="form-field full-width">
                <span>Description</span>
                <textarea
                  rows="5"
                  value={item.description || ""}
                  onChange={(e) =>
                    setItem({ ...item, description: e.target.value })
                  }
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
            <label className="publish-option">
              <input
                type="checkbox"
                checked={item.status === "Active"}
                onChange={(e) =>
                  setItem({
                    ...item,
                    status: e.target.checked ? "Active" : "Inactive",
                  })
                }
              />
              <span>Active</span>
            </label>
            <button
              className="save-product-btn"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-product-btn"
              style={{ color: "#a64b42", marginTop: "8px" }}
              onClick={deleteIt}
            >
              <Trash2 size={14} /> Delete Attribute
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}
