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

function NavigationItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
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
          />
        ))}

      </div>

    </div>
  );
}


/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="admin-sidebar">

      {/* ===================================================
          BRAND
          =================================================== */}

      <div className="sidebar-brand">

        <div className="sidebar-brand-inner">

          {/* <div className="sidebar-brand-main">
            ASH
          </div>

          <div className="sidebar-brand-name">
            JEWELLERY
          </div> */}

          <div className="sidebar-brand-subtitle">
            ADMIN PANEL
          </div>

        </div>

      </div>


      {/* ===================================================
          NAVIGATION
          =================================================== */}

      <nav className="sidebar-nav">

        {/* Dashboard */}

        <div className="dashboard-nav">

          <NavLink
            to="/admin/dashboard"
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
        />


        {/* Content */}

        <NavigationSection
          title="CONTENT"
          items={contentItems}
        />


        {/* Management */}

        <NavigationSection
          title="MANAGEMENT"
          items={managementItems}
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
  );
}