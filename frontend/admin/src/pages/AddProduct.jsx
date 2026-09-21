import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    productType: "",
    shortDescription: "",
    description: "",

    price: "",
    comparePrice: "",
    taxRate: "",

    stockQuantity: "",
    lowStockThreshold: "5",
    stockStatus: "in-stock",

    category: "",
    subcategory: "",
    collection: "",

    material: "",
    colour: "",
    finish: "",

    metaTitle: "",
    metaDescription: "",
    slug: "",

    status: "draft",

    tags: ["Heritage", "Gold"],
  });

  /* =========================================================
     INPUT HANDLER
     ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     IMAGE HANDLER
     ========================================================= */

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        setImages((previous) => [
          ...previous,
          {
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            name: file.name,
            url: reader.result,
          },
        ]);
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const removeImage = (id) => {
    setImages((previous) =>
      previous.filter((image) => image.id !== id)
    );
  };

  /* =========================================================
     SAVE PRODUCT
     ========================================================= */

  const handleSaveProduct = () => {
    if (!formData.name.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!formData.sku.trim()) {
      alert("Please enter a SKU.");
      return;
    }

    if (!formData.price) {
      alert("Please enter a product price.");
      return;
    }

    const existingProducts =
      JSON.parse(localStorage.getItem("ashProducts")) || [];

    const newProduct = {
      id: Date.now(),

      name: formData.name,
      sku: formData.sku,
      productType: formData.productType,

      shortDescription: formData.shortDescription,
      description: formData.description,

      price: Number(formData.price),
      comparePrice: Number(formData.comparePrice || 0),
      taxRate: Number(formData.taxRate || 0),

      stockQuantity: Number(
        formData.stockQuantity || 0
      ),

      lowStockThreshold: Number(
        formData.lowStockThreshold || 5
      ),

      stockStatus: formData.stockStatus,

      category: formData.category,
      subcategory: formData.subcategory,
      collection: formData.collection,

      material: formData.material,
      colour: formData.colour,
      finish: formData.finish,

      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      slug: formData.slug,

      status: formData.status,

      tags: formData.tags,

      images: images,

      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "ashProducts",
      JSON.stringify([
        ...existingProducts,
        newProduct,
      ])
    );

    alert("Product saved successfully!");

    navigate("/products");
  };

  /* =========================================================
     TAG HANDLER
     ========================================================= */

  const removeTag = (tagToRemove) => {
    setFormData((previous) => ({
      ...previous,

      tags: previous.tags.filter(
        (tag) => tag !== tagToRemove
      ),
    }));
  };

  return (
    <div className="add-product-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="add-product-header">

        <div>

          <Link
            to="/products"
            className="back-link"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <p className="eyebrow">
            CATALOGUE / PRODUCTS
          </p>

          <h1>Add Product</h1>

          <p>
            Create a new jewellery product for the ASH Jewellery
            catalogue.
          </p>

        </div>

        <div className="add-product-actions">

          <button
            type="button"
            className="secondary-action"
          >
            <Eye size={16} />
            Preview
          </button>

          <button
            type="button"
            className="primary-action"
            onClick={handleSaveProduct}
          >
            <Save size={16} />
            Save Product
          </button>

        </div>

      </div>

      <div className="add-product-layout">

        {/* =====================================================
            LEFT COLUMN
        ===================================================== */}

        <div className="product-form-main">

          {/* BASIC INFORMATION */}

          <section className="form-card">

            <div className="form-card-header">

              <div>
                <span className="form-section-label">
                  01
                </span>

                <h2>Basic Information</h2>

                <p>
                  Enter the primary information for this product.
                </p>
              </div>

            </div>

            <div className="form-grid">

              <div className="form-field full-width">

                <label>
                  Product Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Heritage Gold Necklace"
                />

              </div>

              <div className="form-field">

                <label>
                  SKU <span>*</span>
                </label>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. ASH-NK-001"
                />

              </div>

              <div className="form-field">

                <label>
                  Product Type
                </label>

                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                >
                  <option value="">
                    Select type
                  </option>

                  <option value="physical">
                    Physical Product
                  </option>

                  <option value="made-to-order">
                    Made to Order
                  </option>
                </select>

              </div>

              <div className="form-field full-width">

                <label>
                  Short Description
                </label>

                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder="A short description of the jewellery..."
                />

              </div>

              <div className="form-field full-width">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Write a detailed description of the product..."
                />

              </div>

            </div>

          </section>

          {/* MEDIA */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  02
                </span>

                <h2>Product Media</h2>

                <p>
                  Add the product images customers will see.
                </p>

              </div>

            </div>

            <div className="upload-area">

              <Upload size={25} />

              <h3>
                Upload product images
              </h3>

              <p>
                Drag and drop images here, or click to browse.
              </p>

              <span>
                JPG, PNG or WEBP • Recommended 1200 × 1200px
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                hidden
                onChange={handleImageSelect}
              />

              <button
                type="button"
                className="upload-button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <Plus size={15} />
                Add Image
              </button>

            </div>

            {images.length > 0 && (

              <div className="uploaded-images">

                {images.map((image) => (

                  <div
                    className="uploaded-image"
                    key={image.id}
                  >

                    <div className="image-preview">

                      <img
                        src={image.url}
                        alt={image.name}
                      />

                    </div>

                    <div className="uploaded-image-info">

                      <span>
                        {image.name}
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(image.id)
                      }
                      className="remove-image-btn"
                    >
                      <X size={14} />
                    </button>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* PRICING */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  03
                </span>

                <h2>Pricing</h2>

                <p>
                  Set the product price and tax information.
                </p>

              </div>

            </div>

            <div className="form-grid three-columns">

              <div className="form-field">

                <label>
                  Price <span>*</span>
                </label>

                <div className="input-prefix">

                  <span>₹</span>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />

                </div>

              </div>

              <div className="form-field">

                <label>
                  Compare-at Price
                </label>

                <div className="input-prefix">

                  <span>₹</span>

                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                  />

                </div>

              </div>

              <div className="form-field">

                <label>
                  Tax Rate
                </label>

                <div className="input-suffix">

                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleChange}
                    placeholder="0"
                  />

                  <span>%</span>

                </div>

              </div>

            </div>

          </section>

          {/* INVENTORY */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  04
                </span>

                <h2>Inventory</h2>

                <p>
                  Manage stock information for this product.
                </p>

              </div>

            </div>

            <div className="form-grid three-columns">

              <div className="form-field">

                <label>
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="0"
                />

              </div>

              <div className="form-field">

                <label>
                  Low Stock Threshold
                </label>

                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="5"
                />

              </div>

              <div className="form-field">

                <label>
                  Stock Status
                </label>

                <select
                  name="stockStatus"
                  value={formData.stockStatus}
                  onChange={handleChange}
                >
                  <option value="in-stock">
                    In Stock
                  </option>

                  <option value="low-stock">
                    Low Stock
                  </option>

                  <option value="out-of-stock">
                    Out of Stock
                  </option>
                </select>

              </div>

            </div>

          </section>

          {/* VARIANTS */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  05
                </span>

                <h2>Variants</h2>

                <p>
                  Add different options such as size or finish.
                </p>

              </div>

              <button
                type="button"
                className="small-outline-btn"
              >
                <Plus size={14} />
                Add Variant
              </button>

            </div>

            <div className="variant-empty">

              <div>
                <Plus size={22} />
              </div>

              <h3>
                No variants added
              </h3>

              <p>
                Add variants if this product is available in
                different sizes, finishes or other options.
              </p>

            </div>

          </section>

          {/* SEO */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  06
                </span>

                <h2>SEO</h2>

                <p>
                  Optimize how this product appears in search engines.
                </p>

              </div>

            </div>

            <div className="form-grid">

              <div className="form-field full-width">

                <label>
                  Meta Title
                </label>

                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="Heritage Gold Necklace | ASH Jewellery"
                />

              </div>

              <div className="form-field full-width">

                <label>
                  Meta Description
                </label>

                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe this product for search engines..."
                />

              </div>

              <div className="form-field full-width">

                <label>
                  URL Slug
                </label>

                <div className="slug-input">

                  <span>
                    /products/
                  </span>

                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="heritage-gold-necklace"
                  />

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* =====================================================
            RIGHT SIDEBAR
        ===================================================== */}

        <aside className="product-form-sidebar">

          {/* PUBLISHING */}

          <section className="side-form-card">

            <div className="side-card-title">
              <h3>
                Publishing
              </h3>
            </div>

            <div className="publish-options">

              <label className="publish-option">

                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === "draft"}
                  onChange={handleChange}
                />

                <div>
                  <strong>
                    Draft
                  </strong>

                  <span>
                    Save without publishing
                  </span>
                </div>

              </label>

              <label className="publish-option">

                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === "published"}
                  onChange={handleChange}
                />

                <div>
                  <strong>
                    Published
                  </strong>

                  <span>
                    Visible on the storefront
                  </span>
                </div>

              </label>

            </div>

          </section>

          {/* CATALOGUE */}

          <section className="side-form-card">

            <div className="side-card-title">
              <h3>
                Catalogue
              </h3>
            </div>

            <div className="side-fields">

              <div className="form-field">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">
                    Select category
                  </option>

                  <option value="necklaces">
                    Necklaces
                  </option>

                  <option value="earrings">
                    Earrings
                  </option>

                  <option value="bangles">
                    Bangles
                  </option>

                  <option value="rings">
                    Rings
                  </option>

                  <option value="chains">
                    Chains
                  </option>

                  <option value="anklets">
                    Anklets
                  </option>
                </select>

              </div>

              <div className="form-field">

                <label>
                  Subcategory
                </label>

                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  <option value="">
                    Select subcategory
                  </option>

                  <option value="temple">
                    Temple
                  </option>

                  <option value="heritage">
                    Heritage
                  </option>

                  <option value="traditional">
                    Traditional
                  </option>

                  <option value="contemporary">
                    Contemporary
                  </option>

                </select>

              </div>

              <div className="form-field">

                <label>
                  Collection
                </label>

                <select
                  name="collection"
                  value={formData.collection}
                  onChange={handleChange}
                >
                  <option value="">
                    Select collection
                  </option>

                  <option value="heritage">
                    Heritage Collection
                  </option>

                  <option value="festive">
                    Festive Collection
                  </option>

                  <option value="everyday">
                    Everyday Collection
                  </option>

                </select>

              </div>

            </div>

          </section>

          {/* ATTRIBUTES */}

          <section className="side-form-card">

            <div className="side-card-title">
              <h3>
                Attributes
              </h3>
            </div>

            <div className="side-fields">

              <div className="form-field">

                <label>
                  Material
                </label>

                <select
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                >
                  <option value="">
                    Select material
                  </option>

                  <option value="gold">
                    Gold
                  </option>

                  <option value="silver">
                    Silver
                  </option>

                  <option value="diamond">
                    Diamond
                  </option>

                  <option value="gold-plated">
                    Gold Plated
                  </option>

                </select>

              </div>

              <div className="form-field">

                <label>
                  Colour
                </label>

                <select
                  name="colour"
                  value={formData.colour}
                  onChange={handleChange}
                >
                  <option value="">
                    Select colour
                  </option>

                  <option value="gold">
                    Gold
                  </option>

                  <option value="silver">
                    Silver
                  </option>

                  <option value="rose-gold">
                    Rose Gold
                  </option>

                </select>

              </div>

              <div className="form-field">

                <label>
                  Finish
                </label>

                <select
                  name="finish"
                  value={formData.finish}
                  onChange={handleChange}
                >
                  <option value="">
                    Select finish
                  </option>

                  <option value="polished">
                    Polished
                  </option>

                  <option value="matte">
                    Matte
                  </option>

                  <option value="antique">
                    Antique
                  </option>

                </select>

              </div>

            </div>

          </section>

          {/* TAGS */}

          <section className="side-form-card">

            <div className="side-card-title">
              <h3>
                Tags
              </h3>
            </div>

            <div className="selected-tags">

              {formData.tags.map((tag) => (

                <span key={tag}>

                  {tag}

                  <X
                    size={11}
                    onClick={() =>
                      removeTag(tag)
                    }
                  />

                </span>

              ))}

            </div>

          </section>

          {/* DANGER */}

          <section className="side-form-card danger-card">

            <div className="side-card-title">
              <h3>
                Danger Zone
              </h3>
            </div>

            <p>
              Product deletion cannot be undone.
            </p>

            <button
              type="button"
              className="delete-product-btn"
            >
              <Trash2 size={14} />
              Delete Product
            </button>

          </section>

        </aside>

      </div>

    </div>
  );
}