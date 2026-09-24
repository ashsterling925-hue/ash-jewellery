import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { Filter, X, ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import SiteLayout from "@/storefront/components/SiteLayout";
import ProductCard from "@/storefront/components/ProductCard";
import { storefrontApi } from "@/lib/api/storefrontApi";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Price: Low to High", value: "price_asc", sortBy: "price", sortOrder: "asc" },
  { label: "Price: High to Low", value: "price_desc", sortBy: "price", sortOrder: "desc" },
  { label: "Name: A to Z", value: "name_asc", sortBy: "name", sortOrder: "asc" },
];

const PRICE_FILTER_OPTIONS = [
  { label: "Under ₹2,000", min: null, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 – ₹20,000", min: 10000, max: 20000 },
  { label: "Above ₹20,000", min: 20000, max: null },
];

const GENDER_OPTIONS = [
  { label: "Women", value: "WOMEN" },
  { label: "Men", value: "MEN" },
  { label: "Unisex", value: "UNISEX" },
];

export default function CataloguePage({ forcedCategorySlug }) {
  const { categorySlug, subcategorySlug, collectionSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const querySearch = searchParams.get("q") || "";
  const querySort = searchParams.get("sort") || "newest";
  const queryPage = parseInt(searchParams.get("page") || "1", 10);
  const activeSubcategorySlug = searchParams.get("subcategory") || subcategorySlug;
  const queryMinPrice = searchParams.get("minPrice") || "";
  const queryMaxPrice = searchParams.get("maxPrice") || "";
  const queryGender = searchParams.get("gender") || "";

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
  const [categoryData, setCategoryData] = useState(null);
  const [activeSubcatObj, setActiveSubcatObj] = useState(null);

  // State
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedFilterIds, setExpandedFilterIds] = useState(new Set());
  const [isPriceFilterExpanded, setIsPriceFilterExpanded] = useState(true);
  const [isGenderFilterExpanded, setIsGenderFilterExpanded] = useState(true);

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
            setCategoryData(res.data);

            if (activeSubcategorySlug) {
              let matchingSubcat = res.data.subcategories?.find(
                (s) => s.slug === activeSubcategorySlug || s.id === activeSubcategorySlug
              );

              if (!matchingSubcat) {
                try {
                  const subRes = await storefrontApi.getSubcategoryBySlug(activeSubcategorySlug);
                  if (subRes?.data) {
                    matchingSubcat = subRes.data;
                  }
                } catch {
                  // ignore
                }
              }

              if (matchingSubcat) {
                setActiveSubcatObj(matchingSubcat);
                const hasCatInName = matchingSubcat.name.toLowerCase().includes(res.data.name.toLowerCase());
                const displayName = hasCatInName ? matchingSubcat.name : `${matchingSubcat.name} ${res.data.name}`;
                setContextData({
                  title: displayName,
                  description: matchingSubcat.description || `Handcrafted ${matchingSubcat.name} designs in pure 925 sterling silver under ${res.data.name}.`,
                  eyebrow: `${res.data.name.toUpperCase()} / ${matchingSubcat.name.toUpperCase()}`,
                });
                return;
              }
            }

            setActiveSubcatObj(null);
            setContextData({
              title: res.data.name,
              description: res.data.description || "Discover handcrafted silver designs created with precision and care.",
              eyebrow: "CATEGORY",
            });
          }
        } else if (activeSubcategorySlug) {
          const res = await storefrontApi.getSubcategoryBySlug(activeSubcategorySlug);
          if (isMounted && res?.data) {
            setActiveSubcatObj(res.data);
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
  }, [activeCategorySlug, subcategorySlug, activeSubcategorySlug, collectionSlug, isSearchPage, querySearch]);

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
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
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
        if (queryMinPrice) params.minPrice = queryMinPrice;
        if (queryMaxPrice) params.maxPrice = queryMaxPrice;
        if (queryGender) params.gender = queryGender;
        if (queryAttrs.length > 0) params.attributeValueIds = queryAttrs.join(",");

        const response = await storefrontApi.getProducts(params);
        if (isMounted && response?.data) {
          setProducts(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [activeCategorySlug, activeSubcategorySlug, collectionSlug, querySearch, querySort, queryPage, queryAttrs, queryMinPrice, queryMaxPrice, queryGender]);

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

  const handleSetPriceRange = (min, max) => {
    updateUrlParam((params) => {
      if (min !== null && min !== undefined && min !== "") {
        params.set("minPrice", String(min));
      } else {
        params.delete("minPrice");
      }
      if (max !== null && max !== undefined && max !== "") {
        params.set("maxPrice", String(max));
      } else {
        params.delete("maxPrice");
      }
      params.set("page", "1");
    });
  };

  const handleClearPriceFilter = () => {
    updateUrlParam((params) => {
      params.delete("minPrice");
      params.delete("maxPrice");
      params.set("page", "1");
    });
  };

  const handleSetGender = (genderVal) => {
    updateUrlParam((params) => {
      if (params.get("gender")?.toUpperCase() === genderVal.toUpperCase()) {
        params.delete("gender");
      } else {
        params.set("gender", genderVal);
      }
      params.set("page", "1");
    });
  };

  const handleClearGenderFilter = () => {
    updateUrlParam((params) => {
      params.delete("gender");
      params.set("page", "1");
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

  const handleSelectSubcategory = (subSlug) => {
    updateUrlParam((params) => {
      if (subSlug) {
        params.set("subcategory", subSlug);
      } else {
        params.delete("subcategory");
      }
      params.set("page", "1");
    });
  };

  const handleClearAllFilters = () => {
    updateUrlParam((params) => {
      params.delete("attrs");
      params.delete("attributeValueIds");
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("gender");
      params.delete("subcategory");
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

  const hasPriceFilter = Boolean(queryMinPrice || queryMaxPrice);
  const priceFilterLabel = queryMinPrice && queryMaxPrice
    ? `₹${Number(queryMinPrice).toLocaleString("en-IN")} – ₹${Number(queryMaxPrice).toLocaleString("en-IN")}`
    : queryMinPrice
    ? `Above ₹${Number(queryMinPrice).toLocaleString("en-IN")}`
    : queryMaxPrice
    ? `Under ₹${Number(queryMaxPrice).toLocaleString("en-IN")}`
    : null;

  return (
    <SiteLayout>
      <div className="bg-[#fbf8f2] min-h-screen py-4 sm:py-6">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Luxury Showcase Header Banner (Full-Width, Compact Height) */}
          <div className="relative mb-4 w-full overflow-hidden rounded-xl border border-[#e8ded2] bg-gradient-to-b from-[#fffdfa] via-[#fbf8f2] to-[#f8f3ea] px-4 py-4 sm:px-8 sm:py-5 text-center shadow-xs">
            {/* Subtle decorative glow corner orbs */}
            <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-[#b99657]/8 blur-xl" />
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-[#8B263E]/6 blur-xl" />

            {/* Title */}
            <h1 className="relative font-serif text-2xl sm:text-3xl font-medium tracking-wide text-[#1c1a17] leading-snug max-w-2xl mx-auto">
              {contextData.title}
            </h1>

            {/* Description */}
            {contextData.description && (
              <p className="relative mx-auto mt-1 max-w-xl text-xs leading-relaxed text-[#685f54] font-light">
                {contextData.description}
              </p>
            )}

            {/* Subcategory Pills Strip */}
            {categoryData?.subcategories?.length > 0 && (
              <div className="relative mt-2.5 inline-flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white/80 backdrop-blur-xs rounded-full border border-[#e8ded2] shadow-2xs max-w-full">
                {/* All Category Pill */}
                <button
                  type="button"
                  onClick={() => handleSelectSubcategory(null)}
                  className={`group relative cursor-pointer px-3.5 py-1 text-xs font-serif rounded-full transition-all duration-200 border flex items-center gap-1.5 ${
                    !activeSubcategorySlug
                      ? "bg-[#7e1c2e] text-white border-[#7e1c2e] shadow-xs font-semibold"
                      : "bg-transparent text-[#4a4238] border-transparent hover:border-[#dfd5c7] hover:text-[#1c1a17] hover:bg-white/90"
                  }`}
                >
                  {!activeSubcategorySlug && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f5d799]" />
                  )}
                  <span>All {categoryData.name}</span>
                </button>

                {/* Individual Subcategories */}
                {categoryData.subcategories.map((sub) => {
                  const isSelected =
                    activeSubcategorySlug === sub.slug || activeSubcategorySlug === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubcategory(sub.slug)}
                      className={`group relative cursor-pointer px-3.5 py-1 text-xs font-serif rounded-full transition-all duration-200 border flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#7e1c2e] text-white border-[#7e1c2e] shadow-xs font-semibold"
                          : "bg-transparent text-[#4a4238] border-transparent hover:border-[#dfd5c7] hover:text-[#1c1a17] hover:bg-white/90"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f5d799]" />
                      )}
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Utility Bar: Count, Mobile Filter Trigger, Sort Dropdown */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e8ded2] bg-[#fffdf9] px-5 py-3 shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-[#d9cdbd] bg-[#fbf8f2] px-3.5 py-1.5 text-xs font-medium text-[#1e1c19] hover:border-[#b99657] transition-colors lg:hidden cursor-pointer"
              >
                <SlidersHorizontal size={14} className="text-[#8B263E]" />
                <span>Filters</span>
                {queryAttrs.length > 0 && (
                  <span className="rounded-full bg-[#8B263E] px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {queryAttrs.length}
                  </span>
                )}
              </button>

              {/* Count Indicator */}
              <div className="flex items-center gap-2 text-xs text-[#5f574d]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b99657]" />
                <span>
                  {loading ? (
                    "Loading pieces..."
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-[#1e1c19]">
                        {products.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-[#1e1c19]">
                        {pagination.total}
                      </span>{" "}
                      {pagination.total === 1 ? "piece" : "pieces"}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Sort Select with Custom Styling */}
            <div className="flex items-center gap-2.5">
              <label htmlFor="catalogue-sort" className="text-xs font-medium text-[#716b62]">
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="catalogue-sort"
                  value={querySort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none rounded-lg border border-[#d9cdbd] bg-white pl-3.5 pr-8 py-1.5 text-xs font-medium text-[#1e1c19] outline-none transition-all hover:border-[#b99657] focus:border-[#8B263E] focus:ring-1 focus:ring-[#8B263E]/20 cursor-pointer shadow-2xs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a7f72]"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {(hasPriceFilter || Boolean(activeSubcategorySlug) || Boolean(queryGender) || queryAttrs.length > 0) && (
            <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-xl border border-[#eedfd8] bg-[#fdfaf8] px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7f72] mr-1">
                Active Filters:
              </span>

              {activeSubcategorySlug && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e8c8c2] pl-3 pr-2 py-1 text-xs text-[#7e1c2e] font-medium shadow-2xs">
                  <span>
                    Subcategory:{" "}
                    <strong>{activeSubcatObj?.name || activeSubcategorySlug}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectSubcategory(null)}
                    className="w-4 h-4 rounded-full bg-[#f9e9e6] hover:bg-[#7e1c2e] hover:text-white flex items-center justify-center text-[#7e1c2e] transition-colors cursor-pointer"
                    aria-label="Remove subcategory filter"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}

              {queryGender && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#dfd4c5] pl-3 pr-2 py-1 text-xs text-[#1e1c19] font-medium shadow-2xs">
                  <span>
                    Gender:{" "}
                    <strong>
                      {queryGender.toUpperCase() === "WOMEN"
                        ? "Women"
                        : queryGender.toUpperCase() === "MEN"
                        ? "Men"
                        : "Unisex"}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearGenderFilter}
                    className="w-4 h-4 rounded-full bg-[#f4ede3] hover:bg-[#1e1c19] hover:text-white flex items-center justify-center text-[#716b62] transition-colors cursor-pointer"
                    aria-label="Remove gender filter"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}

              {hasPriceFilter && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#dfd4c5] pl-3 pr-2 py-1 text-xs text-[#1e1c19] font-medium shadow-2xs">
                  <span>
                    Price: <strong>{priceFilterLabel}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearPriceFilter}
                    className="w-4 h-4 rounded-full bg-[#f4ede3] hover:bg-[#1e1c19] hover:text-white flex items-center justify-center text-[#716b62] transition-colors cursor-pointer"
                    aria-label="Remove price filter"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs font-semibold text-[#7e1c2e] hover:underline ml-auto cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Main Layout: Filter Sidebar + Product Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6 rounded-none border border-[#e7dfd3] bg-[#fffdf9] p-5">
                <div className="flex items-center justify-between border-b border-[#e7dfd3] pb-3">
                  <h2 className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#1e1c19] uppercase">
                    <Filter size={14} className="text-[#8B263E]" /> Filter By
                  </h2>
                  {(hasPriceFilter || Boolean(queryGender) || queryAttrs.length > 0) && (
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="text-[11px] font-medium text-[#8B263E] hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Gender Filter Section (Women / Men / Unisex) */}
                <div className="border-b border-[#f1eadf] pb-4">
                  <button
                    type="button"
                    onClick={() => setIsGenderFilterExpanded((prev) => !prev)}
                    className="flex w-full items-center justify-between py-1 text-left text-xs font-semibold tracking-wider text-[#1e1c19] uppercase cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      Gender
                      {queryGender && (
                        <span className="text-[10px] font-normal text-[#8B263E]">(1)</span>
                      )}
                    </span>
                    {isGenderFilterExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {isGenderFilterExpanded && (
                    <div className="mt-2.5 space-y-1.5">
                      {GENDER_OPTIONS.map((opt) => {
                        const isSelected = queryGender.toUpperCase() === opt.value.toUpperCase();
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSetGender(opt.value)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#fbeee8] text-[#8B263E] font-medium"
                                : "text-[#716b62] hover:bg-[#f6eee2] hover:text-[#1e1c19]"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <span className="text-[10px] text-[#8B263E]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Price Range Filter Section */}
                <div className="border-b border-[#f1eadf] pb-4">
                  <button
                    type="button"
                    onClick={() => setIsPriceFilterExpanded((prev) => !prev)}
                    className="flex w-full items-center justify-between py-1 text-left text-xs font-semibold tracking-wider text-[#1e1c19] uppercase cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      Price
                      {hasPriceFilter && (
                        <span className="text-[10px] font-normal text-[#8B263E]">(1)</span>
                      )}
                    </span>
                    {isPriceFilterExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {isPriceFilterExpanded && (
                    <div className="mt-2.5 space-y-1.5">
                      {PRICE_FILTER_OPTIONS.map((opt) => {
                        const isSelected =
                          String(opt.min || "") === String(queryMinPrice || "") &&
                          String(opt.max || "") === String(queryMaxPrice || "");
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                handleClearPriceFilter();
                              } else {
                                handleSetPriceRange(opt.min, opt.max);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#fbeee8] text-[#8B263E] font-medium"
                                : "text-[#716b62] hover:bg-[#f6eee2] hover:text-[#1e1c19]"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <span className="text-[10px] text-[#8B263E]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Filterable Attributes List */}
                {filters.length > 0 &&
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
                              <span className="text-[10px] font-normal text-[#8B263E]">
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
                                    className="h-3.5 w-3.5 accent-[#8B263E]"
                                  />
                                  <span>{val.value}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                    {/* Mobile Gender Filters */}
                    <div className="border-b border-[#f1eadf] pb-4">
                      <p className="mb-2 text-xs font-semibold tracking-wider text-[#1e1c19] uppercase flex items-center justify-between">
                        <span>Gender</span>
                        {queryGender && (
                          <button
                            type="button"
                            onClick={handleClearGenderFilter}
                            className="text-[10px] text-[#8B263E] lowercase font-normal hover:underline cursor-pointer"
                          >
                            clear
                          </button>
                        )}
                      </p>
                      <div className="space-y-1.5">
                        {GENDER_OPTIONS.map((opt) => {
                          const isSelected = queryGender.toUpperCase() === opt.value.toUpperCase();
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSetGender(opt.value)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#fbeee8] text-[#8B263E] font-medium"
                                  : "text-[#716b62] hover:bg-[#f6eee2] hover:text-[#1e1c19]"
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <span className="text-[10px] text-[#8B263E]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile Price Filters */}
                    <div className="border-b border-[#f1eadf] pb-4">
                      <p className="mb-2 text-xs font-semibold tracking-wider text-[#1e1c19] uppercase">
                        Price
                      </p>
                      <div className="space-y-1.5">
                        {PRICE_FILTER_OPTIONS.map((opt) => {
                          const isSelected =
                            String(opt.min || "") === String(queryMinPrice || "") &&
                            String(opt.max || "") === String(queryMaxPrice || "");
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  handleClearPriceFilter();
                                } else {
                                  handleSetPriceRange(opt.min, opt.max);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#fbeee8] text-[#8B263E] font-medium"
                                  : "text-[#716b62] hover:bg-[#f6eee2] hover:text-[#1e1c19]"
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <span className="text-[10px] text-[#8B263E]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

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
                                  className="h-3.5 w-3.5 accent-[#8B263E]"
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
                // Luxury Shimmer Skeletons
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-[#e7dfd3] bg-[#fffdf9] p-3 flex flex-col gap-2.5">
                      <div className="aspect-[0.88/1] w-full luxury-shimmer" />
                      <div className="mt-1 h-3 w-16 luxury-shimmer-subtle mx-auto rounded-xs" />
                      <div className="h-4 w-32 luxury-shimmer-subtle mx-auto rounded-xs" />
                      <div className="h-3.5 w-14 luxury-shimmer-subtle mx-auto rounded-xs" />
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
