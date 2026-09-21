import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Package,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Archive,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

/* =========================================================
   DEMO PRODUCTS
========================================================= */

const demoProducts = [
  {
    id: "demo-1",
    name: "Heritage Gold Necklace",
    sku: "ASH-NK-001",
    category: "Necklaces",
    price: "24500",
    status: "Published",
    stockStatus: "In Stock",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300",
    updatedAt: "2026-09-10T10:00:00",
  },

  {
    id: "demo-2",
    name: "Classic Temple Jhumka",
    sku: "ASH-EA-014",
    category: "Earrings",
    price: "8900",
    status: "Published",
    stockStatus: "In Stock",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300",
    updatedAt: "2026-09-09T10:00:00",
  },

  {
    id: "demo-3",
    name: "Traditional Silver Bangle",
    sku: "ASH-BG-008",
    category: "Bangles",
    price: "6750",
    status: "Draft",
    stockStatus: "In Stock",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300",
    updatedAt: "2026-09-08T10:00:00",
  },

  {
    id: "demo-4",
    name: "Pearl Drop Earrings",
    sku: "ASH-EA-021",
    category: "Earrings",
    price: "5200",
    status: "Published",
    stockStatus: "Low Stock",
    image:
      "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=300",
    updatedAt: "2026-09-07T10:00:00",
  },

  {
    id: "demo-5",
    name: "Heritage Silver Kada",
    sku: "ASH-BG-015",
    category: "Bangles",
    price: "4850",
    status: "Archived",
    stockStatus: "Out of Stock",
    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=300",
    updatedAt: "2026-09-06T10:00:00",
  },
];

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const safeStatus = status || "Draft";

  return (
    <span
      className={`product-status ${safeStatus
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="status-circle" />
      {safeStatus}
    </span>
  );
}

/* =========================================================
   STOCK BADGE
========================================================= */

function StockBadge({ stock }) {
  const safeStock = stock || "In Stock";

  return (
    <span
      className={`stock-status ${safeStock
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {safeStock}
    </span>
  );
}

/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(price) {
  if (price === undefined || price === null || price === "") {
    return "₹0";
  }

  const number = Number(
    String(price).replace(/[^\d.]/g, "")
  );

  if (Number.isNaN(number)) {
    return String(price);
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

/* =========================================================
   IMAGE
========================================================= */

function getProductImage(product) {
  if (product?.images?.length > 0) {
    return product.images[0];
  }

  return product?.image || "";
}

/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [sortOrder, setSortOrder] =
    useState("recent");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [viewProduct, setViewProduct] =
    useState(null);

  const [openMenu, setOpenMenu] =
    useState(null);

  const productsPerPage = 10;

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    const storedProducts =
      localStorage.getItem("ashProducts");

    if (storedProducts === null) {
      localStorage.setItem(
        "ashProducts",
        JSON.stringify(demoProducts)
      );

      setProducts(demoProducts);
      return;
    }

    try {
      const savedProducts =
        JSON.parse(storedProducts);

      setProducts(
        Array.isArray(savedProducts)
          ? savedProducts
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load products:",
        error
      );

      setProducts([]);
    }
  }, []);

  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    categoryFilter,
    statusFilter,
    sortOrder,
  ]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [products]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    const result = products.filter(
      (product) => {
        const name =
          product.name?.toLowerCase() || "";

        const sku =
          product.sku?.toLowerCase() || "";

        const category =
          product.category?.toLowerCase() || "";

        const matchesSearch =
          !searchText ||
          name.includes(searchText) ||
          sku.includes(searchText) ||
          category.includes(searchText);

        const matchesCategory =
          categoryFilter === "All" ||
          product.category === categoryFilter;

        const matchesStatus =
          statusFilter === "All" ||
          product.status === statusFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      }
    );

    return [...result].sort(
      (a, b) => {
        if (sortOrder === "name-asc") {
          return (a.name || "").localeCompare(
            b.name || ""
          );
        }

        if (sortOrder === "price-low") {
          return (
            Number(a.price || 0) -
            Number(b.price || 0)
          );
        }

        if (sortOrder === "price-high") {
          return (
            Number(b.price || 0) -
            Number(a.price || 0)
          );
        }

        const dateA = new Date(
          a.updatedAt || 0
        ).getTime();

        const dateB = new Date(
          b.updatedAt || 0
        ).getTime();

        return dateB - dateA;
      }
    );
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
    sortOrder,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        productsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    productsPerPage;

  const endIndex =
    startIndex + productsPerPage;

  const paginatedProducts =
    filteredProducts.slice(
      startIndex,
      endIndex
    );

  /* =======================================================
     SAVE PRODUCTS
  ======================================================= */

  function saveProducts(updatedProducts) {
    setProducts(updatedProducts);

    localStorage.setItem(
      "ashProducts",
      JSON.stringify(updatedProducts)
    );
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function handleDelete(productId) {
    const product =
      products.find(
        (item) => item.id === productId
      );

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        product?.name || "this product"
      }"?`
    );

    if (!confirmed) return;

    const updatedProducts =
      products.filter(
        (item) => item.id !== productId
      );

    saveProducts(updatedProducts);

    setOpenMenu(null);

    if (
      paginatedProducts.length === 1 &&
      safeCurrentPage > 1
    ) {
      setCurrentPage(
        safeCurrentPage - 1
      );
    }
  }

  /* =======================================================
     DUPLICATE
  ======================================================= */

  function handleDuplicate(product) {
    const timestamp = Date.now();

    const duplicatedProduct = {
      ...product,

      id: `product-${timestamp}`,

      name: `${product.name || "Product"} Copy`,

      sku: product.sku
        ? `${product.sku}-COPY`
        : `ASH-${timestamp}`,

      status: "Draft",

      updatedAt:
        new Date().toISOString(),
    };

    const updatedProducts = [
      duplicatedProduct,
      ...products,
    ];

    saveProducts(updatedProducts);

    setOpenMenu(null);

    alert(
      "Product duplicated successfully."
    );
  }

  /* =======================================================
     ARCHIVE
  ======================================================= */

  function handleArchive(product) {
    const updatedProducts =
      products.map((item) =>
        item.id === product.id
          ? {
              ...item,
              status: "Archived",
              updatedAt:
                new Date().toISOString(),
            }
          : item
      );

    saveProducts(updatedProducts);

    setOpenMenu(null);
  }

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setSortOrder("recent");
  }

  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  const pageNumbers = [];

  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {
    pageNumbers.push(page);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="products-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="products-heading">

        <div>

          <p className="eyebrow">
            CATALOGUE
          </p>

          <h1>
            Products
          </h1>

          <p>
            Manage your jewellery catalogue,
            products and publishing status.
          </p>

        </div>

        <Link
          to="/products/new"
          className="add-product-btn"
        >
          <Plus size={17} />
          Add Product
        </Link>

      </section>


      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="products-toolbar">

        {/* SEARCH */}

        <div className="products-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search products, SKU..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        {/* CATEGORY */}

        <select
          className="filter-btn"
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >

          {categories.map(
            (category) => (
              <option
                value={category}
                key={category}
              >
                {category === "All"
                  ? "All Categories"
                  : category}
              </option>
            )
          )}

        </select>


        {/* STATUS */}

        <select
          className="filter-btn"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="All">
            All Status
          </option>

          <option value="Published">
            Published
          </option>

          <option value="Draft">
            Draft
          </option>

          <option value="Archived">
            Archived
          </option>

        </select>


        {/* CLEAR */}

        <button
          className="filter-btn"
          type="button"
          onClick={clearFilters}
        >
          <SlidersHorizontal size={15} />
          Clear
        </button>

      </section>


      {/* =================================================
          PRODUCTS CARD
      ================================================= */}

      <section className="products-card">

        {/* CARD HEADER */}

        <div className="products-card-header">

          <div>

            <h3>
              All Products
            </h3>

            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </span>

          </div>


          {/* SORT */}

          <select
            className="sort-btn"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value
              )
            }
          >

            <option value="recent">
              Recently updated
            </option>

            <option value="name-asc">
              Name A–Z
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

          </select>

        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredProducts.length === 0 ? (

          <div className="products-empty">

            <div className="products-empty-icon">
              <Package size={25} />
            </div>

            <h3>
              No products found
            </h3>

            <p>
              Try changing your search or
              add a new product.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >

              <button
                type="button"
                className="filter-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

              <Link
                to="/products/new"
                className="add-product-btn"
              >
                <Plus size={16} />
                Add Product
              </Link>

            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="products-table-wrapper">

              <table className="products-table">

                <thead>

                  <tr>

                    <th>
                      PRODUCT
                    </th>

                    <th>
                      SKU
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      PRICE
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      STOCK
                    </th>

                    <th />

                  </tr>

                </thead>


                <tbody>

                  {paginatedProducts.map(
                    (product) => (

                      <tr
                        key={product.id}
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="product-cell">

                            <div className="product-image">

                              {getProductImage(
                                product
                              ) ? (

                                <img
                                  src={getProductImage(
                                    product
                                  )}
                                  alt={
                                    product.name
                                  }
                                />

                              ) : (

                                <Package
                                  size={20}
                                />

                              )}

                            </div>


                            <div className="product-name">

                              <strong>
                                {product.name ||
                                  "Unnamed Product"}
                              </strong>

                              <span>
                                Jewellery
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* SKU */}

                        <td>

                          <span className="sku">
                            {product.sku ||
                              "—"}
                          </span>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="category-name">
                            {product.category ||
                              "—"}
                          </span>

                        </td>


                        {/* PRICE */}

                        <td>

                          <strong className="product-price">
                            {formatPrice(
                              product.price
                            )}
                          </strong>

                        </td>


                        {/* STATUS */}

                        <td>

                          <StatusBadge
                            status={
                              product.status
                            }
                          />

                        </td>


                        {/* STOCK */}

                        <td>

                          <StockBadge
                            stock={
                              product.stockStatus ||
                              product.stock
                            }
                          />

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="product-action-wrapper">

                            {/* VIEW */}

                            <button
                              className="product-actions"
                              type="button"
                              title="View product"
                              onClick={() =>
                                setViewProduct(
                                  product
                                )
                              }
                            >
                              <Eye size={17} />
                            </button>


                            {/* EDIT */}

                            <button
                              className="product-actions"
                              type="button"
                              title="Edit product"
                              onClick={() =>
                                navigate(
                                  `/products/${product.id}/edit`
                                )
                              }
                            >
                              <Edit3 size={16} />
                            </button>


                            {/* MORE */}

                            <div className="product-more-wrapper">

                              <button
                                className="product-actions"
                                type="button"
                                title="More actions"
                                onClick={() =>
                                  setOpenMenu(
                                    openMenu ===
                                      product.id
                                      ? null
                                      : product.id
                                  )
                                }
                              >
                                <ChevronDown
                                  size={15}
                                />
                              </button>


                              {openMenu ===
                                product.id && (

                                <div className="product-action-menu">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDuplicate(
                                        product
                                      )
                                    }
                                  >
                                    <Copy
                                      size={14}
                                    />
                                    Duplicate
                                  </button>


                                  {product.status !==
                                    "Archived" && (

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleArchive(
                                          product
                                        )
                                      }
                                    >
                                      <Archive
                                        size={14}
                                      />
                                      Archive
                                    </button>

                                  )}


                                  <button
                                    type="button"
                                    className="delete-menu-item"
                                    onClick={() =>
                                      handleDelete(
                                        product.id
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={14}
                                    />
                                    Delete
                                  </button>

                                </div>

                              )}

                            </div>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="products-pagination">

              <span>

                Showing{" "}

                <strong>
                  {filteredProducts.length === 0
                    ? 0
                    : startIndex + 1}
                  –
                  {Math.min(
                    endIndex,
                    filteredProducts.length
                  )}
                </strong>{" "}

                of{" "}

                <strong>
                  {filteredProducts.length}
                </strong>{" "}

                products

              </span>


              {totalPages > 1 && (

                <div className="pagination-buttons">

                  <button
                    type="button"
                    disabled={
                      safeCurrentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        safeCurrentPage - 1
                      )
                    }
                  >
                    Previous
                  </button>


                  {pageNumbers.map(
                    (page) => (

                      <button
                        key={page}
                        type="button"
                        className={
                          safeCurrentPage ===
                          page
                            ? "pagination-active"
                            : ""
                        }
                        onClick={() =>
                          setCurrentPage(page)
                        }
                      >
                        {page}
                      </button>

                    )
                  )}


                  <button
                    type="button"
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        safeCurrentPage + 1
                      )
                    }
                  >
                    Next
                  </button>

                </div>

              )}

            </div>

          </>

        )}

      </section>


      {/* =================================================
          QUICK VIEW MODAL
      ================================================= */}

      {viewProduct && (

        <div
          className="product-view-overlay"
          onClick={() =>
            setViewProduct(null)
          }
        >

          <div
            className="product-view-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="product-view-close"
              onClick={() =>
                setViewProduct(null)
              }
            >
              <X size={18} />
            </button>


            <div className="product-view-image">

              {getProductImage(
                viewProduct
              ) ? (

                <img
                  src={getProductImage(
                    viewProduct
                  )}
                  alt={viewProduct.name}
                />

              ) : (

                <Package size={40} />

              )}

            </div>


            <div className="product-view-content">

              <p className="eyebrow">
                PRODUCT PREVIEW
              </p>

              <h2>
                {viewProduct.name}
              </h2>

              <p className="product-view-sku">
                SKU:{" "}
                {viewProduct.sku || "—"}
              </p>


              <div className="product-view-price">
                {formatPrice(
                  viewProduct.price
                )}
              </div>


              <div className="product-view-details">

                <div>
                  <span>
                    Category
                  </span>
                  <strong>
                    {viewProduct.category ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>
                  <StatusBadge
                    status={
                      viewProduct.status
                    }
                  />
                </div>

                <div>
                  <span>
                    Stock
                  </span>
                  <StockBadge
                    stock={
                      viewProduct.stockStatus ||
                      viewProduct.stock
                    }
                  />
                </div>

              </div>


              <div className="product-view-actions">

                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => {
                    setViewProduct(null);

                    navigate(
                      `/products/${viewProduct.id}/edit`
                    );
                  }}
                >
                  <Edit3 size={15} />
                  Edit Product
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}