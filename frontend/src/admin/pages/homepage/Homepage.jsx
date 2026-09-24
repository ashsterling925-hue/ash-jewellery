import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Save,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  ArrowRight,
} from "lucide-react";
import { cmsApi } from "@/lib/api/cmsApi";
import { mediaApi } from "@/lib/api/mediaApi";
import MediaPickerModal from "@/admin/components/MediaPickerModal";

export default function Homepage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [targetSlideIdx, setTargetSlideIdx] = useState(null); // null means adding new slide, number means replacing
  const [uploadingDirect, setUploadingDirect] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState(null);
  const fileInputRef = useRef(null);

  // Load existing hero slides
  useEffect(() => {
    let isMounted = true;
    async function loadHeroSlides() {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await cmsApi.getAdminHero();
        if (isMounted && res?.data) {
          if (Array.isArray(res.data.slides) && res.data.slides.length > 0) {
            const sorted = [...res.data.slides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            setSlides(sorted);
          } else if (res.data.mediaAsset?.url) {
            // Legacy single photo
            setSlides([
              {
                id: res.data.id || "slide-1",
                mediaAssetId: res.data.mediaAssetId || null,
                url: res.data.mediaAsset.url,
                altText: "Hero Banner",
                sortOrder: 1,
              },
            ]);
          } else {
            setSlides([]);
          }
          setIsDirty(false);
        }
      } catch (err) {
        console.error("Failed to load hero slides:", err);
        if (isMounted) setErrorMsg("Failed to load hero slides. Please refresh.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHeroSlides();
    return () => {
      isMounted = false;
    };
  }, []);

  // Direct upload from computer
  const handleDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDirect(true);
      setErrorMsg("");
      const res = await mediaApi.uploadMedia(file, {
        title: "Hero Showcase Slide",
        altText: "Hero Banner",
      });

      if (res?.data) {
        const uploadedAsset = res.data;
        if (targetSlideIdx !== null && targetSlideIdx >= 0) {
          // Replace existing slide image
          setSlides((prev) => {
            const next = [...prev];
            next[targetSlideIdx] = {
              ...next[targetSlideIdx],
              mediaAssetId: uploadedAsset.id,
              url: uploadedAsset.url,
            };
            return next;
          });
        } else {
          // Add new slide
          setSlides((prev) => [
            ...prev,
            {
              id: `slide-${Date.now()}`,
              mediaAssetId: uploadedAsset.id,
              url: uploadedAsset.url,
              altText: "Hero Slide",
              sortOrder: prev.length + 1,
            },
          ]);
        }
        setIsDirty(true);
        setSuccessMsg("Image uploaded successfully! Click Save Changes to publish.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Direct upload failed:", err);
      setErrorMsg(err.message || "Failed to upload image.");
    } finally {
      setUploadingDirect(false);
      setTargetSlideIdx(null);
      e.target.value = "";
    }
  };

  // Media Library Selection
  const handleSelectFromMediaModal = (selected) => {
    const asset = Array.isArray(selected) ? selected[0] : selected;
    if (!asset || !asset.url) return;

    if (targetSlideIdx !== null && targetSlideIdx >= 0) {
      // Replace existing slide image
      setSlides((prev) => {
        const next = [...prev];
        next[targetSlideIdx] = {
          ...next[targetSlideIdx],
          mediaAssetId: asset.id,
          url: asset.url,
        };
        return next;
      });
    } else {
      // Add new slide
      setSlides((prev) => [
        ...prev,
        {
          id: `slide-${Date.now()}`,
          mediaAssetId: asset.id,
          url: asset.url,
          altText: asset.altText || "Hero Slide",
          sortOrder: prev.length + 1,
        },
      ]);
    }
    setIsDirty(true);
    setIsMediaModalOpen(false);
    setTargetSlideIdx(null);
  };

  // Delete slide and immediately persist to database
  const handleDeleteSlide = async (index) => {
    if (!window.confirm("Are you sure you want to delete this photo from the homepage?")) return;

    const previousSlides = [...slides];
    const remainingSlides = slides
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({ ...item, sortOrder: idx + 1 }));

    // Optimistically update UI
    setSlides(remainingSlides);
    setDeletingIdx(index);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await cmsApi.saveHero({ slides: remainingSlides });
      setIsDirty(false);
      setSuccessMsg("Photo deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to delete slide:", err);
      // Revert if API failed
      setSlides(previousSlides);
      setErrorMsg(err.message || "Failed to delete photo. Please try again.");
    } finally {
      setDeletingIdx(null);
    }
  };

  // Change sort order input directly
  const handleOrderChange = (index, newOrder) => {
    const val = parseInt(newOrder, 10);
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], sortOrder: isNaN(val) ? 0 : val };
      return next;
    });
    setIsDirty(true);
  };

  // Move slide up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setSlides((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    });
    setIsDirty(true);
  };

  // Move slide down
  const handleMoveDown = (index) => {
    if (index >= slides.length - 1) return;
    setSlides((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    });
    setIsDirty(true);
  };

  // Save changes
  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Sort slides by sortOrder before saving
      const sortedSlides = [...slides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      await cmsApi.saveHero({ slides: sortedSlides });
      setSlides(sortedSlides);
      setIsDirty(false);
      setSuccessMsg("Hero slides saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Failed to save hero slides:", err);
      setErrorMsg(err.message || "Failed to save hero slides.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDirectUpload}
      />

      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#e7dfd3] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-wide text-[#1e1c19] sm:text-3xl">
            Hero Showcase Photos (Non-Clickable)
          </h1>
        </div>

        {/* Link to Page 2: Clickable Banners */}
        <Link
          to="/admin/banners"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#b99657] bg-[#b99657]/10 text-[#b99657] hover:bg-[#b99657] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider self-start sm:self-auto"
        >
          <span>Clickable Banners</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded border border-[#52735b]/30 bg-[#52735b]/10 p-3 text-xs font-medium text-[#52735b]">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded border border-[#a64b42]/30 bg-[#a64b42]/10 p-3 text-xs font-medium text-[#a64b42]">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Main Content */}
      <div className="border border-[#e7dfd3] bg-[#fffdf9] p-6 shadow-xs w-full">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-[#eee5d8]">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTargetSlideIdx(null);
                fileInputRef.current?.click();
              }}
              disabled={uploadingDirect}
              className="inline-flex items-center gap-1.5 bg-[#211f1b] hover:bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
            >
              {uploadingDirect ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{uploadingDirect ? "Uploading..." : "Upload Photo"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetSlideIdx(null);
                setIsMediaModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 border border-[#d9cdbd] bg-white hover:border-[#b99657] text-[#1e1c19] px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
            >
              <ImageIcon size={14} />
              <span>Choose from Library</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={!isDirty || saving}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all border ${
              !isDirty || saving
                ? "bg-[#e8ded2]/60 text-[#8a7f72] border-[#d9cdbd] cursor-not-allowed opacity-60"
                : "bg-[#b99657] hover:bg-[#97753e] text-white border-transparent cursor-pointer shadow-xs"
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{!isDirty ? "Saved" : "Save Changes"}</span>
              </>
            )}
          </button>
        </div>

        {/* Slides List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#b99657]" />
          </div>
        ) : slides.length > 0 ? (
          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-[#e8ded2] bg-white rounded-none hover:border-[#b99657] transition-all w-full"
              >
                {/* Thumbnail Preview */}
                <div className="w-full sm:w-64 h-32 sm:h-28 bg-[#f5ede2] overflow-hidden border border-[#e2d5c3] flex-shrink-0 flex items-center justify-center">
                  <img
                    src={slide.url}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details & Order */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-serif uppercase tracking-wider text-[#1e1c19]">
                      Slide #{idx + 1}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8a7f72] bg-[#f4ece0] px-2 py-0.5 rounded">
                      Non-Clickable
                    </span>
                  </div>

                  {/* Order Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#5c5448]">
                      Display Order:
                    </label>
                    <input
                      type="number"
                      value={slide.sortOrder ?? idx + 1}
                      onChange={(e) => handleOrderChange(idx, e.target.value)}
                      className="w-20 border border-[#d9cdbd] bg-white px-2.5 py-1 text-xs text-[#1e1c19] text-center font-bold outline-none focus:border-[#b99657]"
                      min="1"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center justify-end gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1eadf]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 border border-[#d9cdbd] text-[#5c5448] hover:text-[#1e1c19] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === slides.length - 1}
                      className="p-1.5 border border-[#d9cdbd] text-[#5c5448] hover:text-[#1e1c19] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetSlideIdx(idx);
                        fileInputRef.current?.click();
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider border border-[#d9cdbd] text-[#1e1c19] hover:border-[#b99657] cursor-pointer"
                      title="Change Photo"
                    >
                      Change
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      disabled={deletingIdx === idx}
                      className="p-1.5 text-[#a64b42] hover:bg-[#a64b42]/10 border border-[#a64b42]/30 cursor-pointer disabled:opacity-50"
                      title="Delete Slide"
                    >
                      {deletingIdx === idx ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center text-xs text-[#716b62] border border-dashed border-[#d9cdbd] bg-[#fdfbf8] p-8">
            <ImageIcon size={32} className="mx-auto text-[#b99657] mb-2.5 opacity-80" />
            <p className="font-serif text-base text-[#1e1c19] mb-1 font-medium">
              No Hero Photos Added Yet
            </p>
            <p className="text-xs text-[#8a7f72] max-w-sm mx-auto mb-4">
              Add your high-resolution hero banners. They will cycle smoothly in the top carousel.
            </p>
            <button
              type="button"
              onClick={() => {
                setTargetSlideIdx(null);
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 bg-[#211f1b] hover:bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              <Plus size={14} /> Add First Photo
            </button>
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setTargetSlideIdx(null);
        }}
        onSelect={handleSelectFromMediaModal}
      />
    </div>
  );
}
