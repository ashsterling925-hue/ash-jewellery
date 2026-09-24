import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Star,
  ChevronUp,
  ChevronDown,
  Loader2,
  FolderTree,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { productApi } from "@/lib/api/productApi";
import { categoryApi } from "@/lib/api/categoryApi";
import { subcategoryApi } from "@/lib/api/subcategoryApi";
import { storefrontApi } from "@/lib/api/storefrontApi";
import { mediaApi } from "@/lib/api/mediaApi";
import MediaPickerModal from "../components/MediaPickerModal";

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [images, setImages] = useState([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    metal: "925 Sterling Silver",
    gender: "Women",
    categoryId: "",
    subcategoryId: "",
    status: "published",
    stockQuantity: "10",
  });

  // Load categories and subcategories
  useEffect(() => {
    async function loadMeta() {
      try {
        setLoadingMetadata(true);
        setErrorMessage("");

        // 1. Load Categories
        let catList = [];
        try {
          const res = await categoryApi.getCategories({ limit: 100 });
          if (res?.data && res.data.length > 0) catList = res.data;
        } catch {
          const pubRes = await storefrontApi.getCategories({ limit: 100 });
          if (pubRes?.data) catList = pubRes.data;
        }
        setCategories(catList);

        // 2. Load Subcategories
        let subList = [];
        try {
          const subRes = await subcategoryApi.getSubcategories({ limit: 200 });
          if (subRes?.data) subList = subRes.data;
        } catch (err) {
          console.warn("Failed to load subcategories:", err);
        }
        setAllSubcategories(subList);

        // Preselect first category if none selected
        if (catList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            categoryId: prev.categoryId || catList[0].id,
          }));
        }
      } catch (err) {
        console.error("Failed to load metadata for AddProduct:", err);
        setErrorMessage("Failed to load categories. Please refresh the page.");
      } finally {
        setLoadingMetadata(false);
      }
    }
    loadMeta();
  }, []);

  // Filter subcategories for selected category
  const availableSubcategories = allSubcategories.filter(
    (sub) => sub.categoryId === formData.categoryId
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
  };

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoryId: newCatId,
      subcategoryId: "", // Reset subcategory when category changes
    }));
    setErrorMessage("");
  };

  /* =========================================================
     IMAGE HANDLING
     ========================================================= */

  const handleImageSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingMedia(true);
      for (const file of files) {
        const response = await mediaApi.uploadMedia(file, {
          title: formData.name || file.name.replace(/\.[^/.]+$/, ""),
          altText: formData.name || file.name,
        });
        const media = response?.data || response;
        setImages((prev) => [
          ...prev,
          {
            id: media.id,
            mediaAssetId: media.id,
            name: media.title || media.fileName,
            url: media.url,
            altText: media.altText || formData.name || "",
            sortOrder: prev.length,
            isPrimary: prev.length === 0,
          },
        ]);
      }
    } catch (err) {
      alert("Failed to upload image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingMedia(false);
      event.target.value = "";
    }
  };

  const handleMediaPickerSelect = (selectedAssets) => {
    const assets = Array.isArray(selectedAssets) ? selectedAssets : [selectedAssets].filter(Boolean);
    setImages((prev) => {
      const existingIds = new Set(prev.map((img) => img.mediaAssetId || img.id));
      const newItems = assets
        .filter((asset) => !existingIds.has(asset.id))
        .map((asset, idx) => ({
          id: asset.id,
          mediaAssetId: asset.id,
          name: asset.title || asset.fileName,
          url: asset.url,
          altText: asset.altText || formData.name || "",
          sortOrder: prev.length + idx,
          isPrimary: prev.length === 0 && idx === 0,
        }));
      return [...prev, ...newItems];
    });
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((image) => image.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered.map((img, idx) => ({ ...img, sortOrder: idx }));
    });
  };

  const setPrimaryImage = (index) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  /* =========================================================
     SAVE PRODUCT
     ========================================================= */

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    if (!formData.sku.trim()) {
      setErrorMessage("Product ID (SKU) is required.");
      return;
    }

    if (!formData.categoryId) {
      setErrorMessage("Category is compulsory. Please select a category.");
      return;
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setErrorMessage("Please enter a valid product price.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description?.trim() || null,
        price: Number(formData.price),
        material: formData.metal?.trim() || null,
        metal: formData.metal?.trim() || null,
        gender: formData.gender?.trim() || null,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategory || formData.subcategoryId || null,
        status: (formData.status || "published").toUpperCase(),
        stockQuantity: Number(formData.stockQuantity || 10),
        images: images.map((img, idx) => ({
          url: img.url,
          mediaAssetId: img.mediaAssetId || null,
          altText: img.altText || formData.name || null,
          sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : idx,
          isPrimary: Boolean(img.isPrimary),
        })),
      };

      await productApi.createProduct(payload);
      alert("Product created successfully!");
      navigate("/admin/products");
    } catch (apiErr) {
      console.error("Product creation failed:", apiErr);
      setErrorMessage(apiErr.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-page">
      {/* Header */}
      <div className="add-product-header">
        <div>
          <Link to="/admin/products" className="back-link">
            <ArrowLeft size={16} />
            Back to Products
          </Link>
          <p className="eyebrow">CATALOGUE / PRODUCTS</p>
          <h1>Add Product</h1>
          <p>Create a new jewellery product for the ASH Jewellery catalogue.</p>
        </div>

        <div className="add-product-actions">
          <button
            type="button"
            className="primary-action cursor-pointer"
            onClick={handleSaveProduct}
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
                Save Product
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded text-red-200 text-sm">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSaveProduct} className="add-product-layout">
        {/* ================= LEFT MAIN COLUMN ================= */}
        <div className="product-form-main">
          {/* Card 1: Product Specifications */}
          <section className="form-card">
            <div className="form-card-header">
              <div>
                <span className="form-section-label">01</span>
                <h2>Product Details</h2>
                <p>Provide the essential details for this jewellery piece.</p>
              </div>
            </div>

            <div className="form-grid">
              {/* Product Name */}
              <div className="form-field full-width">
                <label>
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Traditional Silver Filigree Bangle"
                  required
                />
              </div>

              {/* Product ID (SKU) */}
              <div className="form-field">
                <label>
                  Product ID (SKU) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. ASH-BNG-001"
                  required
                />
              </div>

              {/* Price */}
              <div className="form-field">
                <label>
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="input-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    required
                  />
                </div>
              </div>

              {/* Metal */}
              <div className="form-field">
                <label>Metal / Material</label>
                <select
                  name="metal"
                  value={formData.metal}
                  onChange={handleChange}
                >
                  <option value="925 Sterling Silver">925 Sterling Silver</option>
                  <option value="Oxidised 925 Silver">Oxidised 925 Silver</option>
                  <option value="18K Gold Plated Silver">18K Gold Plated Silver</option>
                  <option value="Rose Gold Plated Silver">Rose Gold Plated Silver</option>
                  <option value="Pure Silver (999)">Pure Silver (999)</option>
                  <option value="Silver with Gemstones">Silver with Gemstones</option>
                </select>
              </div>

              {/* Gender */}
              <div className="form-field">
                <label>
                  Gender <span className="text-xs text-[#8a7f72] font-normal">(Admin classification - hidden from user)</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              {/* Description */}
              <div className="form-field full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Handcrafted authentic silver design, detailed with intricate filigree work..."
                />
              </div>
            </div>
          </section>

          {/* Card 2: Media & Images */}
          <section className="form-card">
            <div className="form-card-header">
              <div>
                <span className="form-section-label">02</span>
                <h2>Product Images</h2>
                <p>Upload clean product imagery on luxury backgrounds.</p>
              </div>
            </div>

            <div className="upload-area">
              <Upload size={24} className="text-[#b99657] mb-2" />
              <h3>Upload product images</h3>
              <p>JPG, PNG, WEBP • Click to upload or select from media library</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                multiple
                hidden
                onChange={handleImageSelect}
              />

              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  className="bg-[#211f1b] hover:bg-black text-white text-xs font-semibold px-4 py-2 uppercase tracking-wider cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                >
                  {uploadingMedia ? "Uploading..." : "Upload from Computer"}
                </button>
                <button
                  type="button"
                  className="border border-[#b99657] text-[#b99657] hover:bg-[#b99657]/10 text-xs font-semibold px-4 py-2 uppercase tracking-wider cursor-pointer"
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  Choose from Media Library
                </button>
              </div>
            </div>

            {/* Selected Images Gallery */}
            {images.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#b99657]">
                  Selected Images ({images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={`relative group border p-2 rounded bg-[#181614] ${
                        img.isPrimary ? "border-[#b99657]" : "border-[#383531]"
                      }`}
                    >
                      <div className="aspect-square overflow-hidden bg-black/40 rounded flex items-center justify-center">
                        <img
                          src={img.url}
                          alt={img.altText || "Product preview"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        {img.isPrimary ? (
                          <span className="text-[#b99657] font-semibold flex items-center gap-1">
                            <Star size={11} fill="currentColor" /> Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className="text-[#8a8277] hover:text-[#b99657] cursor-pointer"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="product-form-sidebar">
          {/* Card 1: Catalogue Organization */}
          <section className="side-form-card">
            <div className="side-card-title flex items-center gap-2">
              <FolderTree size={16} className="text-[#b99657]" />
              <h3>Catalogue Placement</h3>
            </div>

            <div className="side-fields space-y-4">
              {/* Category (Compulsory) */}
              <div className="form-field">
                <label className="font-semibold text-xs text-[#f5f5f4] flex items-center justify-between">
                  <span>Category <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-[#b99657] font-normal uppercase">Compulsory</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  required
                  className="w-full mt-1.5 p-2 bg-[#181614] border border-[#383531] text-[#f5f5f4] rounded text-sm focus:border-[#b99657] outline-none"
                >
                  <option value="">-- Select Category (Required) --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && !loadingMetadata && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    No categories found. Please add a category first.
                  </p>
                )}
              </div>

              {/* Subcategory (Optional, dependent on category) */}
              <div className="form-field">
                <label className="font-semibold text-xs text-[#f5f5f4] flex items-center justify-between">
                  <span>Subcategory</span>
                  <span className="text-[10px] text-[#8a8277] font-normal uppercase">Optional</span>
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory || formData.subcategoryId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: val,
                      subcategoryId: val,
                    }));
                  }}
                  disabled={!formData.categoryId || availableSubcategories.length === 0}
                  className="w-full mt-1.5 p-2 bg-[#181614] border border-[#383531] text-[#f5f5f4] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:border-[#b99657] outline-none"
                >
                  <option value="">
                    {!formData.categoryId
                      ? "-- Select category first --"
                      : availableSubcategories.length === 0
                      ? "-- No subcategories for this category --"
                      : "-- Select Subcategory (Optional) --"}
                  </option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {formData.categoryId && availableSubcategories.length === 0 && (
                  <p className="text-[11px] text-[#8a8277] mt-1">
                    No subcategory under this category. Subcategory is optional.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Card 2: Publishing & Status */}
          <section className="side-form-card">
            <div className="side-card-title">
              <h3>Publishing Status</h3>
            </div>

            <div className="publish-options space-y-2">
              <label className="publish-option cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === "published"}
                  onChange={handleChange}
                />
                <div>
                  <strong>Published</strong>
                  <span>Visible on customer storefront</span>
                </div>
              </label>

              <label className="publish-option cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === "draft"}
                  onChange={handleChange}
                />
                <div>
                  <strong>Draft</strong>
                  <span>Hidden from storefront</span>
                </div>
              </label>
            </div>
          </section>
        </aside>
      </form>

      {/* Central Media Library Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleMediaPickerSelect}
          multiple={true}
        />
      )}
    </div>
  );
}