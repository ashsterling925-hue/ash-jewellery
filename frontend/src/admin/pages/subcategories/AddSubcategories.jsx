import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, FolderPlus } from "lucide-react";
import { categoryApi } from "@/lib/api/categoryApi";
import { subcategoryApi } from "@/lib/api/subcategoryApi";
import { storefrontApi } from "@/lib/api/storefrontApi";

export default function AddSubcategories() {
  const nav = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    sortOrder: 0,
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load active categories for dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        let list = [];
        try {
          const res = await categoryApi.getCategories({ limit: 100 });
          if (res?.data && res.data.length > 0) {
            list = res.data;
          }
        } catch (err) {
          console.warn("categoryApi fetch failed, trying storefrontApi fallback:", err);
        }

        if (list.length === 0) {
          const pubRes = await storefrontApi.getCategories({ limit: 100 });
          if (pubRes?.data) {
            list = pubRes.data;
          }
        }

        setCategories(list);
        if (list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            categoryId: prev.categoryId || list[0].id,
          }));
        }
      } catch (err) {
        console.error("Failed to load categories for dropdown:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

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
    setApiError(null);
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

  const submit = async (e) => {
    if (e) e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Auto-fallback slug if empty
      const cleanSlug = (formData.slug || formData.name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const payload = {
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        slug: cleanSlug || undefined,
        description: (formData.description || "").trim() || null,
        status: formData.status || "Active",
        sortOrder: Number(formData.sortOrder) || 0,
      };

      await subcategoryApi.createSubcategory(payload);

      alert("Subcategory created successfully!");
      nav("/admin/subcategories");
    } catch (err) {
      console.error("Failed to create subcategory:", err);
      if (err.status === 409) {
        if (err.code === "DUPLICATE_NAME") {
          const msg = "A subcategory with this name already exists in the selected category.";
          setErrors((prev) => ({ ...prev, name: msg }));
          setApiError(msg);
        } else {
          const msg = "A subcategory with this slug already exists.";
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
        setApiError(err.message || "Failed to create subcategory.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1>Add Subcategory</h1>
          <p>Create a new subcategory record linked to a parent category.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="save-product-btn cursor-pointer"
            onClick={submit}
            disabled={isSubmitting}
            style={{ margin: 0 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={15} /> Save Subcategory
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

      <form id="add-subcategory-form" className="product-form-layout" onSubmit={submit}>
        <main className="product-form-main">
          <div className="product-form-card">
            <div className="product-form-card-header">
              <h2>Basic Information</h2>
              <p>Keep the catalogue information clear and customer-ready.</p>
            </div>

            <div className="product-form-grid">
              {/* CATEGORY DROPDOWN */}
              <label className="form-field full-width">
                <span>Category * (Compulsory)</span>
                {loadingCategories ? (
                  <div style={{ padding: "8px 0", color: "var(--muted, #7c7267)", fontSize: "11px" }}>
                    Loading categories from database...
                  </div>
                ) : categories.length === 0 ? (
                  <div style={{ padding: "10px", background: "#fff8e6", border: "1px solid #ffd591", borderRadius: "6px", fontSize: "12px", color: "#874d00" }}>
                    No categories found. Please <Link to="/admin/categories/new" style={{ textDecoration: "underline", fontWeight: "bold" }}>create a category first</Link> before adding a subcategory.
                  </div>
                ) : (
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData({ ...formData, categoryId: e.target.value });
                      setErrors((prev) => ({ ...prev, categoryId: "" }));
                      setApiError(null);
                    }}
                    className={errors.categoryId ? "input-error" : ""}
                  >
                    <option value="">-- Select a Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.categoryId && (
                  <small className="field-error">{errors.categoryId}</small>
                )}
              </label>

              {/* NAME */}
              <label className="form-field full-width">
                <span>Subcategory Name *</span>
                <input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter subcategory name (e.g. Traditional Bangles)"
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
                  onChange={(e) => {
                    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    setFormData({ ...formData, slug: clean });
                  }}
                  placeholder="e.g. traditional-bangles"
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
                    setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })
                  }
                  placeholder="0"
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
                  placeholder="Enter subcategory description..."
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

            <label className="publish-option cursor-pointer">
              <input
                type="radio"
                name="subcat-status"
                value="Active"
                checked={formData.status === "Active"}
                onChange={() => setFormData({ ...formData, status: "Active" })}
              />
              <div>
                <strong>Active</strong>
                <span>Subcategory is visible and available.</span>
              </div>
            </label>

            <label className="publish-option cursor-pointer">
              <input
                type="radio"
                name="subcat-status"
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
              className="save-product-btn cursor-pointer"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={15} /> Save Subcategory
                </>
              )}
            </button>

            <button
              type="button"
              className="cancel-product-btn cursor-pointer"
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
