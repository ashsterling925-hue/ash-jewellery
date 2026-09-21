import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/storefront/HomePage";
import ProductDetailsPage from "../pages/storefront/ProductDetailsPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import RegisterPage from "../pages/auth/RegisterPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bangles" element={<ProductDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
