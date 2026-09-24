import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Star,
  Loader2,
  FolderTree,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { productApi } from "@/lib/api/productApi";
import { categoryApi } from "@/lib/api/categoryApi";
import { subcategoryApi } from "@/lib/api/subcategoryApi";
import { storefrontApi } from "@/lib/api/storefrontApi";
import { mediaApi } from "@/lib/api/mediaApi";
import MediaPickerModal from "../components/MediaPickerModal";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    finish: "",
    gender: "Women",
    categoryId: "",
    subcategoryId: "",
    status: "published",
    stockQuantity: "0",
    isBestSeller: false,
    isNewArrival: false,
    isFeatured: false,
    isTrending: false,
    displayPriority: "0",
    newArrivalUntil: "",
  });

  // Load product, categories and subcategories
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage("");

        // 1. Load Categories
        let catList = [];
        try {
          const catRes = await categoryApi.getCategories({ limit: 100 });
          if (catRes?.data) catList = catRes.data;
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

        // 3. Load Product
        const res = await productApi.getProductById(id);
        const prod = res?.data || res;
        if (!prod || !prod.id) {
          alert("Product not found.");
          navigate("/admin/products");
          return;
        }

        const productImages = Array.isArray(prod.images) ? prod.images : [];
        setImages(
          productImages.map((img, idx) => ({
            id: img.id || `img-${idx}`,
            mediaAssetId: img.mediaAssetId || null,
            name: img.altText || prod.name,
            url: img.url,
            altText: img.altText || prod.name || "",
            sortOrder: img.sortOrder ?? idx,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0,
          }))
        );

        let formattedDate = "";
        if (prod.newArrivalUntil) {
          try {
            formattedDate = new Date(prod.newArrivalUntil).toISOString().split("T")[0];
          } catch {
            formattedDate = "";
          }
        }

        setFormData({
          name: prod.name || "",
          sku: prod.sku || "",
          description: prod.description || "",
          price: String(prod.price ?? ""),
          metal: prod.material || "925 Sterling Silver",
          finish: prod.finish || "",
          gender: prod.gender || "Women",
          categoryId: prod.categoryId || prod.category?.id || "",
          subcategoryId: prod.subcategoryId || prod.subcategory?.id || "",
          status: (prod.status || "published").toLowerCase(),
          stockQuantity: String(prod.stockQuantity ?? 0),
          isBestSeller: Boolean(prod.isBestSeller),
          isNewArrival: Boolean(prod.isNewArrival),
          isFeatured: Boolean(prod.isFeatured),
          isTrending: Boolean(prod.isTrending),
          displayPriority: String(prod.displayPriority ?? 0),
          newArrivalUntil: formattedDate,
        });
      } catch (err) {
        console.error("Failed to load product data:", err);
        setErrorMessage(err.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id, navigate]);

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

  const removeImage = (idToRemove) => {
    setImages((prev) => {
      const filtered = prev.filter((image) => image.id !== idToRemove);
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
        finish: formData.finish?.trim() || null,
        gender: formData.gender?.trim() || null,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || null,
        status: (formData.status || "published").toUpperCase(),
        stockQuantity: Number(formData.stockQuantity !== "" && !isNaN(Number(formData.stockQuantity)) ? formData.stockQuantity : 0),
        isBestSeller: Boolean(formData.isBestSeller),
        isNewArrival: Boolean(formData.isNewArrival),
        isFeatured: Boolean(formData.isFeatured),
        isTrending: Boolean(formData.isTrending),
        displayPriority: Number(formData.displayPriority || 0),
        newArrivalUntil: formData.isNewArrival && formData.newArrivalUntil ? formData.newArrivalUntil : null,
        images: images.map((img, idx) => ({
          url: img.url,
          mediaAssetId: img.mediaAssetId || null,
          altText: img.altText || formData.name || null,
          sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : idx,
          isPrimary: Boolean(img.isPrimary),
        })),
      };

      await productApi.updateProduct(id, payload);
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (apiErr) {
      console.error("Product update failed:", apiErr);
      setErrorMessage(apiErr.message || "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     DELETE PRODUCT
     ========================================================= */

  const handleDeleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await productApi.deleteProduct(id);
      alert("Product deleted successfully.");
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert(err.message || "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#b99657]" />
      </div>
    );
  }

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
          <h1>Edit Product</h1>
          <p>Update details, categories, pricing, and images for this piece.</p>
        </div>

        <div className="add-product-actions flex items-center gap-3">
          <button
            type="button"
            className="text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            onClick={handleDeleteProduct}
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>

          <button
            type="button"
            className="primary-action cursor-pointer"
            onClick={handleSaveProduct}
            disabled={isSubmitting || isDeleting}
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

              {/* Finish */}
              <div className="form-field">
                <label>Finish (Optional)</label>
                <input
                  type="text"
                  name="finish"
                  list="finish-options"
                  value={formData.finish}
                  onChange={handleChange}
                  placeholder="e.g. Antique Silver, High Polish, Oxidised..."
                />
                <datalist id="finish-options">
                  <option value="Antique Silver" />
                  <option value="High Polish Silver" />
                  <option value="Oxidised Silver" />
                  <option value="Matte / Brushed Silver" />
                  <option value="18K Gold Plated" />
                  <option value="Rose Gold Plated" />
                  <option value="Dual Tone Silver" />
                </datalist>
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

          {/* Card 3: Homepage Merchandising */}
          <section className="form-card">
            <div className="form-card-header">
              <div>
                <span className="form-section-label">03</span>
                <h2>Homepage Merchandising</h2>
                <p>Controls where this product appears on dynamic homepage sections.</p>
              </div>
            </div>

            <div className="form-grid">
              {/* Merchandising Checkboxes Grid */}
              <div className="form-field full-width">
                <label className="text-xs uppercase tracking-wider text-[#b99657] font-semibold mb-3 block">
                  Featured Sections
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Best Seller */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    formData.isBestSeller ? "border-[#b99657] bg-[#b99657]/10" : "border-[#383531] bg-[#181614] hover:border-[#4d4842]"
                  }`}>
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="mt-1 accent-[#b99657] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <strong className="block text-sm text-[#f5f5f4] font-medium">Best Seller</strong>
                      <span className="text-[11px] text-[#8a8277]">Appear in Best Sellers section</span>
                    </div>
                  </label>

                  {/* New Arrival */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    formData.isNewArrival ? "border-[#b99657] bg-[#b99657]/10" : "border-[#383531] bg-[#181614] hover:border-[#4d4842]"
                  }`}>
                    <input
                      type="checkbox"
                      name="isNewArrival"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                      className="mt-1 accent-[#b99657] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <strong className="block text-sm text-[#f5f5f4] font-medium">New Arrival</strong>
                      <span className="text-[11px] text-[#8a8277]">Appear in New Arrivals section</span>
                    </div>
                  </label>

                  {/* Featured */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    formData.isFeatured ? "border-[#b99657] bg-[#b99657]/10" : "border-[#383531] bg-[#181614] hover:border-[#4d4842]"
                  }`}>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="mt-1 accent-[#b99657] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <strong className="block text-sm text-[#f5f5f4] font-medium">Featured</strong>
                      <span className="text-[11px] text-[#8a8277]">Appear in Featured section</span>
                    </div>
                  </label>

                  {/* Trending */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    formData.isTrending ? "border-[#b99657] bg-[#b99657]/10" : "border-[#383531] bg-[#181614] hover:border-[#4d4842]"
                  }`}>
                    <input
                      type="checkbox"
                      name="isTrending"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))}
                      className="mt-1 accent-[#b99657] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <strong className="block text-sm text-[#f5f5f4] font-medium">Trending</strong>
                      <span className="text-[11px] text-[#8a8277]">Appear in Trending section</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Display Priority */}
              <div className="form-field">
                <label htmlFor="displayPriority" className="font-semibold text-xs text-[#f5f5f4]">
                  Display Priority
                </label>
                <input
                  id="displayPriority"
                  type="number"
                  name="displayPriority"
                  value={formData.displayPriority}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full mt-1.5 p-2 bg-[#181614] border border-[#383531] text-[#f5f5f4] rounded text-sm focus:border-[#b99657] outline-none"
                />
                <p className="text-[11px] text-[#8a8277] mt-1">
                  Higher numbers appear first in homepage sections (e.g. 10 before 1). Defaults to 0.
                </p>
              </div>

              {/* New Arrival Until */}
              <div className="form-field">
                <label htmlFor="newArrivalUntil" className="font-semibold text-xs text-[#f5f5f4] flex items-center justify-between">
                  <span>New Arrival Until</span>
                  {!formData.isNewArrival && (
                    <span className="text-[10px] text-[#8a8277] font-normal uppercase">Only if New Arrival enabled</span>
                  )}
                </label>
                <input
                  id="newArrivalUntil"
                  type="date"
                  name="newArrivalUntil"
                  value={formData.newArrivalUntil || ""}
                  onChange={handleChange}
                  disabled={!formData.isNewArrival}
                  className="w-full mt-1.5 p-2 bg-[#181614] border border-[#383531] text-[#f5f5f4] rounded text-sm focus:border-[#b99657] outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <p className="text-[11px] text-[#8a8277] mt-1">
                  Optional expiry date. After this date passes, the product automatically stops appearing in New Arrivals. Leave empty for indefinite.
                </p>
              </div>
            </div>
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
              </div>

              {/* Subcategory (Optional, dependent on category) */}
              <div className="form-field">
                <label className="font-semibold text-xs text-[#f5f5f4] flex items-center justify-between">
                  <span>Subcategory</span>
                  <span className="text-[10px] text-[#8a8277] font-normal uppercase">Optional</span>
                </label>
                <select
                  name="subcategoryId"
                  value={formData.subcategoryId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
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