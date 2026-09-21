import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Products
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";

// Categories
import Categories from "./pages/Categories";
import AddCategory from "./pages/AddCategory";
import EditCategory from "./pages/EditCategory";

// Subcategories
import Subcategories from "./pages/subcategories/Subcategories";
import AddSubcategories from "./pages/subcategories/AddSubcategories";
import EditSubcategories from "./pages/subcategories/EditSubcategories";

// Collections
import Collections from "./pages/collections/Collections";
import AddCollections from "./pages/collections/AddCollections";
import EditCollections from "./pages/collections/EditCollections";

// Attributes
import Attributes from "./pages/attributes/Attributes";
import AddAttributes from "./pages/attributes/AddAttributes";
import EditAttributes from "./pages/attributes/EditAttributes";

// Tags
import Tags from "./pages/tags/Tags";
import AddTags from "./pages/tags/AddTags";
import EditTags from "./pages/tags/EditTags";

// Content
import Homepage from "./pages/homepage/Homepage";
import Banners from "./pages/banners/Banners";
import Navigation from "./pages/navigation/Navigation";
import Pages from "./pages/pages/Pages";

// Management
import Customers from "./pages/customers/Customers";
import Enquiries from "./pages/enquiries/Enquiries";
import Media from "./pages/media/Media";
import Analytics from "./pages/analytics/Analytics";
import Settings from "./pages/settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Everything in the admin panel uses the same shell. */}
        <Route path="/" element={<AdminLayout />}>
          {/* / → /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Products */}
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />

          {/* Categories */}
          <Route path="categories" element={<Categories />} />
          <Route path="categories/new" element={<AddCategory />} />
          <Route path="categories/:id/edit" element={<EditCategory />} />

          {/* Subcategories */}
          <Route path="subcategories" element={<Subcategories />} />
          <Route path="subcategories/new" element={<AddSubcategories />} />
          <Route path="subcategories/:id/edit" element={<EditSubcategories />} />

          {/* Collections */}
          <Route path="collections" element={<Collections />} />
          <Route path="collections/new" element={<AddCollections />} />
          <Route path="collections/:id/edit" element={<EditCollections />} />

          {/* Attributes */}
          <Route path="attributes" element={<Attributes />} />
          <Route path="attributes/new" element={<AddAttributes />} />
          <Route path="attributes/:id/edit" element={<EditAttributes />} />

          {/* Tags */}
          <Route path="tags" element={<Tags />} />
          <Route path="tags/new" element={<AddTags />} />
          <Route path="tags/:id/edit" element={<EditTags />} />

          {/* Content */}
          <Route path="homepage" element={<Homepage />} />
          <Route path="banners" element={<Banners />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="pages" element={<Pages />} />

          {/* Management */}
          <Route path="customers" element={<Customers />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="media" element={<Media />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />

          {/* Unknown admin URL */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
