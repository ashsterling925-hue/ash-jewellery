import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, ImagePlus, X, Image as ImageIcon } from "lucide-react";
import { collectionApi } from "@/lib/api/collectionApi";
import { mediaApi } from "@/lib/api/mediaApi";
import MediaPickerModal from "../../components/MediaPickerModal";

export default function AddCollections() {
  const nav = useNavigate();

  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    sortOrder: 0,
    status: "Active",
    image: "",
    mediaAssetId: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    if (!formData.name.trim()) {
      newErrors.name = "Collection name is required.";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const submit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await collectionApi.createCollection({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        sortOrder: Number(formData.sortOrder) || 0,
        image: formData.image || null,
        mediaAssetId: formData.mediaAssetId || null,
      });

      alert("Collection created successfully.");
      nav("/admin/collections");
    } catch (err) {
      console.error("Failed to create collection:", err);
      if (err.status === 409) {
        if (err.code === "DUPLICATE_NAME") {
          setErrors((prev) => ({
            ...prev,
            name: "A collection with this name already exists.",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            slug: "A collection with this slug already exists.",
          }));
        }
      } else if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((er) => {
          if (er.field) fieldErrors[er.field] = er.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError(err.message || "Failed to create collection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="product-form-page">
      <div className="product-form-heading">
        <div>
          <button
            type="button"
            className="back-link"
            onClick={() => nav("/admin/collections")}
          >
            <ArrowLeft size={15} /> Back to Collections
          </button>
          <div className="eyebrow">CATALOGUE / COLLECTIONS</div>
          <h1>Add Collection</h1>
          <p>Create a new curated jewellery collection.</p>
        </div>
      </div>

      {apiError && (
        <div
          style={{
            padding: "14px 18px",
            color: "#a33d32",
            background: "#fdf2f2",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <strong>Error: </strong> {apiError}
        </div>
      )}

      <form className="product-form-layout" onSubmit={submit}>
        <main className="product-form-main">
          <div className="product-form-card">
            <div className="product-form-card-header">
              <h2>Basic Information</h2>
              <p>Keep the catalogue information clear and customer-ready.</p>
            </div>

            <div className="product-form-grid">
              {/* NAME */}
              <label className="form-field full-width">
                <span>Name *</span>
                <input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Heritage Collection"
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
                  placeholder="e.g. heritage-collection"
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
                    setFormData({
                      ...formData,
                      sortOrder: Number(e.target.value),
                    })
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
                  placeholder="Describe this curated collection..."
                />
              </label>
            </div>
          </div>

          {/* COLLECTION IMAGE */}
          <div className="product-form-card" style={{ marginTop: "20px" }}>
            <div className="product-form-card-header">
              <h2>Collection Image</h2>
              <p>Add a visual cover image for this collection.</p>
            </div>

            {formData.image ? (
              <div className="category-upload-preview" style={{ padding: "10px" }}>
                <img
                  src={formData.image}
                  alt="Collection preview"
                  style={{ maxHeight: "180px", borderRadius: "6px", objectFit: "cover" }}
                />

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
                    onClick={() => setFormData((prev) => ({ ...prev, image: "", mediaAssetId: null }))}
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
                  {uploadingImage ? <Loader2 size={28} className="animate-spin" /> : <ImagePlus size={28} strokeWidth={1.4} />}
                  <strong>{uploadingImage ? "Uploading..." : "Upload Collection Image"}</strong>
                  <span>JPG, PNG, WEBP, or SVG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#292524",
                    border: "1px solid #44403c",
                    borderRadius: "6px",
                    color: "#d4af37",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <ImageIcon size={15} /> Choose from Media Library
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploadingImage(true);
                  const res = await mediaApi.uploadMedia(file, {
                    title: formData.name ? `${formData.name} Collection` : file.name,
                    altText: formData.name || "Collection cover",
                    folder: "collections",
                  });
                  const media = res?.data || res;
                  setFormData((prev) => ({
                    ...prev,
                    image: media.url,
                    mediaAssetId: media.id,
                  }));
                } catch (err) {
                  alert("Failed to upload image: " + (err.message || "Unknown error"));
                } finally {
                  setUploadingImage(false);
                  e.target.value = "";
                }
              }}
            />
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
                name="col-status"
                value="Active"
                checked={formData.status === "Active"}
                onChange={() => setFormData({ ...formData, status: "Active" })}
              />
              <div>
                <strong>Active</strong>
                <span>Collection is visible and available.</span>
              </div>
            </label>

            <label className="publish-option">
              <input
                type="radio"
                name="col-status"
                value="Inactive"
                checked={formData.status === "Inactive"}
                onChange={() =>
                  setFormData({ ...formData, status: "Inactive" })
                }
              />
              <div>
                <strong>Inactive</strong>
                <span>Collection is hidden from customers.</span>
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
                  <Save size={15} /> Save Collection
                </>
              )}
            </button>

            <button
              type="button"
              className="cancel-product-btn"
              onClick={() => nav("/admin/collections")}
            >
              Cancel
            </button>
          </div>
        </aside>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(selectedAsset) => {
          if (!selectedAsset) return;
          setFormData((prev) => ({
            ...prev,
            image: selectedAsset.url,
            mediaAssetId: selectedAsset.id,
          }));
        }}
        multiple={false}
        selectedIds={formData.mediaAssetId ? [formData.mediaAssetId] : []}
        title="Select Collection Image"
      />
    </section>
  );
}
