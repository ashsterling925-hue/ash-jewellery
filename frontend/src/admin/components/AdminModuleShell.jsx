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
    <section className="admin-module-page space-y-2.5">
      {/* Compact Page Header: Title + Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-bold text-[#b99657] uppercase tracking-wider leading-none mb-0.5">
              {eyebrow}
            </div>
          )}
          <div className="flex items-baseline gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#1e1c19] tracking-tight leading-tight">
              {title}
            </h1>
            {description && (
              <span className="hidden md:inline-block text-xs text-[#8c8273] truncate max-w-md">
                — {description}
              </span>
            )}
          </div>
        </div>

        {actionLabel && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b99657] hover:bg-[#a38245] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
            onClick={onAction}
          >
            <Plus size={14} /> {actionLabel}
          </button>
        )}
      </div>

      {/* Compact Search & Filters Toolbar */}
      {(search !== undefined || filters) && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {search !== undefined && (
            <label className="relative flex-1 min-w-[200px] max-w-sm">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9e9486] pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full pl-8 pr-3 text-xs bg-white border border-[#e7dfd3] rounded-md text-[#1e1c19] placeholder:text-[#a89f92] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all shadow-2xs"
              />
            </label>
          )}
          {filters}
        </div>
      )}

      {/* Main Content */}
      <div className="pt-0.5">
        {children}
      </div>
    </section>
  );
}