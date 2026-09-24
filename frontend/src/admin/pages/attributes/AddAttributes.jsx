import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { attributeApi } from "@/lib/api/attributeApi";

export default function AddAttributes() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter attribute name.");
      return;
    }

    try {
      setSaving(true);
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      await attributeApi.createAttribute({
        name: name.trim(),
        slug,
        description: description.trim() || null,
        status: "Active",
      });

      alert("Attribute created successfully!");
      nav("/admin/attributes");
    } catch (err) {
      console.error("Failed to create attribute:", err);
      alert(err.message || "Failed to create attribute.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="product-form-page">
      <div className="product-form-heading">
        <div>
          <button
            className="back-link"
            type="button"
            onClick={() => nav("/admin/attributes")}
          >
            <ArrowLeft size={15} /> Back to Attributes
          </button>
          <div className="eyebrow">CATALOGUE / ATTRIBUTES</div>
          <h1>Add Attribute</h1>
          <p>Create a new attribute record.</p>
        </div>
      </div>

      <form className="product-form-layout" onSubmit={submit}>
        <main className="product-form-main">
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Occasion, Material, Finish"
                />
              </label>
              <label className="form-field full-width">
                <span>Description</span>
                <textarea
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description for this attribute specification"
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
              <input type="radio" checked readOnly />
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
              Save Attribute
            </button>
            <button
              type="button"
              className="cancel-product-btn"
              onClick={() => nav("/admin/attributes")}
            >
              Cancel
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}
