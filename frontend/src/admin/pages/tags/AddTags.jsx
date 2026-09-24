import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { tagApi } from "@/lib/api/tagApi";

export default function AddTags() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [sortOrder, setSortOrder] = useState("0");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleNameChange = (val) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(generatedSlug);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tag name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await tagApi.createTag({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        status,
        sortOrder: Number(sortOrder) || 0,
      });

      nav("/admin/tags");
    } catch (err) {
      console.error("Failed to create tag:", err);
      if (err.status === 409) {
        setError(err.code === "DUPLICATE_NAME" 
          ? "A tag with this name already exists." 
          : "A tag with this slug already exists.");
      } else {
        setError(err.message || "Failed to create tag. Please verify inputs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="product-form-page">
      <div className="product-form-heading">
        <div>
          <button className="back-link" onClick={() => nav("/admin/tags")}>
            <ArrowLeft size={15} /> Back to Tags
          </button>
          <div className="eyebrow">CATALOGUE / TAGS</div>
          <h1>Add Tag</h1>
          <p>Create a new catalogue tag record in Neon PostgreSQL.</p>
        </div>
      </div>

      <form className="product-form-layout" onSubmit={submit}>
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
              <p>Keep the catalogue information clear and customer-ready.</p>
            </div>
            <div className="product-form-grid">
              <label className="form-field full-width">
                <span>Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Wedding Edit, Bridal, Festive"
                />
              </label>

              <label className="form-field full-width">
                <span>Slug</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. wedding-edit"
                />
              </label>

              <label className="form-field full-width">
                <span>Sort Order</span>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                />
              </label>

              <label className="form-field full-width">
                <span>Description</span>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter tag description..."
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
            <label className="publish-option" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", cursor: "pointer" }}>
              <input
                type="radio"
                name="tagStatus"
                value="Active"
                checked={status === "Active"}
                onChange={() => setStatus("Active")}
              />
              <span>Active</span>
            </label>
            <label className="publish-option" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", cursor: "pointer" }}>
              <input
                type="radio"
                name="tagStatus"
                value="Inactive"
                checked={status === "Inactive"}
                onChange={() => setStatus("Inactive")}
              />
              <span>Inactive</span>
            </label>

            <button className="save-product-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              {isSubmitting ? "Saving..." : "Save Tag"}
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
