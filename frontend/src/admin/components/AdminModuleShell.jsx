import { Plus, Search } from "lucide-react";

export default function AdminModuleShell({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  search,
  onSearch,
  searchPlaceholder = "Search...",
  filters,
  children,
}) {
  return (
    <section className="admin-module-page">
      <div className="products-heading module-heading">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
        </div>
        {actionLabel && (
          <button className="add-product-btn" onClick={onAction}>
            <Plus size={15} /> {actionLabel}
          </button>
        )}
      </div>
      {(search !== undefined || filters) && (
        <div className="products-toolbar module-toolbar">
          {search !== undefined && (
            <label className="products-search">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </label>
          )}
          {filters}
        </div>
      )}
      {children}
    </section>
  );
}