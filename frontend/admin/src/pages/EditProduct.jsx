import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ImagePlus,
  X,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

/* =========================================================
   EMPTY PRODUCT
========================================================= */

const emptyProduct = {
  name: "",
  sku: "",
  productType: "",
  shortDescription: "",
  description: "",

  price: "",
  comparePrice: "",
  taxRate: "",

  stockQuantity: "",
  lowStockThreshold: "",
  stockStatus: "In Stock",

  category: "",
  subcategory: "",
  collection: "",

  material: "",
  colour: "",
  finish: "",

  metaTitle: "",
  metaDescription: "",
  slug: "",

  status: "Draft",

  tags: [],
  images: [],
};


/* =========================================================
   DEMO PRODUCTS

   These are only used when the product exists on the
   Products page but has not yet been saved to localStorage.
========================================================= */

const demoProducts = [
  {
    id: "demo-1",

    name: "Heritage Gold Necklace",

    sku: "ASH-NK-001",

    productType: "Necklace",

    shortDescription:
      "A timeless heritage-inspired jewellery piece.",

    description:
      "Beautifully crafted jewellery inspired by traditional Indian heritage.",

    price: "24500",

    comparePrice: "",

    taxRate: "",

    stockQuantity: "12",

    lowStockThreshold: "5",

    stockStatus: "In Stock",

    category: "Necklaces",

    subcategory: "Heritage",

    collection: "Heritage",

    material: "Gold",

    colour: "Gold",

    finish: "Polished",

    metaTitle: "Heritage Gold Necklace | ASH Jewellery",

    metaDescription:
      "Shop the Heritage Gold Necklace from ASH Jewellery.",

    slug: "heritage-gold-necklace",

    status: "Published",

    tags: [
      "Heritage",
      "Gold",
    ],

    images: [],

    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
  },

  {
    id: "demo-2",

    name: "Classic Temple Jhumka",

    sku: "ASH-EA-014",

    productType: "Earrings",

    shortDescription:
      "Classic temple-inspired jhumka earrings.",

    description:
      "Traditional jhumka earrings designed with a timeless temple aesthetic.",

    price: "8900",

    comparePrice: "",

    taxRate: "",

    stockQuantity: "20",

    lowStockThreshold: "5",

    stockStatus: "In Stock",

    category: "Earrings",

    subcategory: "Temple",

    collection: "Classic",

    material: "Gold",

    colour: "Gold",

    finish: "Antique",

    metaTitle: "Classic Temple Jhumka | ASH Jewellery",

    metaDescription:
      "Classic temple jhumka earrings from ASH Jewellery.",

    slug: "classic-temple-jhumka",

    status: "Published",

    tags: [
      "Temple",
      "Jhumka",
    ],

    images: [],

    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
  },

  {
    id: "demo-3",

    name: "Traditional Silver Bangle",

    sku: "ASH-BG-008",

    productType: "Bangles",

    shortDescription:
      "Traditional silver bangle with heritage detailing.",

    description:
      "A handcrafted silver bangle inspired by traditional Indian jewellery.",

    price: "6750",

    comparePrice: "",

    taxRate: "",

    stockQuantity: "15",

    lowStockThreshold: "5",

    stockStatus: "In Stock",

    category: "Bangles",

    subcategory: "Traditional",

    collection: "Heritage",

    material: "925 Silver",

    colour: "Silver",

    finish: "Polished",

    metaTitle:
      "Traditional Silver Bangle | ASH Jewellery",

    metaDescription:
      "Traditional silver bangle from ASH Jewellery.",

    slug: "traditional-silver-bangle",

    status: "Draft",

    tags: [
      "Silver",
      "Traditional",
    ],

    images: [],

    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
  },

  {
    id: "demo-4",

    name: "Pearl Drop Earrings",

    sku: "ASH-EA-021",

    productType: "Earrings",

    shortDescription:
      "Elegant pearl drop earrings for modern occasions.",

    description:
      "Elegant pearl earrings combining classic design with a contemporary look.",

    price: "5200",

    comparePrice: "",

    taxRate: "",

    stockQuantity: "4",

    lowStockThreshold: "5",

    stockStatus: "Low Stock",

    category: "Earrings",

    subcategory: "Contemporary",

    collection: "Timeless",

    material: "Silver",

    colour: "Silver",

    finish: "Polished",

    metaTitle:
      "Pearl Drop Earrings | ASH Jewellery",

    metaDescription:
      "Elegant pearl drop earrings from ASH Jewellery.",

    slug: "pearl-drop-earrings",

    status: "Published",

    tags: [
      "Pearl",
      "Earrings",
    ],

    images: [],

    image:
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800",
  },

  {
    id: "demo-5",

    name: "Heritage Silver Kada",

    sku: "ASH-BG-015",

    productType: "Bangles",

    shortDescription:
      "Bold heritage-inspired silver kada.",

    description:
      "A statement silver kada inspired by traditional Indian craftsmanship.",

    price: "4850",

    comparePrice: "",

    taxRate: "",

    stockQuantity: "0",

    lowStockThreshold: "5",

    stockStatus: "Out of Stock",

    category: "Bangles",

    subcategory: "Heritage",

    collection: "Heritage",

    material: "Silver",

    colour: "Silver",

    finish: "Antique",

    metaTitle:
      "Heritage Silver Kada | ASH Jewellery",

    metaDescription:
      "Heritage silver kada from ASH Jewellery.",

    slug: "heritage-silver-kada",

    status: "Archived",

    tags: [
      "Silver",
      "Heritage",
    ],

    images: [],

    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800",
  },
];


/* =========================================================
   EDIT PRODUCT
========================================================= */

export default function EditProduct() {

  const { id } = useParams();

  const navigate = useNavigate();

  const fileInputRef = useRef(null);


  const [formData, setFormData] =
    useState(emptyProduct);

  const [images, setImages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* =========================================================
     LOAD PRODUCT
  ========================================================= */

  useEffect(() => {

    const savedProducts =
      JSON.parse(
        localStorage.getItem("ashProducts")
      ) || [];


    /*
      Combine demo products with products
      already saved in localStorage.

      Saved products take priority.
    */

    const allProducts = [
      ...demoProducts,

      ...savedProducts.filter(
        (savedProduct) =>
          !demoProducts.some(
            (demoProduct) =>
              String(demoProduct.id) ===
              String(savedProduct.id)
          )
      ),
    ];


    const foundProduct =
      allProducts.find(
        (product) =>
          String(product.id) ===
          String(id)
      );


    if (!foundProduct) {

      setLoading(false);

      return;
    }


    const productImages =
      Array.isArray(foundProduct.images)
        ? foundProduct.images
        : [];


    setFormData({
      ...emptyProduct,

      ...foundProduct,

      tags:
        Array.isArray(foundProduct.tags)
          ? foundProduct.tags
          : [],

      images: productImages,
    });


    /*
      Support both:

      1. New products using images[]
      2. Older products using image
    */

    if (productImages.length > 0) {

      setImages(productImages);

    } else if (foundProduct.image) {

      setImages([
        foundProduct.image,
      ]);

    } else {

      setImages([]);
    }


    setLoading(false);

  }, [id]);


  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  function handleChange(event) {

    const {
      name,
      value,
    } = event.target;


    setFormData((previous) => ({
      ...previous,

      [name]: value,
    }));

  }


  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  function handleImageSelect(event) {

    const files =
      Array.from(
        event.target.files || []
      );


    if (files.length === 0) {
      return;
    }


    files.forEach((file) => {

      const reader =
        new FileReader();


      reader.onload = () => {

        setImages((previous) => [
          ...previous,
          reader.result,
        ]);

      };


      reader.readAsDataURL(file);

    });


    event.target.value = "";

  }


  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  function removeImage(index) {

    setImages((previous) =>
      previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

  }


  /* =========================================================
     ADD TAG
  ========================================================= */

  function addTag() {

    const tag =
      window.prompt(
        "Enter a product tag:"
      );


    if (!tag?.trim()) {
      return;
    }


    const cleanTag =
      tag.trim();


    if (
      formData.tags.includes(
        cleanTag
      )
    ) {
      return;
    }


    setFormData((previous) => ({
      ...previous,

      tags: [
        ...previous.tags,
        cleanTag,
      ],
    }));

  }


  /* =========================================================
     REMOVE TAG
  ========================================================= */

  function removeTag(tagToRemove) {

    setFormData((previous) => ({
      ...previous,

      tags:
        previous.tags.filter(
          (tag) =>
            tag !== tagToRemove
        ),
    }));

  }


  /* =========================================================
     SAVE PRODUCT
  ========================================================= */

  function handleSave() {

    /* -------------------------
       VALIDATION
    ------------------------- */

    if (!formData.name.trim()) {

      alert(
        "Please enter a product name."
      );

      return;
    }


    if (!formData.sku.trim()) {

      alert(
        "Please enter a SKU."
      );

      return;
    }


    if (!formData.price) {

      alert(
        "Please enter a product price."
      );

      return;
    }


    /* -------------------------
       EXISTING PRODUCTS
    ------------------------- */

    const savedProducts =
      JSON.parse(
        localStorage.getItem(
          "ashProducts"
        )
      ) || [];


    /* -------------------------
       PRODUCT TO SAVE
    ------------------------- */

    const updatedProduct = {

      ...formData,

      id: id,

      images,

      /*
        Keep first image available
        for the Products table.
      */

      image:
        images.length > 0
          ? images[0]
          : formData.image || "",

      updatedAt:
        new Date().toISOString(),

    };


    /* -------------------------
       CHECK IF PRODUCT EXISTS
    ------------------------- */

    const productExists =
      savedProducts.some(
        (product) =>
          String(product.id) ===
          String(id)
      );


    let updatedProducts;


    if (productExists) {

      /*
        Update existing product
      */

      updatedProducts =
        savedProducts.map(
          (product) => {

            if (
              String(product.id) !==
              String(id)
            ) {
              return product;
            }


            return updatedProduct;

          }
        );

    } else {

      /*
        Demo product has not been
        saved before.

        Add it to localStorage.
      */

      updatedProducts = [
        ...savedProducts,
        updatedProduct,
      ];

    }


    /* -------------------------
       SAVE
    ------------------------- */

    localStorage.setItem(
      "ashProducts",
      JSON.stringify(
        updatedProducts
      )
    );


    alert(
      "Product updated successfully!"
    );


    navigate("/products");

  }


  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  function handleDelete() {

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${formData.name}"?`
      );


    if (!confirmed) {
      return;
    }


    const savedProducts =
      JSON.parse(
        localStorage.getItem(
          "ashProducts"
        )
      ) || [];


    const updatedProducts =
      savedProducts.filter(
        (product) =>
          String(product.id) !==
          String(id)
      );


    localStorage.setItem(
      "ashProducts",
      JSON.stringify(
        updatedProducts
      )
    );


    navigate("/products");

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="products-empty">

        <h3>
          Loading product...
        </h3>

      </div>

    );

  }


  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (
    !formData.name &&
    !formData.sku
  ) {

    return (

      <div className="products-empty">

        <div className="products-empty-icon">

          <X size={25} />

        </div>


        <h3>
          Product not found
        </h3>


        <p>
          The product you're trying to edit
          does not exist.
        </p>


        <button
          type="button"
          className="add-product-btn"
          onClick={() =>
            navigate("/products")
          }
        >
          Back to Products
        </button>

      </div>

    );

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="add-product-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="add-product-header">

        <div>

          <button
            type="button"
            className="back-link"
            onClick={() =>
              navigate("/products")
            }
          >

            <ArrowLeft size={15} />

            Back to Products

          </button>


          <p className="eyebrow">
            CATALOGUE / PRODUCTS
          </p>


          <h1>
            Edit Product
          </h1>


          <p>
            Update your ASH Jewellery product
            details, media and catalogue information.
          </p>

        </div>


        <div className="add-product-actions">

          <button
            type="button"
            className="secondary-action"
            onClick={() =>
              navigate("/products")
            }
          >
            Cancel
          </button>


          <button
            type="button"
            className="primary-action"
            onClick={handleSave}
          >

            <Save size={15} />

            Save Changes

          </button>

        </div>

      </section>


      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="add-product-layout">


        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <main className="product-form-main">


          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  01
                </span>


                <h2>
                  Basic Information
                </h2>


                <p>
                  Update the primary information
                  for this jewellery product.
                </p>

              </div>

            </div>


            <div className="form-grid">


              {/* PRODUCT NAME */}

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


              {/* SKU */}

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


              {/* PRODUCT TYPE */}

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
                    Select product type
                  </option>

                  <option value="Necklace">
                    Necklace
                  </option>

                  <option value="Earrings">
                    Earrings
                  </option>

                  <option value="Bangles">
                    Bangles
                  </option>

                  <option value="Bracelet">
                    Bracelet
                  </option>

                  <option value="Ring">
                    Ring
                  </option>

                  <option value="Anklet">
                    Anklet
                  </option>

                  <option value="Pendant">
                    Pendant
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* SHORT DESCRIPTION */}

              <div className="form-field full-width">

                <label>
                  Short Description
                </label>


                <textarea
                  name="shortDescription"
                  value={
                    formData.shortDescription
                  }
                  onChange={handleChange}
                  placeholder="A short description of the jewellery..."
                />

              </div>


              {/* DESCRIPTION */}

              <div className="form-field full-width">

                <label>
                  Description
                </label>


                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Write a detailed description of the product..."
                />

              </div>

            </div>

          </section>


          {/* =================================================
              PRODUCT MEDIA
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  02
                </span>


                <h2>
                  Product Media
                </h2>


                <p>
                  Manage the images displayed
                  for this product.
                </p>

              </div>

            </div>


            <div className="upload-area">

              <ImagePlus size={30} />


              <h3>
                Add product images
              </h3>


              <p>
                Upload high-quality jewellery images.
              </p>


              <span>
                JPG, PNG or WEBP
              </span>


              <button
                type="button"
                className="upload-button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <Plus size={15} />

                Choose Images

              </button>


              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={
                  handleImageSelect
                }
                style={{
                  display: "none",
                }}
              />

            </div>


            {images.length > 0 && (

              <div className="uploaded-images">

                {images.map(
                  (image, index) => (

                    <div
                      className="uploaded-image"
                      key={index}
                    >

                      <div className="image-preview">

                        <img
                          src={image}
                          alt={`${formData.name} ${index + 1}`}
                        />

                      </div>


                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() =>
                          removeImage(index)
                        }
                        title="Remove image"
                      >

                        <X size={14} />

                      </button>


                      <div className="uploaded-image-info">

                        <span>
                          Product image {index + 1}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>


          {/* =================================================
              PRICING
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  03
                </span>


                <h2>
                  Pricing
                </h2>


                <p>
                  Set the selling price and tax information.
                </p>

              </div>

            </div>


            <div className="form-grid">


              <div className="form-field">

                <label>
                  Selling Price <span>*</span>
                </label>


                <div className="input-prefix">

                  <span>
                    ₹
                  </span>


                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                  />

                </div>

              </div>


              <div className="form-field">

                <label>
                  Compare-at Price
                </label>


                <div className="input-prefix">

                  <span>
                    ₹
                  </span>


                  <input
                    type="number"
                    name="comparePrice"
                    value={
                      formData.comparePrice
                    }
                    onChange={handleChange}
                    placeholder="0"
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
                    value={
                      formData.taxRate
                    }
                    onChange={handleChange}
                    placeholder="0"
                  />


                  <span>
                    %
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              INVENTORY
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  04
                </span>


                <h2>
                  Inventory
                </h2>


                <p>
                  Manage product stock and availability.
                </p>

              </div>

            </div>


            <div className="form-grid">


              <div className="form-field">

                <label>
                  Stock Quantity
                </label>


                <input
                  type="number"
                  name="stockQuantity"
                  value={
                    formData.stockQuantity
                  }
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
                  value={
                    formData.lowStockThreshold
                  }
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
                  value={
                    formData.stockStatus
                  }
                  onChange={handleChange}
                >

                  <option value="In Stock">
                    In Stock
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* =================================================
              VARIANTS
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  05
                </span>


                <h2>
                  Variants
                </h2>


                <p>
                  Add different sizes, finishes or variations.
                </p>

              </div>


              <button
                type="button"
                className="small-outline-btn"
                onClick={() =>
                  alert(
                    "Variant management will be added next."
                  )
                }
              >

                <Plus size={14} />

                Add Variant

              </button>

            </div>


            <div className="variant-empty">

              <div>
                <Plus size={19} />
              </div>


              <h3>
                No variants added
              </h3>


              <p>
                Add variants when the product is
                available in different sizes, finishes
                or other options.
              </p>

            </div>

          </section>


          {/* =================================================
              SEO
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <span className="form-section-label">
                  06
                </span>


                <h2>
                  Search Engine Optimisation
                </h2>


                <p>
                  Improve how this product appears
                  in search engines.
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
                  value={
                    formData.metaTitle
                  }
                  onChange={handleChange}
                  placeholder="Product title for search engines"
                />

              </div>


              <div className="form-field full-width">

                <label>
                  Meta Description
                </label>


                <textarea
                  name="metaDescription"
                  value={
                    formData.metaDescription
                  }
                  onChange={handleChange}
                  placeholder="Short description for search engines..."
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
                    value={
                      formData.slug
                    }
                    onChange={handleChange}
                    placeholder="heritage-gold-necklace"
                  />

                </div>

              </div>

            </div>

          </section>

        </main>


        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <aside className="product-form-sidebar">


          {/* =================================================
              PUBLISHING
          ================================================= */}

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
                  value="Draft"
                  checked={
                    formData.status ===
                    "Draft"
                  }
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
                  value="Published"
                  checked={
                    formData.status ===
                    "Published"
                  }
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


              <label className="publish-option">

                <input
                  type="radio"
                  name="status"
                  value="Archived"
                  checked={
                    formData.status ===
                    "Archived"
                  }
                  onChange={handleChange}
                />


                <div>

                  <strong>
                    Archived
                  </strong>

                  <span>
                    Hidden from the storefront
                  </span>

                </div>

              </label>

            </div>

          </section>


          {/* =================================================
              CATALOGUE
          ================================================= */}

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
                  value={
                    formData.category
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Necklaces">
                    Necklaces
                  </option>

                  <option value="Earrings">
                    Earrings
                  </option>

                  <option value="Bangles">
                    Bangles
                  </option>

                  <option value="Bracelets">
                    Bracelets
                  </option>

                  <option value="Rings">
                    Rings
                  </option>

                  <option value="Anklets">
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
                  value={
                    formData.subcategory
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select subcategory
                  </option>

                  <option value="Traditional">
                    Traditional
                  </option>

                  <option value="Contemporary">
                    Contemporary
                  </option>

                  <option value="Temple">
                    Temple
                  </option>

                  <option value="Heritage">
                    Heritage
                  </option>

                </select>

              </div>


              <div className="form-field">

                <label>
                  Collection
                </label>


                <select
                  name="collection"
                  value={
                    formData.collection
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select collection
                  </option>

                  <option value="Heritage">
                    Heritage
                  </option>

                  <option value="Timeless">
                    Timeless
                  </option>

                  <option value="Classic">
                    Classic
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* =================================================
              ATTRIBUTES
          ================================================= */}

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
                  value={
                    formData.material
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select material
                  </option>

                  <option value="925 Silver">
                    925 Silver
                  </option>

                  <option value="Gold">
                    Gold
                  </option>

                  <option value="Gold Plated">
                    Gold Plated
                  </option>

                  <option value="Silver">
                    Silver
                  </option>

                </select>

              </div>


              <div className="form-field">

                <label>
                  Colour
                </label>


                <select
                  name="colour"
                  value={
                    formData.colour
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select colour
                  </option>

                  <option value="Silver">
                    Silver
                  </option>

                  <option value="Gold">
                    Gold
                  </option>

                  <option value="Rose Gold">
                    Rose Gold
                  </option>

                  <option value="Oxidised">
                    Oxidised
                  </option>

                </select>

              </div>


              <div className="form-field">

                <label>
                  Finish
                </label>


                <select
                  name="finish"
                  value={
                    formData.finish
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select finish
                  </option>

                  <option value="Polished">
                    Polished
                  </option>

                  <option value="Matte">
                    Matte
                  </option>

                  <option value="Oxidised">
                    Oxidised
                  </option>

                  <option value="Antique">
                    Antique
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* =================================================
              TAGS
          ================================================= */}

          <section className="side-form-card">

            <div className="side-card-title">

              <h3>
                Tags
              </h3>

            </div>


            <div className="selected-tags">

              {formData.tags.length > 0 ? (

                formData.tags.map(
                  (tag) => (

                    <span key={tag}>

                      {tag}


                      <X
                        size={12}
                        onClick={() =>
                          removeTag(tag)
                        }
                      />

                    </span>

                  )
                )

              ) : (

                <span>
                  No tags added
                </span>

              )}

            </div>


            <button
              type="button"
              className="small-outline-btn"
              style={{
                margin:
                  "0 18px 18px",
              }}
              onClick={addTag}
            >

              <Plus size={14} />

              Add Tag

            </button>

          </section>


          {/* =================================================
              SAVE
          ================================================= */}

          <button
            type="button"
            className="primary-action"
            onClick={handleSave}
          >

            <Save size={15} />

            Save Changes

          </button>


          {/* =================================================
              DANGER ZONE
          ================================================= */}

          <section className="side-form-card danger-card">

            <div className="side-card-title">

              <h3>
                Danger Zone
              </h3>

            </div>


            <p>
              Permanently delete this product
              from your catalogue.
            </p>


            <button
              type="button"
              className="delete-product-btn"
              onClick={handleDelete}
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