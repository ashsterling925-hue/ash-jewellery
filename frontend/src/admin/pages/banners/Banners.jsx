import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  AlertCircle,
  Filter,
} from "lucide-react";
import { cmsApi } from "@/lib/api/cmsApi";
import MediaPickerModal from "@/admin/components/MediaPickerModal";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    mediaAssetId: null,
    mediaUrl: "",
    targetUrl: "",
    position: "HOME_PROMOTION",
    status: "ACTIVE",
    sortOrder: 0,
    startAt: "",
    endAt: "",
  });

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsApi.getAdminBanners({
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      if (res?.data) {
        setBanners(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleOpenModal = (banner = null) => {
    setFormError("");
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        mediaAssetId: banner.mediaAssetId || null,
        mediaUrl: banner.mediaAsset?.url || "",
        targetUrl: banner.targetUrl || "",
        position: banner.position || "HOME_PROMOTION",
        status: banner.status || "ACTIVE",
        sortOrder: banner.sortOrder || 0,
        startAt: banner.startAt ? new Date(banner.startAt).toISOString().slice(0, 16) : "",
        endAt: banner.endAt ? new Date(banner.endAt).toISOString().slice(0, 16) : "",
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        mediaAssetId: null,
        mediaUrl: "",
        targetUrl: "",
        position: "HOME_PROMOTION",
        status: "ACTIVE",
        sortOrder: banners.length,
        startAt: "",
        endAt: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        mediaAssetId: formData.mediaAssetId || null,
        targetUrl: formData.targetUrl.trim() || null,
        position: formData.position.trim() || "HOME_PROMOTION",
        status: formData.status,
        sortOrder: parseInt(formData.sortOrder, 10) || 0,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : null,
      };

      if (editingBanner) {
        await cmsApi.updateBanner(editingBanner.id, payload);
      } else {
        await cmsApi.createBanner(payload);
      }

      setIsModalOpen(false);
      await loadBanners();
    } catch (err) {
      console.error("Error saving banner:", err);
      setFormError(err.message || "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      await cmsApi.deleteBanner(id);
      await loadBanners();
    } catch (err) {
      alert(err.message || "Failed to delete banner.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#b99657] uppercase">
            CONTENT / BANNERS
          </p>
          <h1 className="font-serif text-2xl font-medium tracking-wide text-[#1e1c19] sm:text-3xl">
            Promotional Banners
          </h1>
          <p className="text-xs text-[#716b62]">
            Manage advertisements, promotional strips, scheduling, and ordering.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 bg-[#211f1b] px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black self-start sm:self-auto"
        >
          <Plus size={14} /> Add Banner
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-none border border-[#e7dfd3] bg-[#fffdf9] p-3 shadow-xs">
        <div className="flex items-center gap-2 border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs">
          <Search size={14} className="text-[#716b62]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banners..."
            className="w-48 bg-transparent text-xs text-[#1e1c19] outline-none placeholder:text-[#8a8277]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter size={13} className="text-[#716b62]" />
          <span className="text-[#716b62]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#d9cdbd] bg-white px-2.5 py-1 text-xs text-[#1e1c19] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Banners Table Card */}
      <div className="rounded-none border border-[#e7dfd3] bg-[#fffdf9] p-5 shadow-xs">
        {loading ? (
          <div className="flex h-36 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#b99657]" />
          </div>
        ) : banners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e7dfd3] text-[10px] font-bold tracking-wider text-[#716b62] uppercase">
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Title & Subtitle</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3">Target URL</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1eadf]">
                {banners.map((banner) => {
                  const img = banner.mediaAsset?.url || null;
                  return (
                    <tr key={banner.id} className="hover:bg-[#fbf8f2]/50">
                      <td className="py-2.5 px-3">
                        <div className="h-12 w-20 overflow-hidden bg-[#eee6da] flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={banner.title} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-[#a89f91]" />
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#1e1c19]">
                        {banner.title}
                        {banner.subtitle && (
                          <p className="text-[11px] text-[#716b62]">{banner.subtitle}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="rounded bg-[#f1eadf] px-1.5 py-0.5 text-[10px] font-medium text-[#1e1c19]">
                          {banner.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#716b62] font-mono text-[11px]">
                        {banner.targetUrl || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-[#716b62] text-[11px]">
                        {banner.startAt ? new Date(banner.startAt).toLocaleDateString() : "Immediate"}
                        {" → "}
                        {banner.endAt ? new Date(banner.endAt).toLocaleDateString() : "Indefinite"}
                      </td>
                      <td className="py-2.5 px-3 text-[#1e1c19]">{banner.sortOrder}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                            banner.status === "ACTIVE"
                              ? "bg-[#52735b]/10 text-[#52735b]"
                              : "bg-[#716b62]/10 text-[#716b62]"
                          }`}
                        >
                          {banner.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(banner)}
                            className="p-1 text-[#716b62] hover:text-[#1e1c19]"
                            title="Edit Banner"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id, banner.title)}
                            className="p-1 text-[#a64b42] hover:text-red-700"
                            title="Delete Banner"
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
            No promotional banners found. Click "Add Banner" to schedule a promotion.
          </div>
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#fffdf9] p-6 shadow-xl border border-[#e7dfd3]">
            <div className="flex items-center justify-between border-b border-[#e7dfd3] pb-3 mb-4">
              <h3 className="font-serif text-lg font-medium text-[#1e1c19]">
                {editingBanner ? "Edit Banner" : "New Promotional Banner"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#716b62] hover:text-[#1e1c19]"
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                  Title <span className="text-[#a64b42]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Diwali Heritage Collection"
                  className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Exclusive handcrafted silver jewellery edit"
                  className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                />
              </div>

              {/* Media Asset */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                  Banner Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-28 overflow-hidden border border-[#d9cdbd] bg-[#fbf8f2] flex items-center justify-center">
                    {formData.mediaUrl ? (
                      <img src={formData.mediaUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-[#716b62]" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs font-medium text-[#1e1c19] hover:border-[#b99657]"
                  >
                    Choose Image
                  </button>
                </div>
              </div>

              {/* Target URL & Position */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    placeholder="/category/bangles"
                    className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                    Placement Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="HOME_PROMOTION"
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
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                    End Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
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
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full border border-[#d9cdbd] bg-white px-3 py-1.5 text-xs text-[#1e1c19] outline-none focus:border-[#b99657]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e1c19] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                  onClick={() => setIsModalOpen(false)}
                  className="border border-[#d9cdbd] px-4 py-2 text-xs font-semibold uppercase text-[#716b62]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-[#211f1b] px-5 py-2 text-xs font-semibold uppercase text-white hover:bg-black disabled:opacity-50"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  Save Banner
                </button>
              </div>
            </form>
          </div>

          {/* Media Picker Modal */}
          <MediaPickerModal
            isOpen={isMediaModalOpen}
            onClose={() => setIsMediaModalOpen(false)}
            onSelect={(item) => {
              const selected = Array.isArray(item) ? item[0] : item;
              if (selected) {
                setFormData((prev) => ({
                  ...prev,
                  mediaAssetId: selected.id,
                  mediaUrl: selected.url,
                }));
              }
              setIsMediaModalOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
