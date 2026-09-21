import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  X,
  FolderTree,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


/* =========================================================
   DEMO CATEGORIES
========================================================= */

const demoCategories = [
  {
    id: "cat-1",
    name: "Bangles",
    slug: "bangles",
    description: "Traditional and contemporary bangles.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300",
    status: "Active",
    createdAt: "2026-09-01T10:00:00",
  },

  {
    id: "cat-2",
    name: "Necklaces",
    slug: "necklaces",
    description: "Elegant necklaces for every occasion.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300",
    status: "Active",
    createdAt: "2026-09-02T10:00:00",
  },

  {
    id: "cat-3",
    name: "Earrings",
    slug: "earrings",
    description: "Classic and modern earrings.",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300",
    status: "Active",
    createdAt: "2026-09-03T10:00:00",
  },

  {
    id: "cat-4",
    name: "Rings",
    slug: "rings",
    description: "Statement and everyday rings.",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300",
    status: "Active",
    createdAt: "2026-09-04T10:00:00",
  },

  {
    id: "cat-5",
    name: "Anklets",
    slug: "anklets",
    description: "Traditional and silver anklets.",
    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=300",
    status: "Inactive",
    createdAt: "2026-09-05T10:00:00",
  },
];


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

  const [categories, setCategories] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [viewCategory, setViewCategory] =
    useState(null);


  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  useEffect(() => {
    const storedCategories =
      localStorage.getItem(
        "ashCategories"
      );

    if (storedCategories === null) {
      localStorage.setItem(
        "ashCategories",
        JSON.stringify(demoCategories)
      );

      setCategories(demoCategories);

      return;
    }

    try {
      const savedCategories =
        JSON.parse(storedCategories);

      setCategories(
        Array.isArray(savedCategories)
          ? savedCategories
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load categories:",
        error
      );

      setCategories([]);
    }
  }, []);


  /* =======================================================
     SAVE CATEGORIES
  ======================================================= */

  function saveCategories(
    updatedCategories
  ) {
    setCategories(
      updatedCategories
    );

    localStorage.setItem(
      "ashCategories",
      JSON.stringify(
        updatedCategories
      )
    );
  }


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredCategories =
    useMemo(() => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      return categories.filter(
        (category) => {
          const name =
            category.name
              ?.toLowerCase() || "";

          const slug =
            category.slug
              ?.toLowerCase() || "";

          const matchesSearch =
            !searchText ||
            name.includes(
              searchText
            ) ||
            slug.includes(
              searchText
            );

          const matchesStatus =
            statusFilter === "All" ||
            category.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      categories,
      search,
      statusFilter,
    ]);


  /* =======================================================
     PRODUCT COUNT
  ======================================================= */

  function getProductCount(
    categoryName
  ) {
    try {
      const storedProducts =
        JSON.parse(
          localStorage.getItem(
            "ashProducts"
          )
        ) || [];

      return storedProducts.filter(
        (product) =>
          product.category
            ?.toLowerCase() ===
          categoryName
            ?.toLowerCase()
      ).length;
    } catch {
      return 0;
    }
  }


  /* =======================================================
     DELETE
  ======================================================= */

  function handleDelete(
    categoryId
  ) {
    const category =
      categories.find(
        (item) =>
          item.id === categoryId
      );

    if (!category) return;

    const productCount =
      getProductCount(
        category.name
      );

    if (productCount > 0) {
      const confirmed =
        window.confirm(
          `"${category.name}" has ${productCount} product${
            productCount === 1
              ? ""
              : "s"
          } assigned to it.\n\nAre you sure you want to delete this category?`
        );

      if (!confirmed) return;
    } else {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${category.name}"?`
        );

      if (!confirmed) return;
    }

    const updatedCategories =
      categories.filter(
        (item) =>
          item.id !== categoryId
      );

    saveCategories(
      updatedCategories
    );
  }


  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  function toggleStatus(
    category
  ) {
    const updatedCategories =
      categories.map(
        (item) =>
          item.id === category.id
            ? {
                ...item,
                status:
                  item.status ===
                  "Active"
                    ? "Inactive"
                    : "Active",
              }
            : item
      );

    saveCategories(
      updatedCategories
    );
  }


  /* =======================================================
     CLEAR FILTER
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
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

          <p className="eyebrow">
            CATALOGUE
          </p>

          <h1>
            Categories
          </h1>

          <p>
            Organise your jewellery catalogue
            into clear product categories.
          </p>

        </div>


        <button
          type="button"
          className="add-product-btn"
          onClick={() =>
            navigate(
              "/categories/new"
            )
          }
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
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


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

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>

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

            <h3>
              All Categories
            </h3>

            <span>
              {filteredCategories.length}{" "}
              {filteredCategories.length ===
              1
                ? "category"
                : "categories"}
            </span>

          </div>

        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredCategories.length ===
        0 ? (

          <div className="products-empty">

            <div className="products-empty-icon">
              <FolderTree
                size={25}
              />
            </div>

            <h3>
              No categories found
            </h3>

            <p>
              Try changing your search or
              create a new category.
            </p>

            <button
              type="button"
              className="add-product-btn"
              onClick={() =>
                navigate(
                  "/categories/new"
                )
              }
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

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      SLUG
                    </th>

                    <th>
                      PRODUCTS
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredCategories.map(
                    (category) => {

                      const productCount =
                        getProductCount(
                          category.name
                        );

                      return (
                        <tr
                          key={
                            category.id
                          }
                        >

                          {/* CATEGORY */}

                          <td>

                            <div className="product-cell">

                              <div className="product-image category-image">

                                {category.image ? (

                                  <img
                                    src={
                                      category.image
                                    }
                                    alt={
                                      category.name
                                    }
                                  />

                                ) : (

                                  <FolderTree
                                    size={20}
                                  />

                                )}

                              </div>


                              <div className="product-name">

                                <strong>
                                  {
                                    category.name
                                  }
                                </strong>

                                <span>
                                  {
                                    category.description ||
                                    "Jewellery category"
                                  }
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* SLUG */}

                          <td>

                            <span className="sku">
                              /
                              {
                                category.slug
                              }
                            </span>

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
                              onClick={() =>
                                toggleStatus(
                                  category
                                )
                              }
                              title="Toggle category status"
                            >
                              <CategoryStatus
                                status={
                                  category.status
                                }
                              />
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
                                onClick={() =>
                                  setViewCategory(
                                    category
                                  )
                                }
                              >
                                <Eye
                                  size={17}
                                />
                              </button>


                              {/* EDIT */}

                              <button
                                type="button"
                                className="product-actions"
                                title="Edit category"
                                onClick={() =>
                                  navigate(
                                    `/categories/${category.id}/edit`
                                  )
                                }
                              >
                                <Edit3
                                  size={16}
                                />
                              </button>


                              {/* DELETE */}

                              <button
                                type="button"
                                className="product-actions product-delete"
                                title="Delete category"
                                onClick={() =>
                                  handleDelete(
                                    category.id
                                  )
                                }
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* PAGINATION INFO */}

            <div className="products-pagination">

              <span>

                Showing{" "}

                <strong>
                  {filteredCategories.length}
                </strong>{" "}

                of{" "}

                <strong>
                  {categories.length}
                </strong>{" "}

                categories

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
          onClick={() =>
            setViewCategory(null)
          }
        >

          <div
            className="product-view-modal category-view-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="product-view-close"
              onClick={() =>
                setViewCategory(null)
              }
            >
              <X size={18} />
            </button>


            {/* IMAGE */}

            <div className="product-view-image">

              {viewCategory.image ? (

                <img
                  src={
                    viewCategory.image
                  }
                  alt={
                    viewCategory.name
                  }
                />

              ) : (

                <FolderTree
                  size={40}
                />

              )}

            </div>


            {/* CONTENT */}

            <div className="product-view-content">

              <p className="eyebrow">
                CATEGORY PREVIEW
              </p>

              <h2>
                {
                  viewCategory.name
                }
              </h2>

              <p className="product-view-sku">
                Slug: /
                {
                  viewCategory.slug
                }
              </p>


              <div className="product-view-details">

                <div>

                  <span>
                    Products
                  </span>

                  <strong>
                    {
                      getProductCount(
                        viewCategory.name
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Status
                  </span>

                  <CategoryStatus
                    status={
                      viewCategory.status
                    }
                  />

                </div>


                <div>

                  <span>
                    Description
                  </span>

                  <strong>
                    {
                      viewCategory.description ||
                      "No description"
                    }
                  </strong>

                </div>

              </div>


              <div className="product-view-actions">

                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => {
                    setViewCategory(
                      null
                    );

                    navigate(
                      `/categories/${viewCategory.id}/edit`
                    );
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