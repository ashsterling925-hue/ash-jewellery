import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { cmsApi } from "@/lib/api/cmsApi";
import { mediaApi } from "@/lib/api/mediaApi";
import MediaPickerModal from "@/admin/components/MediaPickerModal";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingBannerId, setDeletingBannerId] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [uploadingDirectImg, setUploadingDirectImg] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "Hero Banner",
    mediaAssetId: null,
    mediaUrl: "",
    targetUrl: "/catalogue",
    sortOrder: 1,
  });

  const loadBanners = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await cmsApi.getAdminBanners({ limit: 100 });
      if (res?.data) {
        const sorted = [...res.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setBanners(sorted);
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const res = await cmsApi.getAdminBanners({ limit: 100 });
        if (isMounted && res?.data) {
          const sorted = [...res.data].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          setBanners(sorted);
        }
      } catch (err) {
        console.error("Failed to load banners:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = (banner = null) => {
    setFormError("");
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || "Hero Banner",
        mediaAssetId: banner.mediaAssetId || null,
        mediaUrl: banner.mediaAsset?.url || "",
        targetUrl: banner.targetUrl || "/catalogue",
        sortOrder: banner.sortOrder ?? 1,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "Hero Banner",
        mediaAssetId: null,
        mediaUrl: "",
        targetUrl: "/catalogue",
        sortOrder: banners.length + 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleDirectBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDirectImg(true);
      const res = await mediaApi.uploadMedia(file, {
        title: "Clickable Hero Banner",
        altText: "Hero Banner",
      });
      if (res?.data) {
        setFormData((prev) => ({
          ...prev,
          mediaAssetId: res.data.id,
          mediaUrl: res.data.url,
        }));
      }
    } catch (err) {
      alert("Failed to upload image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingDirectImg(false);
      e.target.value = "";
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!formData.mediaUrl) {
      setFormError("Please select or upload a banner image.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        title: formData.title || "Hero Banner",
        mediaAssetId: formData.mediaAssetId || null,
        targetUrl: formData.targetUrl?.trim() || "/catalogue",
        position: "HERO_SLIDE",
        status: "ACTIVE",
        sortOrder: parseInt(formData.sortOrder, 10) || 1,
      };

      if (editingBanner) {
        await cmsApi.updateBanner(editingBanner.id, payload);
      } else {
        await cmsApi.createBanner(payload);
      }

      setIsModalOpen(false);
      setSuccessMsg(editingBanner ? "Banner updated successfully!" : "Clickable banner added!");
      setTimeout(() => setSuccessMsg(""), 4000);
      await loadBanners();
    } catch (err) {
      console.error("Error saving banner:", err);
      setFormError(err.message || "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this clickable banner?")) return;

    const prevBanners = [...banners];
    // Optimistic removal so user gets immediate visual response
    setBanners((prev) => prev.filter((b) => b.id !== id));
    setDeletingBannerId(id);
    setFormError("");
    setSuccessMsg("");

    try {
      await cmsApi.deleteBanner(id);
      setSuccessMsg("Clickable banner deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
      await loadBanners();
    } catch (err) {
      console.error("Failed to delete banner:", err);
      // Revert if API failed
      setBanners(prevBanners);
      setFormError(err.message || "Failed to delete banner.");
    } finally {
      setDeletingBannerId(null);
    }
  };

  const handleOrderChangeInline = async (banner, newOrder) => {
    const parsed = parseInt(newOrder, 10);
    const orderVal = isNaN(parsed) ? 1 : parsed;
    try {
      await cmsApi.updateBanner(banner.id, { sortOrder: orderVal });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, sortOrder: orderVal } : b))
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#e7dfd3] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-wide text-[#1e1c19] sm:text-3xl">
            Clickable Hero Banners
          </h1>
        </div>

        {/* Link to Page 1: Non-Clickable Homepage Hero */}
        <Link
          to="/admin/homepage"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#d9cdbd] bg-white text-[#1e1c19] hover:border-[#b99657] transition-colors text-xs font-semibold uppercase tracking-wider self-start sm:self-auto"
        >
          <ArrowLeft size={14} />
          <span>Non-Clickable Hero Photos</span>
        </Link>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded border border-[#52735b]/30 bg-[#52735b]/10 p-3 text-xs font-medium text-[#52735b]">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {formError && !isModalOpen && (
        <div className="flex items-center gap-2 rounded border border-[#a64b42]/30 bg-[#a64b42]/10 p-3 text-xs font-medium text-[#a64b42]">
          <AlertCircle size={16} />
          {formError}
        </div>
      )}

      {/* Main Container */}
      <div className="border border-[#e7dfd3] bg-[#fffdf9] p-6 shadow-xs w-full">
        {/* Action Header */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#eee5d8]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5c5448]">
            Active Clickable Banners ({banners.length})
          </span>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-1.5 bg-[#211f1b] hover:bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
          >
            <Plus size={14} /> Add Clickable Banner
          </button>
        </div>

        {/* Banners List */}
        {loading ? (
          <div className="flex h-36 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#b99657]" />
          </div>
        ) : banners.length > 0 ? (
          <div className="space-y-4">
            {banners.map((banner, idx) => {
              const img = banner.mediaAsset?.url || banner.image;
              return (
                <div
                  key={banner.id}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-[#e8ded2] bg-white rounded-none hover:border-[#b99657] transition-all"
                >
                  {/* Thumbnail Preview */}
                  <div className="w-full sm:w-64 h-32 sm:h-28 bg-[#f5ede2] overflow-hidden border border-[#e2d5c3] flex-shrink-0 flex items-center justify-center">
                    {img ? (
                      <img src={img} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={22} className="text-[#a89f91]" />
                    )}
                  </div>

                  {/* Details & Link */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-serif uppercase tracking-wider text-[#1e1c19]">
                        Banner #{idx + 1}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#b99657] bg-[#fbf5eb] border border-[#f0dfc5] px-2 py-0.5 rounded">
                        Clickable
                      </span>
                    </div>

                    {/* Destination Link */}
                    <div className="flex items-center gap-2 text-xs">
                      <LinkIcon size={13} className="text-[#b99657] flex-shrink-0" />
                      <span className="text-[#5c5448] font-medium">Destination URL:</span>
                      <span className="font-mono text-[11px] text-[#1e1c19] truncate bg-[#f8f4ec] px-2 py-0.5 border border-[#eee4d6]">
                        {banner.targetUrl || "/catalogue"}
                      </span>
                    </div>

                    {/* Order Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#5c5448]">
                        Display Order:
                      </label>
                      <input
                        type="number"
                        defaultValue={banner.sortOrder ?? idx + 1}
                        onBlur={(e) => handleOrderChangeInline(banner, e.target.value)}
                        className="w-20 border border-[#d9cdbd] bg-white px-2.5 py-1 text-xs text-[#1e1c19] text-center font-bold outline-none focus:border-[#b99657]"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center justify-end gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1eadf]">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(banner)}
                      className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[#d9cdbd] text-[#1e1c19] hover:border-[#b99657] cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      disabled={deletingBannerId === banner.id}
                      className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[#a64b42]/30 text-[#a64b42] hover:bg-[#a64b42]/10 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      {deletingBannerId === banner.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center text-xs text-[#716b62] border border-dashed border-[#d9cdbd] bg-[#fdfbf8] p-8">
            <ImageIcon size={32} className="mx-auto text-[#b99657] mb-2.5 opacity-80" />
            <p className="font-serif text-base text-[#1e1c19] mb-1 font-medium">
              No Clickable Banners Added Yet
            </p>
            <p className="text-xs text-[#8a7f72] max-w-sm mx-auto mb-4">
              Add photos that users can click on in the hero carousel to navigate directly to products or collections.
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-1.5 bg-[#211f1b] hover:bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Plus size={14} /> Add First Banner
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Banner Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-[#fffdf9] p-6 shadow-xl border border-[#e7dfd3]">
            <div className="flex items-center justify-between border-b border-[#e7dfd3] pb-3 mb-4">
              <h3 className="font-serif text-lg font-medium text-[#1e1c19]">
                {editingBanner ? "Edit Clickable Banner" : "New Clickable Banner"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#716b62] hover:text-[#1e1c19] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded border border-[#a64b42]/30 bg-[#a64b42]/10 p-2.5 text-xs text-[#a64b42]">
                <AlertCircle size={15} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-2">
                  Banner Photo <span className="text-[#a64b42]">*</span>
                </label>

                <div className="flex flex-col gap-3">
                  <div className="w-full h-36 border border-[#d9cdbd] bg-[#fbf8f2] flex items-center justify-center overflow-hidden">
                    {formData.mediaUrl ? (
                      <img src={formData.mediaUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon size={24} className="mx-auto text-[#716b62] mb-1" />
                        <span className="text-[11px] text-[#8a8277]">No image selected</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleDirectBannerUpload}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingDirectImg}
                      className="inline-flex items-center gap-1.5 border border-[#211f1b] bg-[#211f1b] hover:bg-black text-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      {uploadingDirectImg ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingDirectImg ? "Uploading..." : "Upload from Computer"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="border border-[#d9cdbd] bg-white px-3.5 py-1.5 text-xs font-medium text-[#1e1c19] hover:border-[#b99657] cursor-pointer"
                    >
                      Choose from Library
                    </button>
                  </div>
                </div>
              </div>

              {/* Clickable Destination URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                  Destination Link (URL)
                </label>
                <input
                  type="text"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="e.g. /catalogue, /category/bangles, or /search?q=silver"
                  className="w-full border border-[#d9cdbd] bg-white px-3 py-2 text-xs text-[#1e1c19] font-mono outline-none focus:border-[#b99657]"
                />
                <p className="text-[11px] text-[#8a8277] mt-1">
                  Clicking this banner in the hero slider will navigate the customer to this page.
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  className="w-24 border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] font-bold outline-none focus:border-[#b99657]"
                  min="1"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#e7dfd3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#d9cdbd] text-xs font-semibold uppercase text-[#716b62] hover:text-[#1e1c19] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-[#211f1b] hover:bg-black text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(selected) => {
          const asset = Array.isArray(selected) ? selected[0] : selected;
          if (asset?.url) {
            setFormData((prev) => ({
              ...prev,
              mediaAssetId: asset.id,
              mediaUrl: asset.url,
            }));
          }
          setIsMediaModalOpen(false);
        }}
      />
    </div>
  );
}
