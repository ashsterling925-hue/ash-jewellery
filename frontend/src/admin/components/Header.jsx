import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Header({ onToggleMobileSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      await logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getRouteInfo = () => {
    const path = location.pathname;

    if (path.includes("/dashboard") || path === "/admin" || path === "/admin/") {
      return { section: "Overview", title: "Dashboard" };
    }
    if (path.includes("/products/new")) {
      return { section: "Catalogue", title: "Add Product" };
    }
    if (path.includes("/products") && path.includes("/edit")) {
      return { section: "Catalogue", title: "Edit Product" };
    }
    if (path.includes("/products")) {
      return { section: "Catalogue", title: "Products" };
    }
    if (path.includes("/categories/new")) {
      return { section: "Catalogue", title: "Add Category" };
    }
    if (path.includes("/categories") && path.includes("/edit")) {
      return { section: "Catalogue", title: "Edit Category" };
    }
    if (path.includes("/categories")) {
      return { section: "Catalogue", title: "Categories" };
    }
    if (path.includes("/subcategories/new")) {
      return { section: "Catalogue", title: "Add Subcategory" };
    }
    if (path.includes("/subcategories") && path.includes("/edit")) {
      return { section: "Catalogue", title: "Edit Subcategory" };
    }
    if (path.includes("/subcategories")) {
      return { section: "Catalogue", title: "Subcategories" };
    }
    if (path.includes("/collections/new")) {
      return { section: "Catalogue", title: "Add Collection" };
    }
    if (path.includes("/collections") && path.includes("/edit")) {
      return { section: "Catalogue", title: "Edit Collection" };
    }
    if (path.includes("/collections")) {
      return { section: "Catalogue", title: "Collections" };
    }
    if (path.includes("/attributes/new")) {
      return { section: "Catalogue", title: "Add Attribute" };
    }
    if (path.includes("/attributes") && path.includes("/edit")) {
      return { section: "Catalogue", title: "Edit Attribute" };
    }
    if (path.includes("/attributes")) {
      return { section: "Catalogue", title: "Attributes" };
    }
    if (path.includes("/tags/new")) {
      return { section: "Catalogue", title: "Add Tag" };
    }
    if (path.includes("/tags") && path.includes("/edit")) {
      return { section: "Catalogue", title: "Edit Tag" };
    }
    if (path.includes("/tags")) {
      return { section: "Catalogue", title: "Tags" };
    }
    if (path.includes("/homepage")) {
      return { section: "Content", title: "Homepage Layout" };
    }
    if (path.includes("/banners")) {
      return { section: "Content", title: "Hero Banners" };
    }
    if (path.includes("/navigation")) {
      return { section: "Content", title: "Navigation Menu" };
    }
    if (path.includes("/pages")) {
      return { section: "Content", title: "Pages" };
    }
    if (path.includes("/customers")) {
      return { section: "Management", title: "Customers" };
    }
    if (path.includes("/enquiries")) {
      return { section: "Management", title: "Customer Enquiries" };
    }
    if (path.includes("/media")) {
      return { section: "Management", title: "Media Library" };
    }
    if (path.includes("/analytics")) {
      return { section: "Management", title: "Analytics" };
    }
    if (path.includes("/settings")) {
      return { section: "Management", title: "Settings" };
    }

    return { section: "Admin", title: "Portal" };
  };

  const { section, title } = getRouteInfo();

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#fffdf9]/95 backdrop-blur-md border-b border-[#e7dfd3] px-5 lg:px-6 flex items-center justify-between transition-all">
      {/* LEFT: Mobile Menu Trigger + Breadcrumb / Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger (Only visible on small/medium screens where sidebar is hidden) */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Open sidebar menu"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md border border-[#e7dfd3] bg-white text-[#716b62] hover:text-[#1e1c19] hover:border-[#b99657] transition-all cursor-pointer flex-shrink-0"
        >
          <Menu size={16} />
        </button>

        {/* Page Title & Breadcrumb Hierarchy */}
        <div className="flex flex-col text-left justify-center min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#8c8273] uppercase tracking-wider leading-none">
            <span className="text-[#a89f92]">Admin</span>
            <span className="text-[#d9cdbd]">/</span>
            <span className="text-[#b99657]">{section}</span>
          </div>
          <h1 className="font-serif text-base sm:text-lg font-semibold text-[#1e1c19] tracking-tight leading-tight truncate mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {/* RIGHT: Search + Notifications + User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:flex items-center"
        >
          <Search
            size={15}
            className="absolute left-3 text-[#9e9486] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="h-9 w-48 lg:w-64 pl-8 pr-3 text-xs bg-white border border-[#e7dfd3] rounded-md text-[#1e1c19] placeholder:text-[#a89f92] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 text-[#a89f92] hover:text-[#1e1c19] cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex items-center justify-center w-9 h-9 rounded-md border border-[#e7dfd3] bg-white text-[#716b62] hover:text-[#b99657] hover:border-[#b99657] hover:bg-[#faf7f2] transition-all cursor-pointer shadow-sm flex-shrink-0"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#b99657] rounded-full ring-2 ring-white" />
        </button>

        {/* Subtle Vertical Divider */}
        <div className="h-6 w-px bg-[#e7dfd3] hidden sm:block" />

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            className="flex flex-row items-center gap-2.5 py-1.5 px-2 sm:px-3 rounded-lg border border-[#e7dfd3] bg-white hover:bg-[#faf7f2] hover:border-[#b99657] transition-all cursor-pointer shadow-sm text-left focus:outline-none"
          >
            {/* Circular Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#10233f] text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center font-serif font-bold text-xs shadow-sm flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>

            {/* User Name & Role text in clean horizontal alignment */}
            <div className="hidden sm:flex flex-col text-left leading-tight min-w-0">
              <span className="text-xs font-semibold text-[#1e1c19] truncate max-w-[110px]">
                {user?.name || "Super Admin"}
              </span>
              <span className="text-[9px] font-bold tracking-wider text-[#b99657] uppercase mt-0.5 truncate max-w-[110px]">
                {user?.role ? user.role.replace("_", " ") : "SUPER ADMIN"}
              </span>
            </div>

            {/* Chevron Icon */}
            <ChevronDown
              size={14}
              className={`text-[#8c8273] transition-transform duration-200 flex-shrink-0 ml-0.5 ${
                userMenuOpen ? "rotate-180 text-[#b99657]" : ""
              }`}
            />
          </button>

          {/* Luxury Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-[#e7dfd3] bg-[#fffdf9] p-2 shadow-xl z-50 animate-in fade-in duration-150">
              {/* Profile Card Header */}
              <div className="px-3 py-2.5 rounded-md bg-[#faf7f2] border border-[#eee7dc] mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#10233f] text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#1e1c19] truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-[11px] text-[#716b62] truncate">
                      {user?.email || "admin@ashjewellery.com"}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#ebdcc4] text-[#846328]">
                      {user?.role ? user.role.replace("_", " ") : "SUPER ADMIN"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings Action */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/admin/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#4a453e] hover:bg-[#faf7f2] hover:text-[#1e1c19] rounded-md transition-colors cursor-pointer text-left"
                >
                  <Settings size={14} className="text-[#8c8273]" />
                  Admin Settings
                </button>
              </div>

              <div className="h-px bg-[#e7dfd3] my-1" />

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#a64b42] hover:bg-[#fcf2f1] rounded-md transition-colors cursor-pointer text-left"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}