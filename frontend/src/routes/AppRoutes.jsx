import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Storefront pages
import HomePage from "@/storefront/pages/HomePage";
import ProductDetailsPage from "@/storefront/pages/ProductDetailsPage";
import CataloguePage from "@/storefront/pages/CataloguePage";
import LoginPage from "@/storefront/pages/auth/LoginPage";
import ForgotPasswordPage from "@/storefront/pages/auth/ForgotPasswordPage";
import RegisterPage from "@/storefront/pages/auth/RegisterPage";
import ResetPasswordPage from "@/storefront/pages/auth/ResetPasswordPage";

// Authentication & Route Guards
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";

// Admin layout
import AdminLayout from "@/admin/layouts/AdminLayout";

// Admin pages
import Dashboard from "@/admin/pages/Dashboard";
import Products from "@/admin/pages/Products";
import AddProduct from "@/admin/pages/AddProduct";
import EditProduct from "@/admin/pages/EditProduct";
import Categories from "@/admin/pages/Categories";
import AddCategory from "@/admin/pages/AddCategory";
import EditCategory from "@/admin/pages/EditCategory";
import Subcategories from "@/admin/pages/subcategories/Subcategories";
import AddSubcategories from "@/admin/pages/subcategories/AddSubcategories";
import EditSubcategories from "@/admin/pages/subcategories/EditSubcategories";
import Collections from "@/admin/pages/collections/Collections";
import AddCollections from "@/admin/pages/collections/AddCollections";
import EditCollections from "@/admin/pages/collections/EditCollections";
import Attributes from "@/admin/pages/attributes/Attributes";
import AddAttributes from "@/admin/pages/attributes/AddAttributes";
import EditAttributes from "@/admin/pages/attributes/EditAttributes";
import Tags from "@/admin/pages/tags/Tags";
import AddTags from "@/admin/pages/tags/AddTags";
import EditTags from "@/admin/pages/tags/EditTags";
import Homepage from "@/admin/pages/homepage/Homepage";
import Banners from "@/admin/pages/banners/Banners";
import Navigation from "@/admin/pages/navigation/Navigation";
import Pages from "@/admin/pages/pages/Pages";
import Customers from "@/admin/pages/customers/Customers";
import Enquiries from "@/admin/pages/enquiries/Enquiries";
import Media from "@/admin/pages/media/Media";
import Analytics from "@/admin/pages/analytics/Analytics";
import Settings from "@/admin/pages/settings/Settings";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />
          <Route path="/category/:categorySlug" element={<CataloguePage />} />
          <Route path="/subcategory/:subcategorySlug" element={<CataloguePage />} />
          <Route path="/collection/:collectionSlug" element={<CataloguePage />} />
          <Route path="/search" element={<CataloguePage />} />
          <Route path="/bangles" element={<CataloguePage forcedCategorySlug="bangles" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes (Protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
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

          {/* Fallback inside admin */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Friendly convenience redirects for direct URLs */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/products" element={<Navigate to="/admin/products" replace />} />
        <Route path="/categories" element={<Navigate to="/admin/categories" replace />} />

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}
