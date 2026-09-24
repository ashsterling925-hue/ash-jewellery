import { useEffect, useMemo, useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { productApi } from "@/lib/api/productApi";
import { categoryApi } from "@/lib/api/categoryApi";

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const safeStatus = status || "Draft";
  const displayStatus =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).toLowerCase();

  return (
    <span
      className={`product-status ${safeStatus
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="status-circle" />
      {displayStatus}
    </span>
  );
}

/* =========================================================
   STOCK BADGE
========================================================= */

function StockBadge({ stock }) {
  const safeStock = stock || "IN_STOCK";
  const displayStock = safeStock
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={`stock-status ${safeStock
        .toLowerCase()
        .replaceAll("_", "-")}`}
    >
      {displayStock}
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

  const number = Number(String(price).replace(/[^\d.]/g, ""));

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
    const primary =
      product.images.find((img) => img.isPrimary) || product.images[0];
    return primary.url || primary;
  }

  return product?.image || "";
}

/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [merchandisingFilter, setMerchandisingFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewProduct, setViewProduct] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const productsPerPage = 10;

  /* =======================================================
     LOAD PRODUCTS & CATEGORIES FROM API
  ======================================================= */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Clean up legacy localStorage cache
      try {
        localStorage.removeItem("ashProducts");
      } catch {
        // ignore
      }

      const [pRes, cRes] = await Promise.all([
        productApi.getProducts({ limit: 100 }),
        categoryApi.getCategories({ limit: 100 }),
      ]);

      if (pRes?.data) {
        setProducts(pRes.data);
      } else {
        setProducts([]);
      }

      if (cRes?.data) {
        setCategoriesList(cRes.data);
      }
    } catch (err) {
      console.error("Failed to load products from API:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, merchandisingFilter, sortOrder]);

  /* =======================================================
     CATEGORIES FILTER OPTIONS
  ======================================================= */

  const categories = useMemo(() => {
    const fromList = categoriesList.map((c) => c.name);
    return ["All", ...fromList];
  }, [categoriesList]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    const result = products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const sku = product.sku?.toLowerCase() || "";
      const categoryName =
        product.category?.name?.toLowerCase() ||
        (typeof product.category === "string"
          ? product.category.toLowerCase()
          : "");

      const matchesSearch =
        !searchText ||
        name.includes(searchText) ||
        sku.includes(searchText) ||
        categoryName.includes(searchText);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category?.name === categoryFilter ||
        product.category === categoryFilter;

      const pStatus = (product.status || "Draft").toUpperCase();
      const fStatus = statusFilter.toUpperCase();
      const matchesStatus = statusFilter === "All" || pStatus === fStatus;

      const matchesMerchandising =
        merchandisingFilter === "All" ||
        (merchandisingFilter === "bestseller" && product.isBestSeller) ||
        (merchandisingFilter === "new-arrival" && product.isNewArrival) ||
        (merchandisingFilter === "featured" && product.isFeatured) ||
        (merchandisingFilter === "trending" && product.isTrending);

      return matchesSearch && matchesCategory && matchesStatus && matchesMerchandising;
    });

    return [...result].sort((a, b) => {
      if (sortOrder === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortOrder === "price-low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortOrder === "price-high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();

      return dateB - dateA;
    });
  }, [products, search, categoryFilter, statusFilter, sortOrder]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  async function handleDelete(productId) {
    const product = products.find((item) => item.id === productId);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product?.name || "this product"}"?`
    );

    if (!confirmed) return;

    try {
      await productApi.deleteProduct(productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      setOpenMenu(null);
    } catch (err) {
      alert(err.message || "Failed to delete product.");
    }
  }

  /* =======================================================
     DUPLICATE PRODUCT
  ======================================================= */

  async function handleDuplicate(product) {
    try {
      const timestamp = Date.now().toString().slice(-4);
      const res = await productApi.createProduct({
        name: `${product.name} Copy`,
        sku: `${product.sku}-COPY-${timestamp}`,
        price: Number(product.price),
        categoryId:
          product.categoryId ||
          product.category?.id ||
          categoriesList[0]?.id,
        status: "DRAFT",
        description: product.description || null,
        shortDescription: product.shortDescription || null,
      });

      if (res?.data) {
        setProducts((prev) => [res.data, ...prev]);
        alert("Product duplicated successfully.");
      }
      setOpenMenu(null);
    } catch (err) {
      alert(err.message || "Failed to duplicate product.");
    }
  }

  /* =======================================================
     ARCHIVE PRODUCT
  ======================================================= */

  async function handleArchive(product) {
    try {
      await productApi.updateProduct(product.id, { status: "ARCHIVED" });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, status: "ARCHIVED" } : item
        )
      );
      setOpenMenu(null);
    } catch (err) {
      alert(err.message || "Failed to archive product.");
    }
  }

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setMerchandisingFilter("All");
    setSortOrder("recent");
  }

  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  const pageNumbers = [];
  for (let page = 1; page <= totalPages; page++) {
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
          <p className="eyebrow">CATALOGUE</p>
          <h1>Products</h1>
          <p>Manage your jewellery catalogue, products and publishing status.</p>
        </div>

        <Link to="/admin/products/new" className="add-product-btn">
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
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* CATEGORY */}
        <select
          className="filter-btn"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          {categories.map((cat) => (
            <option value={cat} key={cat}>
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>

        {/* STATUS */}
        <select
          className="filter-btn"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>

        {/* MERCHANDISING */}
        <select
          className="filter-btn"
          value={merchandisingFilter}
          onChange={(event) => setMerchandisingFilter(event.target.value)}
        >
          <option value="All">All Merchandising</option>
          <option value="bestseller">Best Sellers</option>
          <option value="new-arrival">New Arrivals</option>
          <option value="featured">Featured</option>
          <option value="trending">Trending</option>
        </select>

        {/* CLEAR */}
        <button className="filter-btn" type="button" onClick={clearFilters}>
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
            <h3>All Products</h3>
            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {/* SORT */}
          <select
            className="sort-btn"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="recent">Recently updated</option>
            <option value="name-asc">Name A–Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* =================================================
            LOADING OR EMPTY STATE
        ================================================= */}

        {loading ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#8a8277",
            }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ margin: "0 auto 10px", display: "block" }}
            />
            <p style={{ fontSize: "13px" }}>Loading products from database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty">
            <div className="products-empty-icon">
              <Package size={25} />
            </div>

            <h3>No products found</h3>
            <p>
              {products.length === 0
                ? "Your catalogue has no products yet. Click 'Add Product' to create one."
                : "No products matched your search or filters."}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              {products.length > 0 && (
                <button
                  type="button"
                  className="filter-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}

              <Link to="/admin/products/new" className="add-product-btn">
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
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>HOMEPAGE TAGS</th>
                    <th>PRICE</th>
                    <th>STATUS</th>
                    <th>STOCK</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {paginatedProducts.map((product) => {
                    const categoryLabel =
                      product.category?.name ||
                      (typeof product.category === "string"
                        ? product.category
                        : "—");

                    return (
                      <tr key={product.id}>
                        {/* PRODUCT */}
                        <td>
                          <div className="product-cell">
                            <div className="product-image">
                              {getProductImage(product) ? (
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                />
                              ) : (
                                <Package size={20} />
                              )}
                            </div>

                            <div className="product-name">
                              <strong>
                                {product.name || "Unnamed Product"}
                              </strong>
                              <span>Jewellery</span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td>
                          <span className="sku">{product.sku || "—"}</span>
                        </td>

                        {/* CATEGORY */}
                        <td>
                          <span className="category-name">{categoryLabel}</span>
                        </td>

                        {/* HOMEPAGE TAGS */}
                        <td>
                          <div className="flex flex-wrap items-center gap-1 max-w-[190px]">
                            {product.isBestSeller && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                                BESTSELLER
                              </span>
                            )}
                            {product.isNewArrival && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                                NEW ARRIVAL
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                                FEATURED
                              </span>
                            )}
                            {product.isTrending && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                                TRENDING
                              </span>
                            )}
                            {!product.isBestSeller && !product.isNewArrival && !product.isFeatured && !product.isTrending && (
                              <span className="text-[#8a8277] text-xs">—</span>
                            )}
                          </div>
                        </td>

                        {/* PRICE */}
                        <td>
                          <strong className="product-price">
                            {formatPrice(product.price)}
                          </strong>
                        </td>

                        {/* STATUS */}
                        <td>
                          <StatusBadge status={product.status} />
                        </td>

                        {/* STOCK */}
                        <td>
                          <StockBadge
                            stock={product.stockStatus || product.stock}
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
                              onClick={() => setViewProduct(product)}
                            >
                              <Eye size={17} />
                            </button>

                            {/* EDIT */}
                            <button
                              className="product-actions"
                              type="button"
                              title="Edit product"
                              onClick={() =>
                                navigate(`/admin/products/${product.id}/edit`)
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
                                    openMenu === product.id ? null : product.id
                                  )
                                }
                              >
                                <ChevronDown size={15} />
                              </button>

                              {openMenu === product.id && (
                                <div className="product-action-menu">
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicate(product)}
                                  >
                                    <Copy size={14} />
                                    Duplicate
                                  </button>

                                  {product.status !== "ARCHIVED" &&
                                    product.status !== "Archived" && (
                                      <button
                                        type="button"
                                        onClick={() => handleArchive(product)}
                                      >
                                        <Archive size={14} />
                                        Archive
                                      </button>
                                    )}

                                  <button
                                    type="button"
                                    className="delete-menu-item"
                                    onClick={() => handleDelete(product.id)}
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  {filteredProducts.length === 0 ? 0 : startIndex + 1}–
                  {Math.min(endIndex, filteredProducts.length)}
                </strong>{" "}
                of <strong>{filteredProducts.length}</strong> products
              </span>

              {totalPages > 1 && (
                <div className="pagination-buttons">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage(safeCurrentPage - 1)}
                  >
                    Previous
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        safeCurrentPage === page ? "pagination-active" : ""
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage(safeCurrentPage + 1)}
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
          onClick={() => setViewProduct(null)}
        >
          <div
            className="product-view-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="product-view-close"
              onClick={() => setViewProduct(null)}
            >
              <X size={18} />
            </button>

            <div className="product-view-image">
              {getProductImage(viewProduct) ? (
                <img
                  src={getProductImage(viewProduct)}
                  alt={viewProduct.name}
                />
              ) : (
                <Package size={40} />
              )}
            </div>

            <div className="product-view-content">
              <p className="eyebrow">PRODUCT PREVIEW</p>

              <h2>{viewProduct.name}</h2>

              <p className="product-view-sku">
                SKU: {viewProduct.sku || "—"}
              </p>

              <div className="product-view-price">
                {formatPrice(viewProduct.price)}
              </div>

              <div className="product-view-details">
                <div>
                  <span>Category</span>
                  <strong>
                    {viewProduct.category?.name ||
                      (typeof viewProduct.category === "string"
                        ? viewProduct.category
                        : "—")}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <StatusBadge status={viewProduct.status} />
                </div>

                <div>
                  <span>Stock</span>
                  <StockBadge
                    stock={viewProduct.stockStatus || viewProduct.stock}
                  />
                </div>

                <div>
                  <span>Homepage Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewProduct.isBestSeller && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        BESTSELLER
                      </span>
                    )}
                    {viewProduct.isNewArrival && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        NEW ARRIVAL
                      </span>
                    )}
                    {viewProduct.isFeatured && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        FEATURED
                      </span>
                    )}
                    {viewProduct.isTrending && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        TRENDING
                      </span>
                    )}
                    {!viewProduct.isBestSeller && !viewProduct.isNewArrival && !viewProduct.isFeatured && !viewProduct.isTrending && (
                      <span className="text-[#8a8277] text-xs">None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="product-view-actions">
                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => {
                    const id = viewProduct.id;
                    setViewProduct(null);
                    navigate(`/admin/products/${id}/edit`);
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