import { useState, useEffect, useCallback } from "react";
import { X, Search, Upload, Check, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { mediaApi } from "../../lib/api/mediaApi";

/**
 * Reusable Media Picker Modal
 * Supports browsing existing library, searching, filtering, and uploading new media directly.
 */
export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedIds = [],
  title = "Select Media",
}) {
  const [activeTab, setActiveTab] = useState("library"); // "library" | "upload"
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [mimeType, setMimeType] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selection
  const [selectedItems, setSelectedItems] = useState([]);

  // Upload Form
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Sync initial selections when opened
  useEffect(() => {
    if (isOpen) {
      const initialIds = Array.isArray(selectedIds)
        ? selectedIds
        : selectedIds
        ? [selectedIds]
        : [];
      setSelectedItems(initialIds.map((id) => (typeof id === "object" ? id : { id })));
      setActiveTab("library");
      setPage(1);
      setSearch("");
      setMimeType("All");
    }
  }, [isOpen, selectedIds]);

  // Fetch Media Library
  const fetchMedia = useCallback(async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 12,
        search: search.trim() || undefined,
        mimeType: mimeType !== "All" ? mimeType : undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const response = await mediaApi.getMedia(params);
      if (response && response.data) {
        setItems(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load media in modal:", err);
      setError(err.message || "Failed to load media library.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, page, search, mimeType]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchMedia();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [fetchMedia, isOpen]);

  if (!isOpen) return null;

  // Toggle selection
  const handleItemClick = (item) => {
    if (multiple) {
      const exists = selectedItems.some((sel) => sel.id === item.id);
      if (exists) {
        setSelectedItems(selectedItems.filter((sel) => sel.id !== item.id));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    } else {
      setSelectedItems([item]);
    }
  };

  const isSelected = (id) => selectedItems.some((sel) => sel.id === id);

  // Confirm selection
  const handleConfirm = () => {
    if (multiple) {
      onSelect(selectedItems);
    } else {
      onSelect(selectedItems[0] || null);
    }
    onClose();
  };

  // Upload handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    setUploadAltText("");
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const response = await mediaApi.uploadMedia(uploadFile, {
        title: uploadTitle.trim() || undefined,
        altText: uploadAltText.trim() || undefined,
      });

      const newMedia = response?.data || response;

      // Select newly uploaded media
      if (multiple) {
        setSelectedItems((prev) => [...prev, newMedia]);
      } else {
        setSelectedItems([newMedia]);
      }

      // Reset upload state and switch back to library
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle("");
      setUploadAltText("");
      setActiveTab("library");
      setPage(1);
      fetchMedia();
    } catch (err) {
      console.error("Upload error in modal:", err);
      setUploadError(err.message || "Upload failed. Please check file type and size.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          maxHeight: "90vh",
          backgroundColor: "#1c1917",
          border: "1px solid #383531",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          color: "#f5f5f4",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #292524",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "600", color: "#f5f5f4" }}>
              {title}
            </h3>
            <span style={{ fontSize: "12px", color: "#a8a29e" }}>
              {multiple ? "Choose one or more assets" : "Choose a single asset"}
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            style={{
              background: "transparent",
              border: "none",
              color: "#a8a29e",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #292524",
            padding: "0 20px",
            backgroundColor: "#181614",
            gap: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            style={{
              padding: "12px 4px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "library" ? "2px solid #d4af37" : "2px solid transparent",
              color: activeTab === "library" ? "#d4af37" : "#a8a29e",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ImageIcon size={15} />
            Media Library
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            style={{
              padding: "12px 4px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "upload" ? "2px solid #d4af37" : "2px solid transparent",
              color: activeTab === "upload" ? "#d4af37" : "#a8a29e",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Upload size={15} />
            Upload New
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {activeTab === "library" && (
            <div>
              {/* Search & Filter Toolbar */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: "220px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#292524",
                    border: "1px solid #44403c",
                    borderRadius: "6px",
                    padding: "6px 12px",
                  }}
                >
                  <Search size={14} color="#a8a29e" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name, title, or alt text..."
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#f5f5f4",
                      fontSize: "13px",
                      width: "100%",
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer" }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <select
                  value={mimeType}
                  onChange={(e) => {
                    setMimeType(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    backgroundColor: "#292524",
                    border: "1px solid #44403c",
                    borderRadius: "6px",
                    color: "#f5f5f4",
                    padding: "6px 12px",
                    fontSize: "13px",
                    outline: "none",
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="image/jpeg">JPEG Images</option>
                  <option value="image/png">PNG Images</option>
                  <option value="image/webp">WebP Images</option>
                  <option value="image/svg+xml">SVG Vectors</option>
                </select>
              </div>

              {/* Grid / Empty / Loader */}
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "260px",
                    color: "#d4af37",
                    gap: "12px",
                  }}
                >
                  <Loader2 className="animate-spin" size={28} />
                  <span style={{ fontSize: "13px", color: "#a8a29e" }}>Loading media assets...</span>
                </div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#ef4444" }}>
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={fetchMedia}
                    style={{
                      marginTop: "8px",
                      padding: "6px 14px",
                      backgroundColor: "#292524",
                      border: "1px solid #44403c",
                      color: "#f5f5f4",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "240px",
                    textAlign: "center",
                    gap: "10px",
                  }}
                >
                  <ImageIcon size={36} color="#78716c" />
                  <p style={{ margin: 0, fontSize: "14px", color: "#d6d3d1" }}>No media assets found</p>
                  <span style={{ fontSize: "12px", color: "#78716c" }}>
                    Try adjusting your search or upload a new asset.
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    style={{
                      marginTop: "10px",
                      padding: "6px 14px",
                      backgroundColor: "#d4af37",
                      color: "#000",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Upload an Image
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {items.map((item) => {
                    const active = isSelected(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        style={{
                          position: "relative",
                          border: active ? "2px solid #d4af37" : "1px solid #383531",
                          borderRadius: "6px",
                          overflow: "hidden",
                          cursor: "pointer",
                          backgroundColor: active ? "rgba(212, 175, 55, 0.08)" : "#262220",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Thumbnail */}
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            backgroundColor: "#181614",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={item.url}
                            alt={item.altText || item.title || item.fileName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        {/* Selection Badge */}
                        {active && (
                          <div
                            style={{
                              position: "absolute",
                              top: "6px",
                              right: "6px",
                              backgroundColor: "#d4af37",
                              color: "#000",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}

                        {/* Title / Info */}
                        <div style={{ padding: "6px 8px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#f5f5f4",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={item.title || item.fileName}
                          >
                            {item.title || item.fileName}
                          </p>
                          <span style={{ fontSize: "10px", color: "#a8a29e" }}>
                            {item.width && item.height
                              ? `${item.width}×${item.height}`
                              : `${Math.round((item.sizeBytes || 0) / 1024)} KB`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid #292524",
                  }}
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      backgroundColor: "#292524",
                      color: page <= 1 ? "#78716c" : "#f5f5f4",
                      border: "1px solid #44403c",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <span style={{ fontSize: "12px", color: "#a8a29e" }}>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      backgroundColor: "#292524",
                      color: page >= totalPages ? "#78716c" : "#f5f5f4",
                      border: "1px solid #44403c",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: page >= totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "upload" && (
            <form onSubmit={handleUploadSubmit} style={{ maxWidth: "500px", margin: "0 auto" }}>
              <div
                style={{
                  border: "2px dashed #44403c",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "#24201e",
                  marginBottom: "16px",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {uploadPreview ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <img
                      src={uploadPreview}
                      alt="Upload Preview"
                      style={{
                        maxHeight: "160px",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "4px",
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#a8a29e" }}>{uploadFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreview(null);
                      }}
                      style={{
                        background: "none",
                        border: "1px solid #57534e",
                        borderRadius: "4px",
                        color: "#ef4444",
                        fontSize: "11px",
                        padding: "3px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color="#d4af37" style={{ margin: "0 auto 8px" }} />
                    <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#f5f5f4" }}>
                      Click or drag file to upload
                    </p>
                    <span style={{ fontSize: "11px", color: "#a8a29e" }}>
                      Supports JPEG, PNG, WebP, SVG (Max 10MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={handleFileChange}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                )}
              </div>

              {uploadError && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid #ef4444",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    color: "#ef4444",
                    fontSize: "12px",
                    marginBottom: "12px",
                  }}
                >
                  {uploadError}
                </div>
              )}

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "4px", color: "#d6d3d1" }}>
                  Title / Asset Name
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Royal Emerald Pendant Front"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#292524",
                    border: "1px solid #44403c",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#f5f5f4",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "4px", color: "#d6d3d1" }}>
                  Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="e.g. Handcrafted sterling silver pendant with emerald"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#292524",
                    border: "1px solid #44403c",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#f5f5f4",
                    fontSize: "13px",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!uploadFile || uploading}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: !uploadFile || uploading ? "#57534e" : "#d4af37",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: !uploadFile || uploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Uploading to Storage...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload & Add to Selection
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #292524",
            backgroundColor: "#181614",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "12px", color: "#a8a29e" }}>
            {selectedItems.length > 0 ? (
              <span style={{ color: "#d4af37", fontWeight: "600" }}>
                {selectedItems.length} asset{selectedItems.length > 1 ? "s" : ""} selected
              </span>
            ) : (
              <span>No asset selected</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 14px",
                backgroundColor: "transparent",
                border: "1px solid #44403c",
                color: "#f5f5f4",
                borderRadius: "4px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={handleConfirm}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedItems.length === 0 ? "#57534e" : "#d4af37",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Check size={15} /> Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
