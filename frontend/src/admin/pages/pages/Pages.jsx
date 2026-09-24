import { useState, useEffect } from "react";
import ContentListPage from "../../components/ContentListPage";
import { adminApi } from "@/lib/api/adminApi";

export default function Pages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPages() {
      try {
        setLoading(true);
        const res = await adminApi.getPages();
        if (res?.data && Array.isArray(res.data)) {
          setPages(res.data);
        } else {
          setPages([]);
        }
      } catch (err) {
        console.error("Failed to load static pages:", err);
        setPages([]);
      } finally {
        setLoading(false);
      }
    }
    loadPages();
  }, []);

  const rows = pages.map((page) => [
    <strong className="product-name" key={page.id}>
      {page.title}
    </strong>,
    <span className="sku" key={`slug-${page.id}`}>
      /{page.slug}
    </span>,
    <span
      className={`status-badge ${(page.status || "draft").toLowerCase()}`}
      key={`status-${page.id}`}
    >
      {page.status || "Draft"}
    </span>,
    <button
      className="module-text-button"
      key={`btn-${page.id}`}
      type="button"
      onClick={() => alert(`Edit page: ${page.title}`)}
    >
      Edit content
    </button>,
  ]);

  return (
    <ContentListPage
      eyebrow="CONTENT / PAGES"
      title="Pages"
      description="Manage About, Contact, Privacy and Terms content without code changes."
      columns={["TITLE", "SLUG", "STATUS", "ACTIONS"]}
      rows={rows}
      loading={loading}
      emptyMessage="No custom static pages created yet."
      actionLabel={null}
    />
  );
}
