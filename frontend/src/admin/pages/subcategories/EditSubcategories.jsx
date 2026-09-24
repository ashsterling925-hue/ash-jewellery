import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import { categoryApi } from "@/lib/api/categoryApi";
import { subcategoryApi } from "@/lib/api/subcategoryApi";
import { storefrontApi } from "@/lib/api/storefrontApi";

export default function EditSubcategories() {
  const { id } = useParams();
  const nav = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    sortOrder: 0,
    status: "Active",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setApiError(null);

        const subcatRes = await subcategoryApi.getSubcategoryById(id);
        const subcategory = subcatRes.data;
        if (!subcategory) {
          alert("Subcategory not found.");
          nav("/admin/subcategories");
          return;
        }

        let catList = [];
        try {
          const catRes = await categoryApi.getCategories({ limit: 100 });
          if (catRes?.data) catList = catRes.data;
        } catch {
          const pubRes = await storefrontApi.getCategories({ limit: 100 });
          if (pubRes?.data) catList = pubRes.data;
        }

        setCategories(catList);

        setFormData({
          categoryId: subcategory.categoryId || "",
          name: subcategory.name || "",
          slug: subcategory.slug || "",
          description: subcategory.description || "",
          sortOrder: subcategory.sortOrder ?? 0,
          status: subcategory.status || "Active",
        });
      } catch (err) {
        console.error("Failed to load subcategory data:", err);
        alert(err.message || "Failed to load subcategory.");
        nav("/admin/subcategories");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id, nav]);

  function handleNameChange(e) {
    const value = e.target.value;
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generatedSlug,
    }));

    setErrors((prev) => ({ ...prev, name: "", slug: "" }));
  }

  function validate() {
    const newErrors = {};
    if (!formData.categoryId) {
      newErrors.categoryId = "Please select a category.";
    }
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Subcategory name is required.";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setApiError(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  }

  const saveIt = async (e) => {
    if (e) e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const cleanSlug = (formData.slug || formData.name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      await subcategoryApi.updateSubcategory(id, {
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        slug: cleanSlug || undefined,
        description: (formData.description || "").trim() || null,
        status: formData.status,
        sortOrder: Number(formData.sortOrder) || 0,
      });

      alert("Subcategory updated successfully.");
      nav("/admin/subcategories");
    } catch (err) {
      console.error("Failed to update subcategory:", err);
      if (err.status === 409) {
        if (err.code === "DUPLICATE_NAME") {
          const msg = "Another subcategory with this name already exists in this category.";
          setErrors((prev) => ({ ...prev, name: msg }));
          setApiError(msg);
        } else {
          const msg = "Another subcategory with this slug already exists.";
          setErrors((prev) => ({ ...prev, slug: msg }));
          setApiError(msg);
        }
      } else if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((er) => {
          if (er.field) fieldErrors[er.field] = er.message;
        });
        setErrors(fieldErrors);
        setApiError(err.errors[0]?.message || "Validation failed.");
      } else {
        setApiError(err.message || "Failed to update subcategory.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${formData.name}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await subcategoryApi.deleteSubcategory(id);
      if (res && res.message) {
        alert(res.message);
      } else {
        alert("Subcategory deleted successfully.");
      }
      nav("/admin/subcategories");
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
      alert(err.message || "Failed to delete subcategory.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="product-form-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px auto", display: "block" }} />
        <p style={{ color: "var(--muted, #7c7267)" }}>Loading subcategory from Neon database...</p>
      </section>
    );
  }

  return (
    <section className="product-form-page">
      <div className="product-form-heading flex items-center justify-between">
        <div>
          <button
            type="button"
            className="back-link cursor-pointer"
            onClick={() => nav("/admin/subcategories")}
          >
            <ArrowLeft size={15} /> Back to Subcategories
          </button>
          <div className="eyebrow">CATALOGUE / SUBCATEGORIES</div>
          <h1>Edit Subcategory</h1>
          <p>Update this catalogue record and parent category assignment.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cancel-product-btn cursor-pointer"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            style={{ margin: 0, color: "#e11d48", borderColor: "#fecdd3" }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            type="button"
            className="save-product-btn cursor-pointer"
            onClick={saveIt}
            disabled={isSubmitting || isDeleting}
            style={{ margin: 0 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={15} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {apiError && (
        <div style={{ padding: "14px 18px", color: "#a33d32", background: "#fdf2f2", borderRadius: "6px", marginBottom: "20px" }}>
          <strong>Error: </strong> {apiError}
        </div>
      )}

      <form className="product-form-layout" onSubmit={saveIt}>
        <main className="product-form-main">
          <div className="product-form-card">
            <div className="product-form-card-header">
              <h2>Basic Information</h2>
            </div>

            <div className="product-form-grid">
              {/* CATEGORY DROPDOWN */}
              <label className="form-field full-width">
                <span>Category *</span>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className={errors.categoryId ? "input-error" : ""}
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <small className="field-error">{errors.categoryId}</small>
                )}
              </label>

              {/* NAME */}
              <label className="form-field full-width">
                <span>Name *</span>
                <input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && (
                  <small className="field-error">{errors.name}</small>
                )}
              </label>

              {/* SLUG */}
              <label className="form-field">
                <span>Slug *</span>
                <input
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className={errors.slug ? "input-error" : ""}
                />
                {errors.slug && (
                  <small className="field-error">{errors.slug}</small>
                )}
              </label>

              {/* SORT ORDER */}
              <label className="form-field">
                <span>Sort Order</span>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: Number(e.target.value) })
                  }
                />
              </label>

              {/* DESCRIPTION */}
              <label className="form-field full-width">
                <span>Description</span>
                <textarea
                  rows="5"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
                type="radio"
                name="edit-subcat-status"
                value="Active"
                checked={formData.status === "Active"}
                onChange={() => setFormData({ ...formData, status: "Active" })}
              />
              <div>
                <strong>Active</strong>
                <span>Subcategory is visible and available.</span>
              </div>
            </label>

            <label className="publish-option">
              <input
                type="radio"
                name="edit-subcat-status"
                value="Inactive"
                checked={formData.status === "Inactive"}
                onChange={() => setFormData({ ...formData, status: "Inactive" })}
              />
              <div>
                <strong>Inactive</strong>
                <span>Subcategory is hidden from customers.</span>
              </div>
            </label>

            <button
              className="save-product-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              className="delete-product-btn"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                width: "100%",
                padding: "9px 14px",
                border: "1px solid #f2dede",
                background: "#fcf8f8",
                color: "#a33d32",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: "600",
                marginTop: "8px",
              }}
            >
              <Trash2 size={15} />
              {isDeleting ? "Deleting..." : "Delete Subcategory"}
            </button>

            <button
              type="button"
              className="cancel-product-btn"
              onClick={() => nav("/admin/subcategories")}
            >
              Cancel
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}
