import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminModuleShell from "./AdminModuleShell";

export default function ContentListPage({
  eyebrow,
  title,
  description,
  columns,
  rows = [],
  loading = false,
  emptyMessage,
  actionLabel = "Add",
  onAction,
}) {
  const [search, setSearch] = useState("");

  const filtered = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminModuleShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      search={search}
      onSearch={setSearch}
      searchPlaceholder={`Search ${title.toLowerCase()}...`}
    >
      <div className="products-card module-card">
        <div className="products-card-header">
          <div>
            <h2>{title}</h2>
            <p>{filtered.length} {filtered.length === 1 ? "record" : "records"}</p>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#8a8277",
            }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ margin: "0 auto 10px", display: "block" }}
            />
            <p style={{ fontSize: "13px" }}>Loading records from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">
            <h3>No records found</h3>
            <p>
              {emptyMessage ||
                (rows.length === 0
                  ? `No ${title.toLowerCase()} configured in the system yet.`
                  : "No records match your search query.")}
            </p>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table module-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminModuleShell>
  );
}
