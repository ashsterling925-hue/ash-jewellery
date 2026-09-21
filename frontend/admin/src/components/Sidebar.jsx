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


/* =========================================================
   NAVIGATION DATA
   ========================================================= */

const catalogueItems = [
  {
    name: "Products",
    path: "/products",
    icon: Package,
  },
  {
    name: "Categories",
    path: "/categories",
    icon: Tags,
  },
  {
    name: "Subcategories",
    path: "/subcategories",
    icon: Layers3,
  },
  {
    name: "Collections",
    path: "/collections",
    icon: FolderKanban,
  },
  {
    name: "Attributes",
    path: "/attributes",
    icon: SlidersHorizontal,
  },
  {
    name: "Tags",
    path: "/tags",
    icon: Tag,
  },
];


const contentItems = [
  {
    name: "Homepage",
    path: "/homepage",
    icon: Home,
  },
  {
    name: "Banners",
    path: "/banners",
    icon: Image,
  },
  {
    name: "Navigation",
    path: "/navigation",
    icon: Menu,
  },
  {
    name: "Pages",
    path: "/pages",
    icon: FileText,
  },
];


const managementItems = [
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    name: "Enquiries",
    path: "/enquiries",
    icon: MessageSquare,
  },
  {
    name: "Media Library",
    path: "/media",
    icon: Images,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    path: "/settings",
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
            to="/dashboard"
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
            A
          </div>


          <div className="profile-info">

            <strong>
              Admin
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}