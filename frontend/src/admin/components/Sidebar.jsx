import {
  LayoutDashboard,
  Package,
  Tags,
  Layers3,
  FolderKanban,
  SlidersHorizontal,
  Tag,
  Home,
  Image,
  Menu,
  FileText,
  Users,
  MessageSquare,
  Images,
  BarChart3,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


/* =========================================================
   NAVIGATION DATA
   ========================================================= */

const catalogueItems = [
  {
    name: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Subcategories",
    path: "/admin/subcategories",
    icon: Layers3,
  },
  {
    name: "Collections",
    path: "/admin/collections",
    icon: FolderKanban,
  },
  {
    name: "Attributes",
    path: "/admin/attributes",
    icon: SlidersHorizontal,
  },
  {
    name: "Tags",
    path: "/admin/tags",
    icon: Tag,
  },
];


const contentItems = [
  {
    name: "Homepage",
    path: "/admin/homepage",
    icon: Home,
  },
  {
    name: "Banners",
    path: "/admin/banners",
    icon: Image,
  },
  {
    name: "Navigation",
    path: "/admin/navigation",
    icon: Menu,
  },
  {
    name: "Pages",
    path: "/admin/pages",
    icon: FileText,
  },
];


const managementItems = [
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    name: "Enquiries",
    path: "/admin/enquiries",
    icon: MessageSquare,
  },
  {
    name: "Media Library",
    path: "/admin/media",
    icon: Images,
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];


/* =========================================================
   NAVIGATION ITEM
   ========================================================= */

function NavigationItem({ item, onItemClick }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onItemClick}
      className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`
      }
    >
      <Icon
        size={16}
        strokeWidth={1.7}
      />

      <span>
        {item.name}
      </span>
    </NavLink>
  );
}


/* =========================================================
   NAVIGATION SECTION
   ========================================================= */

function NavigationSection({
  title,
  items,
  onItemClick,
}) {
  return (
    <div className="nav-section">

      <div className="nav-section-title">

        <span>
          {title}
        </span>

        <ChevronDown
          size={12}
          strokeWidth={1.8}
        />

      </div>


      <div className="nav-section-items">

        {items.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
            onItemClick={onItemClick}
          />
        ))}

      </div>

    </div>
  );
}


/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user } = useAuth();

  const handleItemClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? "mobile-drawer-open" : ""}`}>

        {/* ===================================================
            BRAND
            =================================================== */}

        <div className="sidebar-brand relative">

          <div className="sidebar-brand-inner">
            <div className="sidebar-brand-subtitle">
              ADMIN PANEL
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>

        </div>


        {/* ===================================================
            NAVIGATION
            =================================================== */}

        <nav className="sidebar-nav">

          {/* Dashboard */}

          <div className="dashboard-nav">

            <NavLink
              to="/admin/dashboard"
              onClick={handleItemClick}
              className={({ isActive }) =>
                `nav-item dashboard-item ${
                  isActive ? "active" : ""
                }`
              }
            >

              <LayoutDashboard
                size={16}
                strokeWidth={1.7}
              />

              <span>
                Dashboard
              </span>

            </NavLink>

          </div>


          {/* Catalogue */}

          <NavigationSection
            title="CATALOGUE"
            items={catalogueItems}
            onItemClick={handleItemClick}
          />


          {/* Content */}

          <NavigationSection
            title="CONTENT"
            items={contentItems}
            onItemClick={handleItemClick}
          />


          {/* Management */}

          <NavigationSection
            title="MANAGEMENT"
            items={managementItems}
            onItemClick={handleItemClick}
          />

        </nav>


        {/* ===================================================
            PROFILE
            =================================================== */}

        <div className="sidebar-footer">

          <div className="admin-profile">

            <div className="profile-avatar">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>


            <div className="profile-info">

              <strong>
                {user?.name || "Admin"}
              </strong>

              <span>
                {user?.role ? user.role.replace("_", " ") : "Administrator"}
              </span>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}