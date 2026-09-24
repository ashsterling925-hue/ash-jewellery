import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import { cmsApi } from "@/lib/api/cmsApi";
import { productApi } from "@/lib/api/productApi";
import { categoryApi } from "@/lib/api/categoryApi";
import { collectionApi } from "@/lib/api/collectionApi";
import MediaPickerModal from "@/admin/components/MediaPickerModal";
import { mediaApi } from "@/lib/api/mediaApi";

export default function Homepage() {
  const [activeTab, setActiveTab] = useState("hero"); // "hero" | "offers"

  // ==========================================
  // HERO SECTION STATE
  // ==========================================
  const [heroData, setHeroData] = useState({
    id: "",
    heading: "",
    subheading: "",
    mediaAssetId: null,
    mediaUrl: "",
    buttonText: "EXPLORE COLLECTIONS",
    buttonUrl: "/category/bangles",
    status: "ACTIVE",
  });
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSuccessMsg, setHeroSuccessMsg] = useState("");
  const [heroErrorMsg, setHeroErrorMsg] = useState("");
  const [isHeroMediaModalOpen, setIsHeroMediaModalOpen] = useState(false);
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);

  // Direct Hero Image Upload
  const handleDirectHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHeroImg(true);
      setHeroErrorMsg("");
      const res = await mediaApi.uploadMedia(file, {
        title: heroData.heading ? `${heroData.heading} Hero` : "Storefront Hero Banner",
        altText: heroData.heading || "Hero background",
      });

      if (res?.data) {
        setHeroData((prev) => ({
          ...prev,
          mediaAssetId: res.data.id,
          mediaUrl: res.data.url,
        }));
        setHeroSuccessMsg("Hero image uploaded and attached! Remember to save changes.");
        setTimeout(() => setHeroSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Direct hero upload failed:", err);
      setHeroErrorMsg(err.message || "Failed to upload hero image.");
    } finally {
      setUploadingHeroImg(false);
      e.target.value = "";
    }
  };

  // ==========================================
  // SPECIAL OFFERS STATE
  // ==========================================
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [isOfferMediaModalOpen, setIsOfferMediaModalOpen] = useState(false);

  // Catalogue targets for offer targeting
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);

  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    mediaAssetId: null,
    mediaUrl: "",
    targetType: "CUSTOM",
    targetId: "",
    buttonText: "SHOP NOW",
    buttonUrl: "",
    status: "ACTIVE",
    sortOrder: 0,
    startAt: "",
    endAt: "",
  });

  // Fetch Hero Configuration
  const loadHero = useCallback(async () => {
    setHeroLoading(true);
    try {
      const res = await cmsApi.getAdminHero();
      if (res?.data) {
        setHeroData({
          id: res.data.id || "",
          heading: res.data.heading || "",
          subheading: res.data.subheading || "",
          mediaAssetId: res.data.mediaAssetId || null,
          mediaUrl: res.data.mediaAsset?.url || "",
          buttonText: res.data.buttonText || "EXPLORE COLLECTIONS",
          buttonUrl: res.data.buttonUrl || "/category/bangles",
          status: res.data.status || "ACTIVE",
        });
      }
    } catch (err) {
      console.error("Failed to load hero configuration:", err);
    } finally {
      setHeroLoading(false);
    }
  }, []);

  // Fetch Special Offers
  const loadOffers = useCallback(async () => {
    setOffersLoading(true);
    try {
      const res = await cmsApi.getAdminSpecialOffers({ limit: 50 });
      if (res?.data) {
        setOffers(res.data);
      }
    } catch (err) {
      console.error("Failed to load special offers:", err);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  // Fetch Target Entities
  const loadTargets = useCallback(async () => {
    try {
      const [pRes, cRes, colRes] = await Promise.all([
        productApi.getProducts({ limit: 100, status: "Published" }).catch(() => ({ data: [] })),
        categoryApi.getCategories({ limit: 50, status: "Active" }).catch(() => ({ data: [] })),
        collectionApi.getCollections({ limit: 50, status: "Active" }).catch(() => ({ data: [] })),
      ]);
      setProductsList(pRes?.data || []);
      setCategoriesList(cRes?.data || []);
      setCollectionsList(colRes?.data || []);
    } catch (err) {
      console.error("Failed to load target entities:", err);
    }
  }, []);

  useEffect(() => {
    loadHero();
    loadOffers();
    loadTargets();
  }, [loadHero, loadOffers, loadTargets]);

  // Handle Hero Save
  const handleSaveHero = async (e) => {
    e.preventDefault();
    setHeroSaving(true);
    setHeroSuccessMsg("");
    setHeroErrorMsg("");

    try {
      const payload = {
        heading: heroData.heading.trim(),
        subheading: heroData.subheading.trim() || null,
        mediaAssetId: heroData.mediaAssetId || null,
        buttonText: heroData.buttonText.trim() || null,
        buttonUrl: heroData.buttonUrl.trim() || null,
        status: heroData.status,
      };

      const res = await cmsApi.saveHero(payload);
      if (res?.data) {
        setHeroData((prev) => ({
          ...prev,
          id: res.data.id,
          mediaUrl: res.data.mediaAsset?.url || prev.mediaUrl,
        }));
      }
      setHeroSuccessMsg("Hero configuration saved successfully!");
      setTimeout(() => setHeroSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error saving hero:", err);
      setHeroErrorMsg(err.message || "Failed to save hero configuration.");
    } finally {
      setHeroSaving(false);
    }
  };

  // Open Offer Modal for Create/Edit
  const handleOpenOfferModal = (offer = null) => {
    setOfferError("");
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        title: offer.title || "",
        description: offer.description || "",
        mediaAssetId: offer.mediaAssetId || null,
        mediaUrl: offer.mediaAsset?.url || "",
        targetType: offer.targetType || "CUSTOM",
        targetId: offer.targetId || "",
        buttonText: offer.buttonText || "SHOP NOW",
        buttonUrl: offer.buttonUrl || "",
        status: offer.status || "ACTIVE",
        sortOrder: offer.sortOrder || 0,
        startAt: offer.startAt ? new Date(offer.startAt).toISOString().slice(0, 16) : "",
        endAt: offer.endAt ? new Date(offer.endAt).toISOString().slice(0, 16) : "",
      });
    } else {
      setEditingOffer(null);
      setOfferForm({
        title: "",
        description: "",
        mediaAssetId: null,
        mediaUrl: "",
        targetType: "CUSTOM",
        targetId: "",
        buttonText: "SHOP NOW",
        buttonUrl: "",
        status: "ACTIVE",
        sortOrder: offers.length,
        startAt: "",
        endAt: "",
      });
    }
    setIsOfferModalOpen(true);
  };

  // Handle Offer Save
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    setOfferSaving(true);
    setOfferError("");

    try {
      const payload = {
        title: offerForm.title.trim(),
        description: offerForm.description.trim() || null,
        mediaAssetId: offerForm.mediaAssetId || null,
        targetType: offerForm.targetType,
        targetId: offerForm.targetType === "CUSTOM" ? null : offerForm.targetId || null,
        buttonText: offerForm.buttonText.trim() || null,
        buttonUrl: offerForm.buttonUrl.trim() || null,
        status: offerForm.status,
        sortOrder: parseInt(offerForm.sortOrder, 10) || 0,
        startAt: offerForm.startAt ? new Date(offerForm.startAt).toISOString() : null,
        endAt: offerForm.endAt ? new Date(offerForm.endAt).toISOString() : null,
      };

      if (editingOffer) {
        await cmsApi.updateSpecialOffer(editingOffer.id, payload);
      } else {
        await cmsApi.createSpecialOffer(payload);
      }

      setIsOfferModalOpen(false);
      await loadOffers();
    } catch (err) {
      console.error("Error saving special offer:", err);
      setOfferError(err.message || "Failed to save special offer.");
    } finally {
      setOfferSaving(false);
    }
  };

  // Handle Offer Delete
  const handleDeleteOffer = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete offer "${title}"?`)) return;
    try {
      await cmsApi.deleteSpecialOffer(id);
      await loadOffers();
    } catch (err) {
      alert(err.message || "Failed to delete special offer.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#b99657] uppercase">
            HOMEPAGE CMS
          </p>
          <h1 className="font-serif text-2xl font-medium tracking-wide text-[#1e1c19] sm:text-3xl">
            Homepage Content
          </h1>
          <p className="text-xs text-[#716b62]">
            Control dynamic Hero imagery, promotional headlines, and special offers in real time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeTab === "hero"
                ? "bg-[#211f1b] text-white"
                : "border border-[#d9cdbd] bg-[#fffdf9] text-[#716b62] hover:text-[#1e1c19]"
            }`}
          >
            Hero Section
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("offers")}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeTab === "offers"
                ? "bg-[#211f1b] text-white"
                : "border border-[#d9cdbd] bg-[#fffdf9] text-[#716b62] hover:text-[#1e1c19]"
            }`}
          >
            Special Offers ({offers.length})
          </button>
        </div>
      </div>

      {/* ==========================================
          TAB 1: HERO SECTION
      ========================================== */}
      {activeTab === "hero" && (
        <div className="rounded-none border border-[#e7dfd3] bg-[#fffdf9] p-6 shadow-xs">
          <div className="border-b border-[#e7dfd3] pb-4 mb-6">
            <h2 className="font-serif text-lg font-medium text-[#1e1c19]">
              Hero Banner Configuration
            </h2>
            <p className="text-xs text-[#716b62]">
              The primary hero section at the top of the storefront homepage.
            </p>
          </div>

          {heroSuccessMsg && (
            <div className="mb-6 flex items-center gap-2 rounded-none border border-[#52735b]/30 bg-[#52735b]/10 p-3 text-xs font-medium text-[#52735b]">
              <CheckCircle size={16} />
              {heroSuccessMsg}
            </div>
          )}

          {heroErrorMsg && (
            <div className="mb-6 flex items-center gap-2 rounded-none border border-[#a64b42]/30 bg-[#a64b42]/10 p-3 text-xs font-medium text-[#a64b42]">
              <AlertCircle size={16} />
              {heroErrorMsg}
            </div>
          )}

          {heroLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#b99657]" />
            </div>
          ) : (
            <form onSubmit={handleSaveHero} className="space-y-6 max-w-3xl">
              {/* Heading */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1.5">
                  Heading <span className="text-[#a64b42]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={heroData.heading}
                  onChange={(e) => setHeroData({ ...heroData, heading: e.target.value })}
                  placeholder="e.g. THE ART OF HERITAGE SILVER"
                  className="w-full border border-[#d9cdbd] bg-white px-3.5 py-2 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                />
              </div>

              {/* Subheading */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1.5">
                  Subheading / Description
                </label>
                <textarea
                  rows={3}
                  value={heroData.subheading}
                  onChange={(e) => setHeroData({ ...heroData, subheading: e.target.value })}
                  placeholder="Discover handcrafted jewellery inspired by Indian tradition..."
                  className="w-full border border-[#d9cdbd] bg-white px-3.5 py-2 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                />
              </div>

              {/* Media Image & Background Mode */}
              <div className="border border-[#e7dfd3] bg-[#fbf9f5] p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19]">
                      Hero Banner Imagery
                    </label>
                    <p className="text-[11px] text-[#716b62]">
                      Upload an image, pick from library, or leave blank to fallback to luxury colour background.
                    </p>
                  </div>

                  {heroData.mediaUrl ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#52735b]/10 text-[#52735b] border border-[#52735b]/30">
                      <CheckCircle size={12} />
                      Custom Image Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#b99657]/15 text-[#8a6e37] border border-[#b99657]/40">
                      <Sparkles size={12} />
                      Colour Background Active (Fallback)
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  {/* Visual Preview Box */}
                  <div className="relative h-36 w-64 overflow-hidden border border-[#d9cdbd] shadow-inner flex items-center justify-center shrink-0">
                    {heroData.mediaUrl ? (
                      <img
                        src={heroData.mediaUrl}
                        alt="Hero preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#fbf7f0] via-[#f4ece0] to-[#e8ddcb] flex flex-col items-center justify-center p-3 text-center">
                        <Sparkles size={24} className="text-[#b99657] mb-1.5" />
                        <span className="text-[11px] font-serif font-medium text-[#2d2924] tracking-wide">
                          Luxury Colour Background
                        </span>
                        <span className="text-[9px] text-[#8a7f72] tracking-wider uppercase mt-1">
                          Automatic Fallback Mode
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Controls */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Direct Upload Button */}
                      <label className={`inline-flex items-center gap-1.5 border border-[#211f1b] bg-[#211f1b] px-3.5 py-2 text-xs font-semibold tracking-wider text-white uppercase cursor-pointer hover:bg-black transition-colors ${uploadingHeroImg ? "opacity-60 pointer-events-none" : ""}`}>
                        {uploadingHeroImg ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Upload size={13} />
                        )}
                        {uploadingHeroImg ? "Uploading..." : "Upload New Image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleDirectHeroUpload}
                          disabled={uploadingHeroImg}
                        />
                      </label>

                      {/* Pick from Media Library */}
                      <button
                        type="button"
                        onClick={() => setIsHeroMediaModalOpen(true)}
                        className="inline-flex items-center gap-1.5 border border-[#d9cdbd] bg-white px-3.5 py-2 text-xs font-semibold tracking-wider text-[#1e1c19] uppercase hover:border-[#b99657] transition-colors"
                      >
                        <ImageIcon size={13} />
                        Media Library
                      </button>

                      {/* Remove / Fallback to Colour Background */}
                      {heroData.mediaUrl && (
                        <button
                          type="button"
                          onClick={() => setHeroData({ ...heroData, mediaAssetId: null, mediaUrl: "" })}
                          className="inline-flex items-center gap-1.5 border border-[#a64b42]/30 bg-[#a64b42]/10 px-3 py-2 text-xs font-semibold tracking-wider text-[#a64b42] uppercase hover:bg-[#a64b42]/20 transition-colors"
                        >
                          <X size={13} />
                          Remove Image (Use Colour Background)
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-[#716b62] leading-relaxed">
                      {heroData.mediaUrl
                        ? "A custom image is currently linked. Click 'Remove Image' if you wish to revert to the storefront colour background."
                        : "No image is currently linked. Storefront displays the warm heritage colour background. Upload or pick an image to display custom photography."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Button Text & URL */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={heroData.buttonText}
                    onChange={(e) => setHeroData({ ...heroData, buttonText: e.target.value })}
                    placeholder="EXPLORE COLLECTIONS"
                    className="w-full border border-[#d9cdbd] bg-white px-3.5 py-2 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1.5">
                    Button URL
                  </label>
                  <input
                    type="text"
                    value={heroData.buttonUrl}
                    onChange={(e) => setHeroData({ ...heroData, buttonUrl: e.target.value })}
                    placeholder="/category/bangles"
                    className="w-full border border-[#d9cdbd] bg-white px-3.5 py-2 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1.5">
                  Hero Status
                </label>
                <select
                  value={heroData.status}
                  onChange={(e) => setHeroData({ ...heroData, status: e.target.value })}
                  className="w-full sm:w-48 border border-[#d9cdbd] bg-white px-3.5 py-2 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <p className="mt-1 text-[11px] text-[#716b62]">
                  When inactive, storefront gracefully displays the default brand hero.
                </p>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[#e7dfd3]">
                <button
                  type="submit"
                  disabled={heroSaving}
                  className="inline-flex items-center gap-2 bg-[#211f1b] px-6 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black disabled:opacity-50"
                >
                  {heroSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Hero Configuration
                </button>
              </div>
            </form>
          )}

          {/* Media Picker for Hero */}
          <MediaPickerModal
            isOpen={isHeroMediaModalOpen}
            onClose={() => setIsHeroMediaModalOpen(false)}
            onSelect={(item) => {
              const selected = Array.isArray(item) ? item[0] : item;
              if (selected) {
                setHeroData((prev) => ({
                  ...prev,
                  mediaAssetId: selected.id,
                  mediaUrl: selected.url,
                }));
              }
              setIsHeroMediaModalOpen(false);
            }}
          />
        </div>
      )}

      {/* ==========================================
          TAB 2: SPECIAL OFFERS
      ========================================== */}
      {activeTab === "offers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#716b62]">
              Temporary campaign cards highlighting special offers, product spotlights, or festive collections.
            </p>
            <button
              type="button"
              onClick={() => handleOpenOfferModal()}
              className="inline-flex items-center gap-1.5 bg-[#211f1b] px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black"
            >
              <Plus size={14} /> Add Special Offer
            </button>
          </div>

          <div className="rounded-none border border-[#e7dfd3] bg-[#fffdf9] p-5 shadow-xs">
            {offersLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[#b99657]" />
              </div>
            ) : offers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e7dfd3] text-[10px] font-bold tracking-wider text-[#716b62] uppercase">
                      <th className="py-2.5 px-3">Image</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Target</th>
                      <th className="py-2.5 px-3">Dates</th>
                      <th className="py-2.5 px-3">Order</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1eadf]">
                    {offers.map((offer) => {
                      const img = offer.mediaAsset?.url || null;
                      return (
                        <tr key={offer.id} className="hover:bg-[#fbf8f2]/50">
                          <td className="py-2 px-3">
                            <div className="h-10 w-10 overflow-hidden bg-[#eee6da] flex items-center justify-center">
                              {img ? (
                                <img src={img} alt={offer.title} className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon size={16} className="text-[#a89f91]" />
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-medium text-[#1e1c19]">
                            {offer.title}
                            {offer.description && (
                              <p className="line-clamp-1 text-[11px] text-[#716b62]">
                                {offer.description}
                              </p>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span className="rounded bg-[#f1eadf] px-1.5 py-0.5 text-[10px] font-medium text-[#1e1c19]">
                              {offer.targetType}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[#716b62] text-[11px]">
                            {offer.startAt ? new Date(offer.startAt).toLocaleDateString() : "Anytime"}
                            {" → "}
                            {offer.endAt ? new Date(offer.endAt).toLocaleDateString() : "Ongoing"}
                          </td>
                          <td className="py-2 px-3 text-[#1e1c19]">{offer.sortOrder}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                offer.status === "ACTIVE"
                                  ? "bg-[#52735b]/10 text-[#52735b]"
                                  : "bg-[#716b62]/10 text-[#716b62]"
                              }`}
                            >
                              {offer.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenOfferModal(offer)}
                                className="p-1 text-[#716b62] hover:text-[#1e1c19]"
                                title="Edit Offer"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOffer(offer.id, offer.title)}
                                className="p-1 text-[#a64b42] hover:text-red-700"
                                title="Delete Offer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#716b62]">
                No special offers created yet. Click "Add Special Offer" to launch a campaign.
              </div>
            )}
          </div>

          {/* Add / Edit Offer Modal */}
          {isOfferModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#fffdf9] p-6 shadow-xl border border-[#e7dfd3]">
                <div className="flex items-center justify-between border-b border-[#e7dfd3] pb-3 mb-4">
                  <h3 className="font-serif text-lg font-medium text-[#1e1c19]">
                    {editingOffer ? "Edit Special Offer" : "New Special Offer"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="text-[#716b62] hover:text-[#1e1c19]"
                  >
                    <X size={18} />
                  </button>
                </div>

                {offerError && (
                  <div className="mb-4 flex items-center gap-2 rounded border border-[#a64b42]/30 bg-[#a64b42]/10 p-2.5 text-xs text-[#a64b42]">
                    <AlertCircle size={15} />
                    {offerError}
                  </div>
                )}

                <form onSubmit={handleSaveOffer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                      Title <span className="text-[#a64b42]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={offerForm.title}
                      onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                      placeholder="e.g. Festive Silver Specials"
                      className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      placeholder="Highlight special promotional details..."
                      className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                    />
                  </div>

                  {/* Media Asset */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                      Offer Image
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden border border-[#d9cdbd] bg-[#fbf8f2] flex items-center justify-center">
                        {offerForm.mediaUrl ? (
                          <img src={offerForm.mediaUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-[#716b62]" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOfferMediaModalOpen(true)}
                        className="border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs font-medium text-[#1e1c19] hover:border-[#b99657]"
                      >
                        Choose Image
                      </button>
                    </div>
                  </div>

                  {/* Target Type & Target Selector */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                        Target Type
                      </label>
                      <select
                        value={offerForm.targetType}
                        onChange={(e) => setOfferForm({ ...offerForm, targetType: e.target.value, targetId: "" })}
                        className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                      >
                        <option value="CUSTOM">Custom URL</option>
                        <option value="PRODUCT">Product</option>
                        <option value="CATEGORY">Category</option>
                        <option value="COLLECTION">Collection</option>
                      </select>
                    </div>

                    {offerForm.targetType !== "CUSTOM" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                          Select {offerForm.targetType}
                        </label>
                        <select
                          required
                          value={offerForm.targetId}
                          onChange={(e) => setOfferForm({ ...offerForm, targetId: e.target.value })}
                          className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                        >
                          <option value="">-- Choose target --</option>
                          {offerForm.targetType === "PRODUCT" &&
                            productsList.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          {offerForm.targetType === "CATEGORY" &&
                            categoriesList.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          {offerForm.targetType === "COLLECTION" &&
                            collectionsList.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Button Text & Custom URL */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={offerForm.buttonText}
                        onChange={(e) => setOfferForm({ ...offerForm, buttonText: e.target.value })}
                        placeholder="SHOP NOW"
                        className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                        Button URL (Optional for Custom)
                      </label>
                      <input
                        type="text"
                        value={offerForm.buttonUrl}
                        onChange={(e) => setOfferForm({ ...offerForm, buttonUrl: e.target.value })}
                        placeholder="/category/bangles"
                        className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                      />
                    </div>
                  </div>

                  {/* Scheduling: startAt & endAt */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                        Start Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={offerForm.startAt}
                        onChange={(e) => setOfferForm({ ...offerForm, startAt: e.target.value })}
                        className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                        End Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={offerForm.endAt}
                        onChange={(e) => setOfferForm({ ...offerForm, endAt: e.target.value })}
                        className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                      />
                    </div>
                  </div>

                  {/* Sort Order & Status */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={offerForm.sortOrder}
                        onChange={(e) => setOfferForm({ ...offerForm, sortOrder: e.target.value })}
                        className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                        Status
                      </label>
                      <select
                        value={offerForm.status}
                        onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })}
                        className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-[#e7dfd3]">
                    <button
                      type="button"
                      onClick={() => setIsOfferModalOpen(false)}
                      className="border border-[#d9cdbd] px-4 py-2 text-xs font-semibold uppercase text-[#716b62]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={offerSaving}
                      className="inline-flex items-center gap-1.5 bg-[#211f1b] px-5 py-2 text-xs font-semibold uppercase text-white hover:bg-black disabled:opacity-50"
                    >
                      {offerSaving && <Loader2 size={13} className="animate-spin" />}
                      Save Offer
                    </button>
                  </div>
                </form>
              </div>

              {/* Media Picker for Special Offer */}
              <MediaPickerModal
                isOpen={isOfferMediaModalOpen}
                onClose={() => setIsOfferMediaModalOpen(false)}
                onSelect={(item) => {
                  const selected = Array.isArray(item) ? item[0] : item;
                  if (selected) {
                    setOfferForm((prev) => ({
                      ...prev,
                      mediaAssetId: selected.id,
                      mediaUrl: selected.url,
                    }));
                  }
                  setIsOfferMediaModalOpen(false);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
