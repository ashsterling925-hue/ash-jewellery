import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api/authApi";
import { setAccessToken, setRefreshToken, getAccessToken, getRefreshToken } from "@/lib/api/client";

const AuthContext = createContext(null);

// Role-to-permissions mapping mirroring backend permissions matrix
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: "*", // All permissions
  ADMIN: [
    "DASHBOARD_VIEW",
    "PRODUCT_VIEW", "PRODUCT_CREATE", "PRODUCT_UPDATE", "PRODUCT_DELETE",
    "CATEGORY_VIEW", "CATEGORY_CREATE", "CATEGORY_UPDATE", "CATEGORY_DELETE",
    "COLLECTION_VIEW", "COLLECTION_CREATE", "COLLECTION_UPDATE", "COLLECTION_DELETE",
    "ATTRIBUTE_VIEW", "ATTRIBUTE_CREATE", "ATTRIBUTE_UPDATE", "ATTRIBUTE_DELETE",
    "TAG_VIEW", "TAG_CREATE", "TAG_UPDATE", "TAG_DELETE",
    "MEDIA_VIEW", "MEDIA_CREATE", "MEDIA_UPDATE", "MEDIA_DELETE",
    "HERO_VIEW", "HERO_UPDATE",
    "BANNER_VIEW", "BANNER_CREATE", "BANNER_UPDATE", "BANNER_DELETE",
    "SPECIAL_OFFER_VIEW", "SPECIAL_OFFER_CREATE", "SPECIAL_OFFER_UPDATE", "SPECIAL_OFFER_DELETE",
    "SETTINGS_VIEW",
  ],
  STAFF: [
    "DASHBOARD_VIEW",
    "PRODUCT_VIEW", "PRODUCT_CREATE", "PRODUCT_UPDATE",
    "CATEGORY_VIEW",
    "COLLECTION_VIEW",
    "ATTRIBUTE_VIEW",
    "TAG_VIEW",
    "MEDIA_VIEW", "MEDIA_CREATE",
    "HERO_VIEW",
    "BANNER_VIEW",
    "SPECIAL_OFFER_VIEW",
  ],
};

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ash_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const hasToken = localStorage.getItem("ash_access_token");
      const hasUser = localStorage.getItem("ash_user");
      // If we already have stored session, don't show full-page loading blocker
      return !(hasToken && hasUser);
    }
    return true;
  });

  // Verify and maintain session
  const checkAuth = useCallback(async () => {
    try {
      const token = getAccessToken();
      const storedUser = getStoredUser();

      // 1. If we have a token and user, verify with getMe() first (faster and doesn't rotate refresh token)
      if (token && storedUser) {
        try {
          const meRes = await authApi.getMe();
          if (meRes?.data?.user) {
            setUser(meRes.data.user);
            localStorage.setItem("ash_user", JSON.stringify(meRes.data.user));
            setLoading(false);
            return;
          }
        } catch (meErr) {
          // If token expired, fall through to refresh
          console.warn("Access token verification notice, attempting refresh:", meErr?.message);
        }
      }

      // 2. Try refreshing token session
      const storedRefresh = getRefreshToken();
      const res = await authApi.refresh({ refreshToken: storedRefresh || undefined });
      if (res?.data?.accessToken && res?.data?.user) {
        setAccessToken(res.data.accessToken);
        if (res.data.refreshToken) {
          setRefreshToken(res.data.refreshToken);
        }
        setUser(res.data.user);
        localStorage.setItem("ash_user", JSON.stringify(res.data.user));
      } else if (!storedUser) {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("ash_user");
      }
    } catch (err) {
      console.warn("Auth check failed:", err?.message);
      // Only wipe user if we didn't have a valid active session
      const storedUser = getStoredUser();
      if (!storedUser) {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("ash_user");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res?.data?.accessToken && res?.data?.user) {
      setAccessToken(res.data.accessToken);
      if (res.data.refreshToken) {
        setRefreshToken(res.data.refreshToken);
      }
      setUser(res.data.user);
      localStorage.setItem("ash_user", JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error("Invalid response from authentication server");
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout notice:", err);
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem("ash_user");
    }
  };

  // Permission helper for UI components
  const hasPermission = useCallback(
    (permission) => {
      if (!user || !user.role) return false;
      const role = user.role.toUpperCase();
      if (role === "SUPER_ADMIN") return true;

      const perms = ROLE_PERMISSIONS[role];
      if (perms === "*") return true;
      if (Array.isArray(perms)) {
        return perms.includes(permission);
      }
      return false;
    },
    [user]
  );

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    hasPermission,
    can: hasPermission,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
