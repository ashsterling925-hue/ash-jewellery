import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    setUserMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/admin/dashboard" || path === "/admin" || path === "/dashboard" || path === "/") {
      return "Dashboard";
    }

    if (path === "/admin/products" || path === "/products") {
      return "Products";
    }

    if (path === "/admin/products/new" || path === "/products/new") {
      return "Add Product";
    }

    if (path.includes("/products/") && path.endsWith("/edit")) {
      return "Edit Product";
    }

    if (path === "/admin/categories" || path === "/categories") {
      return "Categories";
    }

    if (path === "/admin/categories/new" || path === "/categories/new") {
      return "Add Category";
    }

    if (path.includes("/categories/") && path.endsWith("/edit")) {
      return "Edit Category";
    }

    if (path === "/admin/subcategories" || path === "/subcategories") {
      return "Subcategories";
    }

    if (path === "/admin/subcategories/new" || path === "/subcategories/new") {
      return "Add Subcategory";
    }

    if (path.includes("/subcategories/") && path.endsWith("/edit")) {
      return "Edit Subcategory";
    }

    if (path === "/admin/collections" || path === "/collections") {
      return "Collections";
    }

    if (path === "/admin/collections/new" || path === "/collections/new") {
      return "Add Collection";
    }

    if (path.includes("/collections/") && path.endsWith("/edit")) {
      return "Edit Collection";
    }

    if (path === "/admin/attributes" || path === "/attributes") {
      return "Attributes";
    }

    if (path === "/admin/attributes/new" || path === "/attributes/new") {
      return "Add Attribute";
    }

    if (path.includes("/attributes/") && path.endsWith("/edit")) {
      return "Edit Attribute";
    }

    if (path === "/admin/tags" || path === "/tags") {
      return "Tags";
    }

    if (path === "/admin/tags/new" || path === "/tags/new") {
      return "Add Tag";
    }

    if (path.includes("/tags/") && path.endsWith("/edit")) {
      return "Edit Tag";
    }

    if (path === "/admin/homepage" || path === "/homepage") {
      return "Homepage";
    }

    if (path === "/admin/banners" || path === "/banners") {
      return "Banners";
    }

    if (path === "/admin/navigation" || path === "/navigation") {
      return "Navigation";
    }

    if (path === "/admin/pages" || path === "/pages") {
      return "Pages";
    }

    if (path === "/admin/customers" || path === "/customers") {
      return "Customers";
    }

    if (path === "/admin/enquiries" || path === "/enquiries") {
      return "Enquiries";
    }

    if (path === "/admin/media" || path === "/media") {
      return "Media Library";
    }

    if (path === "/admin/analytics" || path === "/analytics") {
      return "Analytics";
    }

    if (path === "/admin/settings" || path === "/settings") {
      return "Settings";
    }

    return "Admin";
  };

  return (
    <header className="admin-header">

      {/* LEFT */}

      <div className="header-left">

        <button
          className="header-menu-btn"
          type="button"
          aria-label="Open menu"
        >
          <Menu size={19} />
        </button>

        <div className="header-page-title">

          {/* <span>
            ADMIN PANEL
          </span> */}

          <h1>
            {getPageTitle()}
          </h1>

        </div>

      </div>


      {/* RIGHT */}

      <div className="header-actions">

        {/* Search */}

        <div className="header-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search..."
          />

        </div>


        {/* Notification */}

        <button
          className="header-icon-btn"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={17} />
        </button>


        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className="admin-user cursor-pointer"
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
          >
            <div className="admin-avatar">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>

            <div className="admin-user-info">
              <strong>{user?.name || "Admin"}</strong>
              <span>{user?.role ? user.role.replace("_", " ") : "Administrator"}</span>
            </div>

            <ChevronDown size={15} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 border border-[#e7dfd3] bg-[#fffdf9] p-2 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-[#e7dfd3]">
                <p className="text-xs font-semibold text-[#1e1c19] truncate">{user?.name}</p>
                <p className="text-[11px] text-[#716b62] truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-[#f4efe6] text-[#b99657]">
                  {user?.role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#a64b42] hover:bg-[#fcf2f1] transition-colors mt-1 cursor-pointer"
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