import { useEffect, useState, useCallback, useRef } from "react";
import {
  Upload,
  Search,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Check,
  LayoutGrid,
  List,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import AdminModuleShell from "../../components/AdminModuleShell";
import { mediaApi } from "../../../lib/api/mediaApi";

export default function Media() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search & View
  const [search, setSearch] = useState("");
  const [mimeType, setMimeType] = useState("All");
  const [status, setStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Active Edit
  const [previewItem, setPreviewItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch Media Assets from Backend
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 18,
        search: search.trim() || undefined,
        mimeType: mimeType !== "All" ? mimeType : undefined,
        status: status !== "All" ? status : undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const response = await mediaApi.getMedia(params);
      if (response && response.data) {
        setItems(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalCount(response.pagination.total || 0);
        }
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
      setError(err.message || "Failed to load media assets.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, mimeType, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchMedia]);

  // Copy URL to clipboard
  const handleCopyUrl = (url, id) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe delete or archive
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete or archive "${item.title || item.fileName}"?`)) {
      return;
    }

    try {
      const response = await mediaApi.deleteMedia(item.id);
      const data = response?.data || response;
      if (data?.archived) {
        alert(data.message || "Media is referenced by products/categories and has been archived.");
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: "ARCHIVED" } : x))
        );
      } else {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        setTotalCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      alert(err.message || "Failed to delete media asset.");
    }
  };

  // Open edit modal
  const openEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditAltText(item.altText || "");
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setSavingEdit(true);
      const response = await mediaApi.updateMedia(editingItem.id, {
        title: editTitle.trim() || null,
        altText: editAltText.trim() || null,
      });
      const updated = response?.data || response;
      setItems((prev) =>
        prev.map((x) => (x.id === editingItem.id ? { ...x, ...updated } : x))
      );
      setEditingItem(null);
    } catch (err) {
      alert(err.message || "Failed to update media metadata.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Upload handler
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    setUploadAltText("");
    setUploadError(null);
    setShowUploadModal(true);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      await mediaApi.uploadMedia(uploadFile, {
        title: uploadTitle.trim() || undefined,
        altText: uploadAltText.trim() || undefined,
      });

      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle("");
      setUploadAltText("");
      setPage(1);
      fetchMedia();
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err.message || "Upload failed. Please verify file type and size.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminModuleShell
      eyebrow="MANAGEMENT / MEDIA"
      title="Media Library"
      description="Centralise approved media assets, ALT text, URLs and reusable content media."
      actionLabel="Upload Media"
      onAction={() => fileInputRef.current?.click()}
      search={search}
      onSearch={(val) => {
        setSearch(val);
        setPage(1);
      }}
      searchPlaceholder="Search by name, title, or alt text..."
      filters={
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Hidden File Input for header button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            hidden
            onChange={handleFileSelect}
          />

          {/* Type Filter */}
          <select
            className="module-select"
            value={mimeType}
            onChange={(e) => {
              setMimeType(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Types</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
            <option value="image/svg+xml">SVG</option>
          </select>

          {/* Status Filter */}
          <select
            className="module-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{ display: "flex", border: "1px solid #383531", borderRadius: "6px", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              style={{
                background: viewMode === "grid" ? "#383531" : "transparent",
                border: "none",
                color: viewMode === "grid" ? "#d4af37" : "#a8a29e",
                padding: "6px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                background: viewMode === "table" ? "#383531" : "transparent",
                border: "none",
                color: viewMode === "table" ? "#d4af37" : "#a8a29e",
                padding: "6px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      }
    >
      <div className="products-card module-card">
        <div className="products-card-header">
          <div>
            <h2>Media Assets</h2>
            <p>{totalCount} records</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "260px" }}>
            <Loader2 className="animate-spin" size={28} style={{ color: "#d4af37" }} />
          </div>
        ) : error ? (
          <div className="products-empty">
            <h3>Error loading media</h3>
            <p>{error}</p>
            <button className="add-product-btn" onClick={fetchMedia}>
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="products-empty">
            <h3>No media assets found</h3>
            <p>Upload a new image or try adjusting your search terms.</p>
            <button className="add-product-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> Upload First Image
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* =========================================================
             TABLE VIEW
             ========================================================= */
          <div className="products-table-wrapper">
            <table className="products-table module-table">
              <thead>
                <tr>
                  <th>ASSET</th>
                  <th>TYPE</th>
                  <th>DIMENSIONS</th>
                  <th>SIZE</th>
                  <th>ALT TEXT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-cell">
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            backgroundColor: "#181614",
                            border: "1px solid #383531",
                            flexShrink: 0,
                            cursor: "pointer",
                          }}
                          onClick={() => setPreviewItem(item)}
                        >
                          <img
                            src={item.url}
                            alt={item.altText || item.title || item.fileName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <strong className="product-name">{item.title || item.fileName}</strong>
                          <span className="sku">{item.originalFileName || item.fileName}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sku">{item.mimeType?.replace("image/", "")?.toUpperCase() || "IMAGE"}</span>
                    </td>
                    <td>
                      <span className="sku">
                        {item.width && item.height ? `${item.width} × ${item.height}px` : "—"}
                      </span>
                    </td>
                    <td>
                      <span className="sku">
                        {item.sizeBytes ? `${Math.round(item.sizeBytes / 1024)} KB` : "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: item.altText ? "#d6d3d1" : "#78716c" }}>
                        {item.altText || "No alt text"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${(item.status || "ACTIVE").toLowerCase()}`}>
                        {item.status || "ACTIVE"}
                      </span>
                    </td>
                    <td>
                      <div className="module-actions">
                        <button
                          title="Copy URL"
                          onClick={() => handleCopyUrl(item.url, item.id)}
                        >
                          {copiedId === item.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                        <button title="Preview image" onClick={() => setPreviewItem(item)}>
                          <Eye size={14} />
                        </button>
                        <button title="Edit metadata" onClick={() => openEdit(item)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete or archive"
                          className="danger-icon"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* =========================================================
             GRID VIEW
             ========================================================= */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
              padding: "20px",
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#201d1a",
                  border: "1px solid #383531",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.15s ease",
                }}
              >
                {/* Thumbnail Preview with hover preview trigger */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    backgroundColor: "#141210",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => setPreviewItem(item)}
                >
                  <img
                    src={item.url}
                    alt={item.altText || item.title || item.fileName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  {/* Status Badge */}
                  <span
                    className={`status-badge ${(item.status || "ACTIVE").toLowerCase()}`}
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      fontSize: "10px",
                      padding: "2px 6px",
                    }}
                  >
                    {item.status || "ACTIVE"}
                  </span>
                </div>

                {/* Details */}
                <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <strong
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#f5f5f4",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginBottom: "4px",
                    }}
                    title={item.title || item.fileName}
                  >
                    {item.title || item.fileName}
                  </strong>

                  <span style={{ fontSize: "11px", color: "#a8a29e", marginBottom: "8px" }}>
                    {item.width && item.height
                      ? `${item.width}×${item.height} • `
                      : ""}
                    {item.sizeBytes ? `${Math.round(item.sizeBytes / 1024)} KB` : ""}
                  </span>

                  {item.altText && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#78716c",
                        margin: "0 0 12px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.altText}
                    >
                      Alt: {item.altText}
                    </p>
                  )}

                  {/* Card Actions */}
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid #292524",
                      paddingTop: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: copiedId === item.id ? "#10b981" : "#a8a29e",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                      }}
                    >
                      {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === item.id ? "Copied" : "Copy URL"}
                    </button>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer", padding: "2px" }}
                        title="Edit Alt/Title"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }}
                        title="Delete or Archive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderTop: "1px solid #292524",
            }}
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              Page {page} of {totalPages} ({totalCount} total)
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* =========================================================
          IMAGE PREVIEW MODAL
         ========================================================= */}
      {previewItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            style={{
              maxWidth: "800px",
              width: "100%",
              backgroundColor: "#1c1917",
              border: "1px solid #383531",
              borderRadius: "8px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #292524",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "14px", color: "#f5f5f4" }}>
                {previewItem.title || previewItem.fileName}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ backgroundColor: "#0c0a09", padding: "20px", textAlign: "center" }}>
              <img
                src={previewItem.url}
                alt={previewItem.altText || previewItem.title || previewItem.fileName}
                style={{ maxHeight: "60vh", maxWidth: "100%", objectFit: "contain", margin: "0 auto" }}
              />
            </div>
            <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "#a8a29e" }}>
              <div>
                <strong>Dimensions:</strong> {previewItem.width && previewItem.height ? `${previewItem.width} × ${previewItem.height}px` : "N/A"}
              </div>
              <div>
                <strong>File Size:</strong> {previewItem.sizeBytes ? `${Math.round(previewItem.sizeBytes / 1024)} KB` : "N/A"}
              </div>
              <div>
                <strong>MIME Type:</strong> {previewItem.mimeType}
              </div>
              <div>
                <strong>Status:</strong> {previewItem.status}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <strong>Alt Text:</strong> {previewItem.altText || "None specified"}
              </div>
              <div style={{ gridColumn: "1 / -1", wordBreak: "break-all" }}>
                <strong>URL:</strong> <a href={previewItem.url} target="_blank" rel="noreferrer" style={{ color: "#d4af37" }}>{previewItem.url}</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EDIT METADATA MODAL
         ========================================================= */}
      {editingItem && (
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
              maxWidth: "460px",
              width: "100%",
              backgroundColor: "#1c1917",
              border: "1px solid #383531",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#f5f5f4" }}>
                Edit Media Metadata
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#d6d3d1" }}>
                  Title / Asset Name
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#d6d3d1" }}>
                  Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe image for search engines and accessibility"
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: "8px 14px",
                    background: "none",
                    border: "1px solid #44403c",
                    borderRadius: "4px",
                    color: "#f5f5f4",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#d4af37",
                    border: "none",
                    borderRadius: "4px",
                    color: "#000",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: savingEdit ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {savingEdit ? <Loader2 size={14} className="animate-spin" /> : null}
                  Save Metadata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          UPLOAD MODAL
         ========================================================= */}
      {showUploadModal && (
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
              maxWidth: "480px",
              width: "100%",
              backgroundColor: "#1c1917",
              border: "1px solid #383531",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#f5f5f4" }}>
                Upload Media Asset
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadPreview(null);
                }}
                style={{ background: "none", border: "none", color: "#a8a29e", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {uploadPreview && (
                <div style={{ textAlign: "center", marginBottom: "14px", backgroundColor: "#0c0a09", padding: "10px", borderRadius: "6px" }}>
                  <img
                    src={uploadPreview}
                    alt="Upload Preview"
                    style={{ maxHeight: "160px", maxWidth: "100%", objectFit: "contain" }}
                  />
                  <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "4px" }}>
                    {uploadFile?.name} ({(uploadFile?.size / 1024).toFixed(0)} KB)
                  </div>
                </div>
              )}

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
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#d6d3d1" }}>
                  Title / Asset Name
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Traditional Gold Choker Front"
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#d6d3d1" }}>
                  Alt Text
                </label>
                <input
                  type="text"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  placeholder="e.g. 22k yellow gold choker necklace handcrafted"
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadPreview(null);
                  }}
                  style={{
                    padding: "8px 14px",
                    background: "none",
                    border: "1px solid #44403c",
                    borderRadius: "4px",
                    color: "#f5f5f4",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#d4af37",
                    border: "none",
                    borderRadius: "4px",
                    color: "#000",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: uploading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Upload Asset
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModuleShell>
  );
}
