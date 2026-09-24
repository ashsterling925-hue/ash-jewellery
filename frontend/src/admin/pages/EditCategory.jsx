import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  X,
  Save,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { categoryApi } from "@/lib/api/categoryApi";
import { mediaApi } from "@/lib/api/mediaApi";
import MediaPickerModal from "../components/MediaPickerModal";

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
    image: "",
    mediaAssetId: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  /* =======================================================
     LOAD CATEGORY (API)
  ======================================================= */

  useEffect(() => {
    async function loadCategory() {
      try {
        setLoading(true);
        setApiError(null);
        const res = await categoryApi.getCategoryById(id);
        const category = res.data;

        if (!category) {
          alert("Category not found.");
          navigate("/admin/categories");
          return;
        }

        setFormData({
          name: category.name || "",
          slug: category.slug || "",
          description: category.description || "",
          status: category.status || "Active",
          image: category.image || "",
          mediaAssetId: category.mediaAssetId || null,
        });
      } catch (err) {
        console.error("Failed to load category:", err);
        alert(err.message || "Category not found.");
        navigate("/admin/categories");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCategory();
    }
  }, [id, navigate]);

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  /* =======================================================
     NAME CHANGE
  ======================================================= */

  function handleNameChange(event) {
    const value = event.target.value;

    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((previous) => ({
      ...previous,
      name: value,
      slug: generatedSlug,
    }));

    setErrors((previous) => ({
      ...previous,
      name: "",
      slug: "",
    }));
  }

  /* =======================================================
     IMAGE UPLOAD & SELECTION
  ======================================================= */

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    try {
      setUploadingImage(true);
      const response = await mediaApi.uploadMedia(file, {
        title: formData.name ? `${formData.name} Category` : file.name,
        altText: formData.name || "Category visual",
        folder: "categories",
      });
      const media = response?.data || response;
      setFormData((prev) => ({
        ...prev,
        image: media.url,
        mediaAssetId: media.id,
      }));
    } catch (err) {
      alert("Failed to upload image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleMediaPickerSelect(selectedAsset) {
    if (!selectedAsset) return;
    setFormData((prev) => ({
      ...prev,
      image: selectedAsset.url,
      mediaAssetId: selectedAsset.id,
    }));
  }

  function removeImage() {
    setFormData((previous) => ({
      ...previous,
      image: "",
      mediaAssetId: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required.";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  /* =======================================================
     SAVE CHANGES (API)
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await categoryApi.updateCategory(id, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        status: formData.status,
        image: formData.image || null,
        mediaAssetId: formData.mediaAssetId || null,
      });

      alert("Category updated successfully.");
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to update category:", err);

      if (err.status === 409) {
        if (err.code === "DUPLICATE_NAME") {
          setErrors((prev) => ({
            ...prev,
            name: "Another category with this name already exists.",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            slug: "Another category with this slug already exists.",
          }));
        }
      } else if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError(err.message || "Failed to update category.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /* =======================================================
     DELETE / ARCHIVE CATEGORY (API)
  ======================================================= */

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${formData.name}"?`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await categoryApi.deleteCategory(id);
      if (res && res.message) {
        alert(res.message);
      } else {
        alert("Category deleted successfully.");
      }
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to delete category:", err);
      alert(err.message || "Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  }

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="product-form-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px auto", display: "block" }} />
        <p style={{ color: "var(--muted, #7c7267)" }}>Loading category details...</p>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="product-form-page">
      {/* =================================================
          HEADER
      ================================================= */}
      <section className="product-form-heading">
        <div>
          <Link to="/admin/categories" className="back-link">
            <ArrowLeft size={14} />
            Back to Categories
          </Link>

          <h1>Edit Category</h1>
        </div>
      </section>

      {/* API ERROR ALERT */}
      {apiError && (
        <div style={{ padding: "12px 16px", color: "#a33d32", background: "#fdf2f2", borderRadius: "4px", marginBottom: "16px", fontSize: "13px" }}>
          <strong>Error: </strong> {apiError}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}
      <form className="product-form-layout" onSubmit={handleSubmit}>
        {/* =================================================
            LEFT COLUMN
        ================================================= */}
        <div className="product-form-main">
          {/* BASIC INFORMATION */}
          <section className="product-form-card">
            <div className="product-form-card-header">
              <h3>Category Information</h3>
            </div>

            <div className="product-form-grid">
              {/* NAME */}
              <div className="form-field full-width">
                <label>
                  Category Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={errors.name ? "input-error" : ""}
                />

                {errors.name && (
                  <small className="field-error">{errors.name}</small>
                )}
              </div>

              {/* SLUG */}
              <div className="form-field">
                <label>
                  Slug
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={errors.slug ? "input-error" : ""}
                />

                {errors.slug && (
                  <small className="field-error">{errors.slug}</small>
                )}
              </div>

              {/* STATUS */}
              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* DESCRIPTION */}
              <div className="form-field full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional category description..."
                />
              </div>
            </div>
          </section>

          {/* IMAGE */}
          <section className="product-form-card">
            <div className="product-form-card-header">
              <h3>Category Image</h3>
            </div>

            {formData.image ? (
              <div className="category-upload-preview">
                <img src={formData.image} alt="Category preview" />

                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="category-remove-image"
                    onClick={() => setIsMediaPickerOpen(true)}
                    style={{ backgroundColor: "#292524", borderColor: "#d4af37", color: "#d4af37" }}
                  >
                    <ImageIcon size={14} /> Change Image
                  </button>

                  <button
                    type="button"
                    className="category-remove-image"
                    onClick={removeImage}
                  >
                    <X size={16} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  className="category-upload-box"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingImage ? <Loader2 size={24} className="animate-spin" /> : <ImagePlus size={24} strokeWidth={1.5} />}
                  <strong>{uploadingImage ? "Uploading..." : "Upload Category Image"}</strong>
                  <span>JPG, PNG, WEBP, or SVG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#292524",
                    border: "1px solid #44403c",
                    borderRadius: "2px",
                    color: "#d4af37",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <ImageIcon size={14} /> Choose from Media Library
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </section>
        </div>

        {/* =================================================
            RIGHT COLUMN
        ================================================= */}
        <aside className="product-form-sidebar">
          {/* PUBLISHING */}
          <section className="product-form-card">
            <div className="product-form-card-header">
              <h3>Publishing</h3>
            </div>

            <label className="publish-option">
              <input
                type="radio"
                name="status"
                value="Active"
                checked={formData.status === "Active"}
                onChange={handleChange}
              />
              <div>
                <strong>Active</strong>
              </div>
            </label>

            <label className="publish-option">
              <input
                type="radio"
                name="status"
                value="Inactive"
                checked={formData.status === "Inactive"}
                onChange={handleChange}
              />
              <div>
                <strong>Inactive</strong>
              </div>
            </label>
          </section>

          {/* ACTIONS */}
          <section className="product-form-card">
            <button
              type="submit"
              className="save-product-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
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
              {isDeleting ? "Deleting..." : "Delete Category"}
            </button>

            <Link to="/admin/categories" className="cancel-product-btn">
              Cancel
            </Link>
          </section>
        </aside>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaPickerSelect}
        multiple={false}
        selectedIds={formData.mediaAssetId ? [formData.mediaAssetId] : []}
        title="Select Category Image"
      />
    </div>
  );
}