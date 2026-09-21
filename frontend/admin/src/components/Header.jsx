import {
  Search,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";

import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/dashboard" || path === "/") {
      return "Dashboard";
    }

    if (path === "/products") {
      return "Products";
    }

    if (path === "/products/new") {
      return "Add Product";
    }

    if (path.startsWith("/products/") && path.endsWith("/edit")) {
      return "Edit Product";
    }

    if (path === "/categories") {
      return "Categories";
    }

    if (path === "/categories/new") {
      return "Add Category";
    }

    if (path.startsWith("/categories/") && path.endsWith("/edit")) {
      return "Edit Category";
    }

    if (path === "/subcategories") {
      return "Subcategories";
    }

    if (path === "/subcategories/new") {
      return "Add Subcategory";
    }

    if (path.startsWith("/subcategories/") && path.endsWith("/edit")) {
      return "Edit Subcategory";
    }

    if (path === "/collections") {
      return "Collections";
    }

    if (path === "/collections/new") {
      return "Add Collection";
    }

    if (path.startsWith("/collections/") && path.endsWith("/edit")) {
      return "Edit Collection";
    }

    if (path === "/attributes") {
      return "Attributes";
    }

    if (path === "/attributes/new") {
      return "Add Attribute";
    }

    if (path.startsWith("/attributes/") && path.endsWith("/edit")) {
      return "Edit Attribute";
    }

    if (path === "/tags") {
      return "Tags";
    }

    if (path === "/tags/new") {
      return "Add Tag";
    }

    if (path.startsWith("/tags/") && path.endsWith("/edit")) {
      return "Edit Tag";
    }

    if (path === "/homepage") {
      return "Homepage";
    }

    if (path === "/banners") {
      return "Banners";
    }

    if (path === "/navigation") {
      return "Navigation";
    }

    if (path === "/pages") {
      return "Pages";
    }

    if (path === "/customers") {
      return "Customers";
    }

    if (path === "/enquiries") {
      return "Enquiries";
    }

    if (path === "/media") {
      return "Media Library";
    }

    if (path === "/analytics") {
      return "Analytics";
    }

    if (path === "/settings") {
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


        {/* User */}

        <button
          className="admin-user"
          type="button"
        >

          <div className="admin-avatar">
            A
          </div>

          <div className="admin-user-info">

            <strong>
              Admin
            </strong>

            <span>
              Administrator
            </span>

          </div>

          <ChevronDown size={15} />

        </button>

      </div>

    </header>
  );
}