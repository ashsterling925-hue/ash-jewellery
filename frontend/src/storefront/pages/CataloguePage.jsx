import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { Filter, X, ChevronDown, ChevronRight, SlidersHorizontal, ArrowLeft } from "lucide-react";
import SiteLayout from "@/storefront/components/SiteLayout";
import ProductCard from "@/storefront/components/ProductCard";
import { storefrontApi } from "@/lib/api/storefrontApi";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Price: Low to High", value: "price_asc", sortBy: "price", sortOrder: "asc" },
  { label: "Price: High to Low", value: "price_desc", sortBy: "price", sortOrder: "desc" },
  { label: "Name: A to Z", value: "name_asc", sortBy: "name", sortOrder: "asc" },
];

export default function CataloguePage({ forcedCategorySlug }) {
  const { categorySlug, subcategorySlug, collectionSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const querySearch = searchParams.get("q") || "";
  const querySort = searchParams.get("sort") || "newest";
  const queryPage = parseInt(searchParams.get("page") || "1", 10);
  const activeSubcategorySlug = searchParams.get("subcategory") || subcategorySlug;
  const queryAttrs = useMemo(() => {
    const raw = searchParams.get("attrs") || searchParams.get("attributeValueIds") || "";
    return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }, [searchParams]);

  // Page title and metadata state
  const [contextData, setContextData] = useState({
    title: "Catalogue",
    description: "",
    eyebrow: "ASH JEWELLERY",
  });

  // State
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedFilterIds, setExpandedFilterIds] = useState(new Set());

  // Determine active context
  const activeCategorySlug = forcedCategorySlug || categorySlug;
  const isSearchPage = location.pathname.startsWith("/search");

  // Load Context Metadata (Category/Collection/Subcategory details)
  useEffect(() => {
    let isMounted = true;
    async function loadContext() {
      try {
        if (activeCategorySlug) {
          const res = await storefrontApi.getCategoryBySlug(activeCategorySlug);
          if (isMounted && res?.data) {
            setContextData({
              title: res.data.name,
              description: res.data.description || "Discover handcrafted silver designs created with precision and care.",
              eyebrow: "CATEGORY",
            });
          }
        } else if (subcategorySlug) {
          const res = await storefrontApi.getSubcategoryBySlug(subcategorySlug);
          if (isMounted && res?.data) {
            setContextData({
              title: res.data.name,
              description: res.data.description || "Handcrafted jewellery for your timeless collection.",
              eyebrow: "SUBCATEGORY",
            });
          }
        } else if (collectionSlug) {
          const res = await storefrontApi.getCollectionBySlug(collectionSlug);
          if (isMounted && res?.data) {
            setContextData({
              title: res.data.name,
              description: res.data.description || "Exclusive curated designs inspired by Indian heritage.",
              eyebrow: "COLLECTION",
            });
          }
        } else if (isSearchPage) {
          setContextData({
            title: querySearch ? `Results for "${querySearch}"` : "Search Catalogue",
            description: querySearch ? `Showing matching pieces for "${querySearch}"` : "Browse our full handcrafted jewellery collection.",
            eyebrow: "SEARCH",
          });
        } else {
          setContextData({
            title: "All Jewellery",
            description: "Explore our collection of authentic 925 sterling silver jewellery.",
            eyebrow: "CATALOGUE",
          });
        }
      } catch (err) {
        console.error("Failed to load context metadata:", err);
        if (isMounted) {
          setContextData({
            title: activeCategorySlug || subcategorySlug || collectionSlug || "Catalogue",
            description: "",
            eyebrow: "JEWELLERY",
          });
        }
      }
    }

    loadContext();
    return () => {
      isMounted = false;
    };
  }, [activeCategorySlug, subcategorySlug, collectionSlug, isSearchPage, querySearch]);

  // Load Dynamic Filterable Attributes
  useEffect(() => {
    let isMounted = true;
    async function loadFilters() {
      try {
        const res = await storefrontApi.getFilters();
        if (isMounted && res?.data) {
          // Strictly exclude gender from storefront filters
          const cleanFilters = res.data.filter(
            (f) =>
              f.name?.toLowerCase() !== "gender" &&
              f.slug?.toLowerCase() !== "gender"
          );
          setFilters(cleanFilters);
          setExpandedFilterIds(new Set(cleanFilters.map((f) => f.id)));
        }
      } catch (err) {
        console.error("Failed to load filterable attributes:", err);
      }
    }
    loadFilters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products based on URL query state
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const selectedSort = SORT_OPTIONS.find((s) => s.value === querySort) || SORT_OPTIONS[0];

      const params = {
        page: queryPage,
        limit: 12,
        sortBy: selectedSort.sortBy,
        sortOrder: selectedSort.sortOrder,
      };

      if (activeCategorySlug) params.categorySlug = activeCategorySlug;
      if (activeSubcategorySlug) params.subcategorySlug = activeSubcategorySlug;
      if (collectionSlug) params.collectionSlug = collectionSlug;
      if (querySearch) params.search = querySearch;
      if (queryAttrs.length > 0) params.attributeValueIds = queryAttrs.join(",");

      const response = await storefrontApi.getProducts(params);
      if (response?.data) {
        setProducts(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategorySlug, activeSubcategorySlug, collectionSlug, querySearch, querySort, queryPage, queryAttrs]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // URL State Updates
  const updateUrlParam = (updater) => {
    const nextParams = new URLSearchParams(searchParams);
    updater(nextParams);
    setSearchParams(nextParams, { replace: true });
  };

  const handleToggleAttributeValue = (valId) => {
    const next = new Set(queryAttrs);
    if (next.has(valId)) {
      next.delete(valId);
    } else {
      next.add(valId);
    }
    updateUrlParam((params) => {
      const arr = Array.from(next);
      if (arr.length > 0) {
        params.set("attrs", arr.join(","));
      } else {
        params.delete("attrs");
        params.delete("attributeValueIds");
      }
      params.set("page", "1"); // reset to page 1 on filter change
    });
  };

  const handleSortChange = (newSort) => {
    updateUrlParam((params) => {
      params.set("sort", newSort);
      params.set("page", "1");
    });
  };

  const handlePageChange = (newPage) => {
    updateUrlParam((params) => {
      params.set("page", String(newPage));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAllFilters = () => {
    updateUrlParam((params) => {
      params.delete("attrs");
      params.delete("attributeValueIds");
      params.set("page", "1");
    });
  };

  const toggleFilterSection = (attrId) => {
    setExpandedFilterIds((prev) => {
      const next = new Set(prev);
      if (next.has(attrId)) {
        next.delete(attrId);
      } else {
        next.add(attrId);
      }
      return next;
    });
  };

  return (
    <SiteLayout>
      <div className="bg-[#fbf8f2] min-h-screen py-8">
        <div className="container">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] text-[#716b62] hover:text-[#1e1c19] uppercase"
            >
              <ArrowLeft size={13} /> Back to Home
            </Link>
          </div>

          {/* Heading Banner */}
          <div className="mb-10 text-center">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#b99657] uppercase">
              {contextData.eyebrow}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-medium tracking-wide text-[#1e1c19] sm:text-4xl">
              {contextData.title}
            </h1>
            {contextData.description && (
              <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[#716b62]">
                {contextData.description}
              </p>
            )}
            <div className="mx-auto mt-4 h-[2px] w-10 bg-[#b99657]" />
          </div>

          {/* Top Bar: Count, Mobile Filter Trigger, Sort Dropdown */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e7dfd3] pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 border border-[#d9cdbd] bg-[#fffdf9] px-3.5 py-1.5 text-xs font-medium text-[#1e1c19] lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filters
                {queryAttrs.length > 0 && (
                  <span className="rounded-full bg-[#b99657] px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {queryAttrs.length}
                  </span>
                )}
              </button>

              <span className="text-xs text-[#716b62]">
                {loading
                  ? "Loading products..."
                  : `Showing ${products.length} of ${pagination.total} ${
                      pagination.total === 1 ? "piece" : "pieces"
                    }`}
              </span>

              {queryAttrs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="hidden text-xs font-semibold text-[#b99657] hover:underline sm:inline-block"
                >
                  Clear Filters ({queryAttrs.length})
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <label htmlFor="catalogue-sort" className="text-xs text-[#716b62]">
                Sort by:
              </label>
              <select
                id="catalogue-sort"
                value={querySort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-[#d9cdbd] bg-[#fffdf9] px-3 py-1.5 text-xs text-[#1e1c19] outline-none transition-colors focus:border-[#b99657]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Layout: Filter Sidebar + Product Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6 rounded-none border border-[#e7dfd3] bg-[#fffdf9] p-5">
                <div className="flex items-center justify-between border-b border-[#e7dfd3] pb-3">
                  <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#1e1c19] uppercase">
                    <Filter size={14} className="text-[#b99657]" /> Filter By
                  </h2>
                  {queryAttrs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="text-[11px] font-medium text-[#b99657] hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Filterable Attributes List */}
                {filters.length > 0 ? (
                  filters.map((attr) => {
                    const isExpanded = expandedFilterIds.has(attr.id);
                    const activeCount = (attr.values || []).filter((v) =>
                      queryAttrs.includes(v.id)
                    ).length;

                    return (
                      <div key={attr.id} className="border-b border-[#f1eadf] pb-4 last:border-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => toggleFilterSection(attr.id)}
                          className="flex w-full items-center justify-between py-1 text-left text-xs font-semibold tracking-wider text-[#1e1c19] uppercase"
                        >
                          <span className="flex items-center gap-1.5">
                            {attr.name}
                            {activeCount > 0 && (
                              <span className="text-[10px] font-normal text-[#b99657]">
                                ({activeCount})
                              </span>
                            )}
                          </span>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 space-y-2">
                            {(attr.values || []).map((val) => {
                              const checked = queryAttrs.includes(val.id);
                              return (
                                <label
                                  key={val.id}
                                  className="flex cursor-pointer items-center gap-2 text-xs text-[#716b62] hover:text-[#1e1c19]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleAttributeValue(val.id)}
                                    className="h-3.5 w-3.5 accent-[#b99657]"
                                  />
                                  <span>{val.value}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-2 text-xs text-[#8a8277]">
                    No dynamic filters configured.
                  </div>
                )}
              </div>
            </aside>

            {/* Mobile Filters Drawer */}
            {isMobileFilterOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                  onClick={() => setIsMobileFilterOpen(false)}
                />

                <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-[#fffdf9] p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#e7dfd3] pb-4">
                    <h2 className="text-sm font-bold tracking-widest text-[#1e1c19] uppercase">
                      Filters
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="text-[#716b62] hover:text-[#1e1c19]"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-6">
                    {filters.map((attr) => (
                      <div key={attr.id} className="border-b border-[#f1eadf] pb-4">
                        <p className="mb-2 text-xs font-semibold tracking-wider text-[#1e1c19] uppercase">
                          {attr.name}
                        </p>
                        <div className="space-y-2">
                          {(attr.values || []).map((val) => {
                            const checked = queryAttrs.includes(val.id);
                            return (
                              <label
                                key={val.id}
                                className="flex cursor-pointer items-center gap-2 text-xs text-[#716b62]"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleAttributeValue(val.id)}
                                  className="h-3.5 w-3.5 accent-[#b99657]"
                                />
                                <span>{val.value}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#e7dfd3] pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="flex-1 border border-[#d9cdbd] py-2.5 text-xs font-semibold uppercase text-[#716b62]"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="flex-1 bg-[#211f1b] py-2.5 text-xs font-semibold uppercase text-white hover:bg-black"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid Column */}
            <div className="lg:col-span-3">
              {loading ? (
                // Skeletons
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[0.88/1] bg-[#eee6da]" />
                      <div className="mt-3 h-3 w-16 bg-[#eee6da] mx-auto" />
                      <div className="mt-2 h-4 w-28 bg-[#eee6da] mx-auto" />
                      <div className="mt-2 h-3 w-12 bg-[#eee6da] mx-auto" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id || product.slug} product={product} />
                    ))}
                  </div>

                  {/* Server Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2 border-t border-[#e7dfd3] pt-6">
                      <button
                        type="button"
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="border border-[#d9cdbd] bg-[#fffdf9] px-3.5 py-1.5 text-xs font-medium text-[#1e1c19] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#b99657]"
                      >
                        Previous
                      </button>

                      {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isCurrent = pageNum === pagination.page;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-8 py-1.5 text-xs font-medium transition-colors ${
                              isCurrent
                                ? "bg-[#211f1b] text-white"
                                : "border border-[#d9cdbd] bg-[#fffdf9] text-[#1e1c19] hover:border-[#b99657]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="border border-[#d9cdbd] bg-[#fffdf9] px-3.5 py-1.5 text-xs font-medium text-[#1e1c19] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#b99657]"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Clean Empty State */
                <div className="py-20 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1eadf] text-[#b99657]">
                    <Filter size={24} />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-medium text-[#1e1c19]">
                    No pieces match your selection
                  </h3>
                  <p className="mt-2 text-xs text-[#716b62]">
                    Try removing some of your active filters or exploring other collections.
                  </p>
                  {queryAttrs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="mt-6 inline-block bg-[#211f1b] px-5 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black"
                    >
                      Clear Active Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
