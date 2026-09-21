import { useState } from "react";
import AdminModuleShell from "./AdminModuleShell";

export default function ContentListPage({ eyebrow, title, description, columns, rows, actionLabel = "Add", onAction }) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  return (
    <AdminModuleShell eyebrow={eyebrow} title={title} description={description} actionLabel={actionLabel} onAction={onAction} search={search} onSearch={setSearch} searchPlaceholder={`Search ${title.toLowerCase()}...`}>
      <div className="products-card module-card">
        <div className="products-card-header"><div><h2>{title}</h2><p>{filtered.length} records</p></div></div>
        <div className="products-table-wrapper">
          <table className="products-table module-table">
            <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{filtered.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </AdminModuleShell>
  );
}
