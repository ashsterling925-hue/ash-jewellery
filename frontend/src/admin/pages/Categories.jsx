import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  X,
  FolderTree,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categoryApi } from "@/lib/api/categoryApi";

/* =========================================================
   STATUS BADGE
========================================================= */

function CategoryStatus({ status }) {
  const safeStatus = status || "Active";

  return (
    <span
      className={`category-status ${safeStatus
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      <span className="status-circle" />
      {safeStatus}
    </span>
  );
}

/* =========================================================
   CATEGORIES PAGE
========================================================= */

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [viewCategory, setViewCategory] = useState(null);

  /* =======================================================
     LOAD CATEGORIES (API)
  ======================================================= */

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        sortBy: "sortOrder",
        sortOrder: "asc",
      };

      const response = await categoryApi.getCategories(params);

      if (response && response.data) {
        setCategories(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to load categories from API:", err);
      setError(err.message || "Failed to load categories. Please try again.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchCategories]);

  /* =======================================================
     PRODUCT COUNT
  ======================================================= */

  function getProductCount(category) {
    if (category && category._count && typeof category._count.products === "number") {
      return category._count.products;
    }
    return 0;
  }

  /* =======================================================
     DELETE / ARCHIVE CATEGORY
  ======================================================= */

  async function handleDelete(categoryId) {
    const category = categories.find((item) => item.id === categoryId);
    if (!category) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );
    if (!confirmed) return;

    try {
      const result = await categoryApi.deleteCategory(categoryId);
      if (result && result.message) {
        alert(result.message);
      }
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert(err.message || "Failed to delete category.");
    }
  }

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  async function toggleStatus(category) {
    const nextStatus = category.status === "Active" ? "Inactive" : "Active";
    try {
      await categoryApi.updateCategory(category.id, { status: nextStatus });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, status: nextStatus } : c
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.message || "Failed to update category status.");
    }
  }

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPage(1);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="products-page categories-page">
      {/* =================================================
          PAGE HEADER
      ================================================= */}
      <section className="products-heading">
        <div>
          <h1>Categories</h1>
        </div>

        <button
          type="button"
          className="add-product-btn"
          onClick={() => navigate("/admin/categories/new")}
        >
          <Plus size={17} />
          Add Category
        </button>
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
            placeholder="Search categories..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* STATUS */}
        <select
          className="filter-btn"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* CLEAR */}
        <button
          type="button"
          className="filter-btn"
          onClick={clearFilters}
        >
          <X size={14} />
          Clear
        </button>
      </section>

      {/* =================================================
          CATEGORY CARD
      ================================================= */}
      <section className="products-card">
        {/* HEADER */}
        <div className="products-card-header">
          <div>
            <h3>All Categories</h3>
            <span>
              {pagination.total} {pagination.total === 1 ? "category" : "categories"}
            </span>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div style={{ padding: "16px 20px", color: "#a33d32", background: "#fdf2f2", borderRadius: "6px", margin: "16px" }}>
            <strong>Error: </strong> {error}
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--muted, #7c7267)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px auto", display: "block" }} />
            <span>Loading categories from Neon database...</span>
          </div>
        ) : categories.length === 0 ? (
          /* EMPTY STATE */
          <div className="products-empty">
            <div className="products-empty-icon">
              <FolderTree size={25} />
            </div>
            <h3>No categories found</h3>
            <p>Try changing your search or create a new category.</p>
            <button
              type="button"
              className="add-product-btn"
              onClick={() => navigate("/admin/categories/new")}
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                TABLE
            ================================================= */}
            <div className="products-table-wrapper">
              <table className="products-table categories-table">
                <thead>
                  <tr>
                    <th>CATEGORY</th>
                    <th>SLUG</th>
                    <th>PRODUCTS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => {
                    const productCount = getProductCount(category);

                    return (
                      <tr key={category.id}>
                        {/* CATEGORY */}
                        <td>
                          <div className="product-cell">
                            <div className="product-image category-image">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                />
                              ) : (
                                <FolderTree size={20} />
                              )}
                            </div>

                            <div className="product-name">
                              <strong>{category.name}</strong>
                              <span>
                                {category.description || "Jewellery category"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SLUG */}
                        <td>
                          <span className="sku">/{category.slug}</span>
                        </td>

                        {/* PRODUCTS */}
                        <td>
                          <strong className="product-price">
                            {productCount}
                          </strong>
                        </td>

                        {/* STATUS */}
                        <td>
                          <button
                            type="button"
                            className="category-status-button"
                            onClick={() => toggleStatus(category)}
                            title="Toggle category status"
                          >
                            <CategoryStatus status={category.status} />
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div className="product-action-wrapper">
                            {/* VIEW */}
                            <button
                              type="button"
                              className="product-actions"
                              title="View category"
                              onClick={() => setViewCategory(category)}
                            >
                              <Eye size={17} />
                            </button>

                            {/* EDIT */}
                            <button
                              type="button"
                              className="product-actions"
                              title="Edit category"
                              onClick={() =>
                                navigate(
                                  `/admin/categories/${category.id}/edit`
                                )
                              }
                            >
                              <Edit3 size={16} />
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              className="product-actions product-delete"
                              title="Delete category"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION INFO */}
            <div className="products-pagination">
              <span>
                Showing <strong>{categories.length}</strong> of{" "}
                <strong>{pagination.total}</strong> categories
              </span>
            </div>
          </>
        )}
      </section>

      {/* =================================================
          QUICK VIEW MODAL
      ================================================= */}
      {viewCategory && (
        <div
          className="product-view-overlay"
          onClick={() => setViewCategory(null)}
        >
          <div
            className="product-view-modal category-view-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="product-view-close"
              onClick={() => setViewCategory(null)}
            >
              <X size={18} />
            </button>

            {/* IMAGE */}
            <div className="product-view-image">
              {viewCategory.image ? (
                <img
                  src={viewCategory.image}
                  alt={viewCategory.name}
                />
              ) : (
                <FolderTree size={40} />
              )}
            </div>

            {/* CONTENT */}
            <div className="product-view-content">
              <p className="eyebrow">CATEGORY PREVIEW</p>
              <h2>{viewCategory.name}</h2>
              <p className="product-view-sku">Slug: /{viewCategory.slug}</p>

              <div className="product-view-details">
                <div>
                  <span>Products</span>
                  <strong>{getProductCount(viewCategory)}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <CategoryStatus status={viewCategory.status} />
                </div>

                <div>
                  <span>Description</span>
                  <strong>
                    {viewCategory.description || "No description"}
                  </strong>
                </div>
              </div>

              <div className="product-view-actions">
                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => {
                    setViewCategory(null);
                    navigate(`/admin/categories/${viewCategory.id}/edit`);
                  }}
                >
                  <Edit3 size={15} />
                  Edit Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}