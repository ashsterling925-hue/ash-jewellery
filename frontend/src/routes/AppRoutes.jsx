import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useAuth, AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import RouteErrorBoundary from "@/routes/RouteErrorBoundary";
import HomeSkeleton from "@/storefront/components/HomeSkeleton";

// Lazy-loaded storefront pages
const HomePage = lazy(() => import("@/storefront/pages/HomePage"));
const ProductDetailsPage = lazy(
  () => import("@/storefront/pages/ProductDetailsPage"),
);
const CataloguePage = lazy(() => import("@/storefront/pages/CataloguePage"));
const LoginPage = lazy(() => import("@/storefront/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("@/storefront/pages/auth/ForgotPasswordPage"),
);
const RegisterPage = lazy(() => import("@/storefront/pages/auth/RegisterPage"));
const ResetPasswordPage = lazy(
  () => import("@/storefront/pages/auth/ResetPasswordPage"),
);
const AboutPage = lazy(() => import("../storefront/pages/AboutPage"));
const TermsAndConditionsPage = lazy(
  () => import("../storefront/pages/TermsAndConditionsPage"),
);

// Lazy-loaded Admin Layout & Administration Views
const AdminLayout = lazy(() => import("@/admin/layouts/AdminLayout"));
const Dashboard = lazy(() => import("@/admin/pages/Dashboard"));
const Products = lazy(() => import("@/admin/pages/Products"));
const AddProduct = lazy(() => import("@/admin/pages/AddProduct"));
const EditProduct = lazy(() => import("@/admin/pages/EditProduct"));
const Categories = lazy(() => import("@/admin/pages/Categories"));
const AddCategory = lazy(() => import("@/admin/pages/AddCategory"));
const EditCategory = lazy(() => import("@/admin/pages/EditCategory"));
const Subcategories = lazy(
  () => import("@/admin/pages/subcategories/Subcategories"),
);
const AddSubcategories = lazy(
  () => import("@/admin/pages/subcategories/AddSubcategories"),
);
const EditSubcategories = lazy(
  () => import("@/admin/pages/subcategories/EditSubcategories"),
);
const Collections = lazy(() => import("@/admin/pages/collections/Collections"));
const AddCollections = lazy(
  () => import("@/admin/pages/collections/AddCollections"),
);
const EditCollections = lazy(
  () => import("@/admin/pages/collections/EditCollections"),
);
const Attributes = lazy(() => import("@/admin/pages/attributes/Attributes"));
const AddAttributes = lazy(
  () => import("@/admin/pages/attributes/AddAttributes"),
);
const EditAttributes = lazy(
  () => import("@/admin/pages/attributes/EditAttributes"),
);
const Tags = lazy(() => import("@/admin/pages/tags/Tags"));
const AddTags = lazy(() => import("@/admin/pages/tags/AddTags"));
const EditTags = lazy(() => import("@/admin/pages/tags/EditTags"));
const Homepage = lazy(() => import("@/admin/pages/homepage/Homepage"));
const Banners = lazy(() => import("@/admin/pages/banners/Banners"));
const Navigation = lazy(() => import("@/admin/pages/navigation/Navigation"));
const Pages = lazy(() => import("@/admin/pages/pages/Pages"));
const Customers = lazy(() => import("@/admin/pages/customers/Customers"));
const Enquiries = lazy(() => import("@/admin/pages/enquiries/Enquiries"));
const Media = lazy(() => import("@/admin/pages/media/Media"));
const Analytics = lazy(() => import("@/admin/pages/analytics/Analytics"));
const Settings = lazy(() => import("@/admin/pages/settings/Settings"));

/**
 * Luxury fallback indicator for storefront lazy chunk loading
 */
function StorefrontLoadingFallback() {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 bg-[#fffdf9]">
      <div className="w-full h-[2.5px] luxury-gold-bar fixed top-0 left-0 z-50 shadow-xs" />
      <div className="w-8 h-8 rounded-full border-2 border-[#b99657]/30 border-t-[#b99657] animate-spin mb-3" />
      <span className="font-serif text-[11px] tracking-[0.25em] text-[#8a7f72] uppercase">
        ASH JEWELLERY
      </span>
    </div>
  );
}

/**
 * Clean fallback indicator for admin dashboard and workspace chunk loading
 */
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fdfcf9]">
      <div className="w-full h-[2.5px] luxury-gold-bar fixed top-0 left-0 z-50 shadow-xs" />
      <div className="w-8 h-8 rounded-full border-2 border-[#10233f]/30 border-t-[#10233f] animate-spin mb-3" />
      <span className="font-serif text-[11px] tracking-[0.25em] text-[#716b62] uppercase">
        Loading Admin Workspace...
      </span>
    </div>
  );
}

/**
 * Guard that prevents administrative users (SUPER_ADMIN, ADMIN, STAFF)
 * from viewing the customer-facing storefront website.
 * Any logged-in admin is automatically redirected to /admin/dashboard.
 */
function StorefrontGuard() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].some((path) => location.pathname.startsWith(path));

  if (!isAuthPage && isAuthenticated && user?.role) {
    const role = user.role.toUpperCase();
    if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteErrorBoundary>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<StorefrontLoadingFallback />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <Suspense fallback={<StorefrontLoadingFallback />}>
                  <ForgotPasswordPage />
                </Suspense>
              }
            />
            <Route
              path="/reset-password"
              element={
                <Suspense fallback={<StorefrontLoadingFallback />}>
                  <ResetPasswordPage />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<StorefrontLoadingFallback />}>
                  <RegisterPage />
                </Suspense>
              }
            />

            {/* Storefront Routes (Blocked for logged-in Admin/Staff users) */}
            <Route element={<StorefrontGuard />}>
              {/* Critical Home route lazy-loaded with instant luxury skeleton */}
              <Route
                path="/"
                element={
                  <Suspense fallback={<HomeSkeleton />}>
                    <HomePage />
                  </Suspense>
                }
              />

              <Route
                path="/product/:slug"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <ProductDetailsPage />
                  </Suspense>
                }
              />
              <Route
                path="/category"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage />
                  </Suspense>
                }
              />
              <Route
                path="/catalogue"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage />
                  </Suspense>
                }
              />
              <Route
                path="/collections"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage />
                  </Suspense>
                }
              />
              <Route
                path="/category/:categorySlug"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage />
                  </Suspense>
                }
              />
              <Route
                path="/subcategory/:subcategorySlug"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage />
                  </Suspense>
                }
              />
              <Route
                path="/collection/:collectionSlug"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage />
                  </Suspense>
                }
              />
              <Route
                path="/search"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage />
                  </Suspense>
                }
              />
              <Route
                path="/bangles"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <CataloguePage forcedCategorySlug="bangles" />
                  </Suspense>
                }
              />

              <Route
                path="/about"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <AboutPage />
                  </Suspense>
                }
              />

              <Route
                path="/terms-and-conditions"
                element={
                  <Suspense fallback={<StorefrontLoadingFallback />}>
                    <TermsAndConditionsPage />
                  </Suspense>
                }
              />
            </Route>
            {/* Admin Routes (Protected and fully lazy loaded) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <AdminLayout />
                  </Suspense>
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
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
              <Route
                path="subcategories/:id/edit"
                element={<EditSubcategories />}
              />

              {/* Collections */}
              <Route path="collections" element={<Collections />} />
              <Route path="collections/new" element={<AddCollections />} />
              <Route
                path="collections/:id/edit"
                element={<EditCollections />}
              />

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
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>

            {/* Friendly convenience redirects for direct URLs */}
            <Route
              path="/dashboard"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/products"
              element={<Navigate to="/admin/products" replace />}
            />
            <Route
              path="/categories"
              element={<Navigate to="/admin/categories" replace />}
            />

            {/* Global Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
