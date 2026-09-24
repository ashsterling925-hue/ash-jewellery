import { useState, useEffect, useMemo } from "react";
import {
  Save,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  LayoutGrid,
  Info,
} from "lucide-react";
import { cmsApi } from "@/lib/api/cmsApi";

export default function SignatureCollectionsManager() {
  const [categories, setCategories] = useState([]);
  const [featuredCategoryId, setFeaturedCategoryId] = useState("");
  const [wideCategoryId, setWideCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load configuration
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await cmsApi.getAdminSignatureCollections();
        if (isMounted && res?.data) {
          const cats = res.data.categories || [];
          setCategories(cats);

          const cfg = res.data.configuration || {};
          setFeaturedCategoryId(cfg.featuredCategoryId || (cats[0]?.id ?? ""));

          const candidateWide =
            cfg.wideCategoryId ||
            cats.find((c) => c.id !== (cfg.featuredCategoryId || cats[0]?.id))?.id ||
            "";
          setWideCategoryId(candidateWide);

          setIsDirty(false);
        }
      } catch (err) {
        console.error("Failed to load signature collections config:", err);
        if (isMounted) setErrorMsg("Failed to load signature collections. Please refresh.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Move Category Up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setCategories((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
    setIsDirty(true);
  };

  // Move Category Down
  const handleMoveDown = (index) => {
    if (index >= categories.length - 1) return;
    setCategories((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
    setIsDirty(true);
  };

  // Change Featured Category
  const handleFeaturedChange = (e) => {
    const newFeaturedId = e.target.value;
    setFeaturedCategoryId(newFeaturedId);

    // If wide category matches newly selected featured, auto-switch wide category
    if (newFeaturedId && wideCategoryId === newFeaturedId) {
      const fallbackWide = categories.find((c) => c.id !== newFeaturedId)?.id || "";
      setWideCategoryId(fallbackWide);
    }
    setIsDirty(true);
  };

  // Change Wide Category
  const handleWideChange = (e) => {
    const newWideId = e.target.value;
    if (newWideId === featuredCategoryId) {
      setErrorMsg("Featured Category and Wide Category cannot be the same.");
      return;
    }
    setErrorMsg("");
    setWideCategoryId(newWideId);
    setIsDirty(true);
  };

  // Save All Changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const orderedCategoryIds = categories.map((c) => c.id);

      const payload = {
        orderedCategoryIds,
        featuredCategoryId: categories.length >= 3 ? featuredCategoryId : null,
        wideCategoryId: categories.length >= 4 ? wideCategoryId : null,
      };

      const res = await cmsApi.saveSignatureCollections(payload);
      if (res?.data) {
        setIsDirty(false);
        setSuccessMsg("Signature Collections configuration saved successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to save signature collections:", err);
      setErrorMsg(err.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Layout resolution calculations for visual preview
  const layoutPreview = useMemo(() => {
    const count = categories.length;
    if (count === 0) return { type: "EMPTY" };
    if (count === 1) return { type: "SINGLE", card: categories[0] };
    if (count === 2) return { type: "TWO_EQUAL", cards: categories.slice(0, 2) };

    const featured =
      categories.find((c) => c.id === featuredCategoryId) || categories[0];

    if (count === 3) {
      const small = categories.filter((c) => c.id !== featured.id).slice(0, 2);
      return { type: "THREE", featured, small };
    }

    // 4 or more categories
    const wide =
      categories.find((c) => c.id === wideCategoryId && c.id !== featured.id) ||
      categories.find((c) => c.id !== featured.id) ||
      categories[1];

    const remaining = categories.filter(
      (c) => c.id !== featured.id && c.id !== wide?.id
    );
    const small = remaining.slice(0, 2);
    const extra = remaining.slice(2);

    return { type: count === 4 ? "FOUR" : "FIVE_PLUS", featured, wide, small, extra };
  }, [categories, featuredCategoryId, wideCategoryId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border border-[#e7dfd3] bg-[#fffdf9] p-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-[#716b62]">
          <Loader2 className="animate-spin text-[#d28a25]" size={20} />
          <span>Loading Signature Collections...</span>
        </div>
      </div>
    );
  }

  const categoryCount = categories.length;

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded border border-[#52735b]/30 bg-[#52735b]/10 p-3 text-xs font-medium text-[#52735b]">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded border border-[#a64b42]/30 bg-[#a64b42]/10 p-3 text-xs font-medium text-[#a64b42]">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="border border-[#e7dfd3] bg-[#fffdf9] p-6 shadow-xs">
        {/* Top Header & Save Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eee5d8] pb-5 mb-6">
          <div>
            <h2 className="font-serif text-lg font-medium text-[#1e1c19]">
              Homepage Signature Collections
            </h2>
            <p className="text-xs text-[#716b62] mt-0.5">
              The storefront automatically selects the best luxury layout based on your active category count ({categoryCount} active).
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              isDirty
                ? "bg-[#d28a25] hover:bg-[#b87317] text-white shadow-xs cursor-pointer"
                : "bg-[#e5ddd2] text-[#938a7c] cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Layout Badge */}
        <div className="mb-6 p-4 rounded-sm border border-[#e8ded2] bg-[#fbf8f2] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f4ece0] border border-[#dfd2be] flex items-center justify-center text-[#d28a25]">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#1e1c19]">
                Current Layout Mode:{" "}
                <span className="text-[#8B263E]">
                  {categoryCount === 1 && "Case 1 — Single Large Centered Card"}
                  {categoryCount === 2 && "Case 2 — Two Equal Wide Cards"}
                  {categoryCount === 3 && "Case 3 — Featured Large + 2 Stacked Cards"}
                  {categoryCount === 4 && "Case 4 — Asymmetric 4-Card Luxury Showcase"}
                  {categoryCount >= 5 && `Case 5 — Asymmetric 4-Card Showcase + ${categoryCount - 4} in 4-Column Grid`}
                  {categoryCount === 0 && "No Active Categories"}
                </span>
              </p>
              <p className="text-[11px] text-[#716b62] mt-0.5">
                {categoryCount === 1 && "Fills the container centrally without awkward blank space."}
                {categoryCount === 2 && "Both categories share equal emphasis across the width. Controls hidden."}
                {categoryCount === 3 && "Configure which category gets the prominent Featured / Large slot on the left."}
                {categoryCount === 4 && "Configure the Featured / Large slot and Wide slot. The other 2 are automatically placed."}
                {categoryCount >= 5 && "First 4 categories use the luxury showcase; remaining categories display in a clean 4-column card grid."}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Selectors */}
        {categoryCount >= 3 && (
          <div className="mb-8 p-5 border border-[#e8dfd3] bg-[#fff] rounded-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e1c19] flex items-center gap-2">
              <Sparkles size={14} className="text-[#d28a25]" />
              Prominent Category Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Featured Category Dropdown (Shown for 3+ categories) */}
              <div>
                <label className="block text-xs font-semibold text-[#1e1c19] mb-1.5 uppercase tracking-wide">
                  Featured / Large Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={featuredCategoryId}
                  onChange={handleFeaturedChange}
                  className="w-full h-10 px-3 border border-[#dfd4c5] bg-[#fbf9f5] text-xs font-medium text-[#1e1c19] focus:outline-none focus:border-[#d28a25]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#716b62] mt-1">
                  Takes the tall, prominent primary spot on the left.
                </p>
              </div>

              {/* Wide Category Dropdown (Shown only for 4+ categories) */}
              {categoryCount >= 4 && (
                <div>
                  <label className="block text-xs font-semibold text-[#1e1c19] mb-1.5 uppercase tracking-wide">
                    Wide Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={wideCategoryId}
                    onChange={handleWideChange}
                    className="w-full h-10 px-3 border border-[#dfd4c5] bg-[#fbf9f5] text-xs font-medium text-[#1e1c19] focus:outline-none focus:border-[#d28a25]"
                  >
                    {categories
                      .filter((c) => c.id !== featuredCategoryId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-[#716b62] mt-1">
                    Takes the wide horizontal top spot beside the featured category.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#8a7f72] flex items-center gap-1.5 pt-1 border-t border-[#f4ede3]">
              <Info size={13} className="text-[#d28a25] flex-shrink-0" />
              <span>
                Remaining categories are automatically calculated in display order without requiring manual placement for every spot.
              </span>
            </p>
          </div>
        )}

        {/* Category Display Order List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e1c19]">
              Active Categories & Display Order
            </h3>
            <span className="text-[11px] text-[#716b62]">
              Use ↑ ↓ buttons to reorder categories
            </span>
          </div>

          <div className="divide-y divide-[#eee5d8] border border-[#e8dfd3] bg-[#fff]">
            {categories.map((cat, index) => {
              const imgUrl = cat.mediaAsset?.url || cat.image;
              const isFeatured = cat.id === featuredCategoryId && categoryCount >= 3;
              const isWide = cat.id === wideCategoryId && categoryCount >= 4;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 hover:bg-[#fbf9f5] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-[#8a7f72] w-6">
                      {index + 1}.
                    </span>

                    <div className="w-11 h-11 bg-[#f4ece0] border border-[#e2d5c3] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles size={16} className="text-[#b99657]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1e1c19] truncate flex items-center gap-2">
                        <span>{cat.name}</span>
                        {isFeatured && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#fbeee8] text-[#8B263E] border border-[#f3d7ce]">
                            Featured Large
                          </span>
                        )}
                        {isWide && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#f5ede2] text-[#d28a25] border border-[#ebd7be]">
                            Wide
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#8a7f72] font-mono">
                        /category/{cat.slug}
                      </p>
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="w-8 h-8 rounded border border-[#dfd4c5] bg-white flex items-center justify-center text-[#554e44] hover:bg-[#1e1c19] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === categories.length - 1}
                      className="w-8 h-8 rounded border border-[#dfd4c5] bg-white flex items-center justify-center text-[#554e44] hover:bg-[#1e1c19] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8a8277]">
                No active categories found. Please activate categories in Catalogue &gt; Categories.
              </div>
            )}
          </div>
        </div>

        {/* Visual Slot Layout Map Preview */}
        {categories.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#eee5d8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e1c19] mb-3 flex items-center gap-2">
              <LayoutGrid size={14} className="text-[#8B263E]" />
              Storefront Layout Diagram
            </h3>

            {layoutPreview.type === "SINGLE" && (
              <div className="border border-dashed border-[#c5a265] bg-[#faf6ef] p-6 text-center rounded-sm">
                <span className="text-[10px] font-bold uppercase text-[#8B263E] tracking-widest block mb-1">
                  1 Large Centered Card
                </span>
                <span className="font-serif text-sm font-semibold text-[#1e1c19]">
                  {layoutPreview.card?.name}
                </span>
              </div>
            )}

            {layoutPreview.type === "TWO_EQUAL" && (
              <div className="grid grid-cols-2 gap-4">
                {layoutPreview.cards.map((c, i) => (
                  <div
                    key={c.id}
                    className="border border-dashed border-[#c5a265] bg-[#faf6ef] p-6 text-center rounded-sm"
                  >
                    <span className="text-[10px] font-bold uppercase text-[#8B263E] tracking-widest block mb-1">
                      Equal Card {i + 1}
                    </span>
                    <span className="font-serif text-sm font-semibold text-[#1e1c19]">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {layoutPreview.type === "THREE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-dashed border-[#8B263E] bg-[#fcf5f3] p-8 text-center rounded-sm flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase text-[#8B263E] tracking-widest block mb-1">
                    Featured Large Card
                  </span>
                  <span className="font-serif text-base font-semibold text-[#1e1c19]">
                    {layoutPreview.featured?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {layoutPreview.small.map((c, i) => (
                    <div
                      key={c.id}
                      className="border border-dashed border-[#c5a265] bg-[#faf6ef] p-4 text-center rounded-sm flex-1 flex flex-col justify-center"
                    >
                      <span className="text-[10px] font-bold uppercase text-[#716b62] tracking-widest block mb-0.5">
                        Stacked Card {i + 1}
                      </span>
                      <span className="font-serif text-xs font-semibold text-[#1e1c19]">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(layoutPreview.type === "FOUR" || layoutPreview.type === "FIVE_PLUS") && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Column: Featured Large */}
                  <div className="md:col-span-5 border border-dashed border-[#8B263E] bg-[#fcf5f3] p-8 text-center rounded-sm flex flex-col justify-center min-h-[160px]">
                    <span className="text-[10px] font-bold uppercase text-[#8B263E] tracking-widest block mb-1">
                      Featured Large Card
                    </span>
                    <span className="font-serif text-base font-semibold text-[#1e1c19]">
                      {layoutPreview.featured?.name}
                    </span>
                  </div>

                  {/* Right Column: Wide + 2 Small */}
                  <div className="md:col-span-7 flex flex-col gap-3">
                    {/* Wide */}
                    <div className="border border-dashed border-[#d28a25] bg-[#fdfaf5] p-4 text-center rounded-sm">
                      <span className="text-[10px] font-bold uppercase text-[#d28a25] tracking-widest block mb-0.5">
                        Wide Card
                      </span>
                      <span className="font-serif text-xs font-semibold text-[#1e1c19]">
                        {layoutPreview.wide?.name}
                      </span>
                    </div>

                    {/* 2 Small */}
                    <div className="grid grid-cols-2 gap-3">
                      {layoutPreview.small.map((c, i) => (
                        <div
                          key={c.id}
                          className="border border-dashed border-[#c5a265] bg-[#faf6ef] p-3 text-center rounded-sm"
                        >
                          <span className="text-[10px] font-bold uppercase text-[#716b62] tracking-widest block mb-0.5">
                            Small Card {i + 1}
                          </span>
                          <span className="font-serif text-xs font-semibold text-[#1e1c19]">
                            {c.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Remaining Categories Grid */}
                {layoutPreview.type === "FIVE_PLUS" && layoutPreview.extra.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase text-[#716b62] tracking-wider block mb-2">
                      Remaining Categories (4-Column Grid Below):
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {layoutPreview.extra.map((c) => (
                        <div
                          key={c.id}
                          className="border border-[#e7dfd3] bg-[#fff] p-2.5 text-center text-xs font-serif font-medium text-[#1e1c19]"
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
