import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Route Guard for Protected Admin Views
 * Ensures the user has an active, authenticated session before rendering.
 * Avoids any flash of dashboard content prior to redirection.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fffdf9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#b99657]" />
          <p className="font-serif text-sm tracking-widest text-[#1e1c19] uppercase">
            ASH JEWELLERY
          </p>
          <span className="text-[10px] tracking-wider text-[#716b62] uppercase">
            Verifying administrative access...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve intended destination so user returns there after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
