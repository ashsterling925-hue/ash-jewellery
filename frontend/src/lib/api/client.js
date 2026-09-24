/**
 * Centralized API client for ASH Jewellery Frontend
 */

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

let inMemoryAccessToken =
  typeof window !== "undefined" ? localStorage.getItem("ash_access_token") : null;

let refreshPromise = null;

/**
 * Update the access token in memory and local storage
 * @param {string|null} token
 */
export function setAccessToken(token) {
  inMemoryAccessToken = token || null;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("ash_access_token", token);
    } else {
      localStorage.removeItem("ash_access_token");
    }
  }
}

/**
 * Update the refresh token in local storage
 * @param {string|null} token
 */
export function setRefreshToken(token) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("ash_refresh_token", token);
    } else {
      localStorage.removeItem("ash_refresh_token");
    }
  }
}

/**
 * Get the current refresh token from local storage
 * @returns {string|null}
 */
export function getRefreshToken() {
  return typeof window !== "undefined" ? localStorage.getItem("ash_refresh_token") : null;
}

/**
 * Get the current in-memory access token
 * @returns {string|null}
 */
export function getAccessToken() {
  if (!inMemoryAccessToken && typeof window !== "undefined") {
    inMemoryAccessToken = localStorage.getItem("ash_access_token");
  }
  return inMemoryAccessToken;
}

/**
 * Custom API Error class for frontend handling
 */
export class ApiClientError extends Error {
  constructor(message, status = 500, code = "UNKNOWN_ERROR", errors = []) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

/**
 * Perform an HTTP request to the backend API
 * @param {string} endpoint - API route e.g. "/categories"
 * @param {Object} options - fetch options + optional `params`
 */
export async function apiRequest(endpoint, options = {}) {
  const { params, headers = {}, body, _retry = false, ...customConfig } = options;

  let url = `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  // Attach query parameters if provided
  if (params && typeof params === "object") {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const currentToken = getAccessToken();
  const authHeaders = {};
  if (currentToken && !headers["Authorization"] && !headers["authorization"]) {
    authHeaders["Authorization"] = `Bearer ${currentToken}`;
  }

  const config = {
    method: "GET",
    credentials: "include", // Enable HttpOnly cookies across cross-origin/same-origin
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders,
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Auto-refresh token on 401 unauthorized if not already an auth endpoint
    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    if (
      response.status === 401 &&
      !_retry &&
      !cleanEndpoint.startsWith("auth/login") &&
      !cleanEndpoint.startsWith("auth/register")
    ) {
      // Use single in-flight promise to prevent concurrent refresh races
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const rawStoredRefreshToken = getRefreshToken();
            const refreshResponse = await fetch(`${BASE_URL.replace(/\/+$/, "")}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                refreshToken: rawStoredRefreshToken || undefined,
              }),
            });

            if (refreshResponse.ok) {
              const refreshResult = await refreshResponse.json();
              const newAccessToken = refreshResult?.data?.accessToken;
              const newRefreshToken = refreshResult?.data?.refreshToken;
              if (newAccessToken) {
                setAccessToken(newAccessToken);
                if (newRefreshToken) {
                  setRefreshToken(newRefreshToken);
                }
                return newAccessToken;
              }
            }
            return null;
          } catch (err) {
            console.warn("Background token refresh attempt failed:", err);
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const refreshedToken = await refreshPromise;
      if (refreshedToken) {
        // Retry the original request once with new token
        return apiRequest(endpoint, {
          ...options,
          _retry: true,
          headers: {
            ...headers,
            Authorization: `Bearer ${refreshedToken}`,
          },
        });
      }
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const responseData = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMessage =
        responseData?.message || `Request failed with status ${response.status}`;
      const errorCode = responseData?.code || "REQUEST_FAILED";
      const errorList = responseData?.errors || [];

      throw new ApiClientError(
        errorMessage,
        response.status,
        errorCode,
        errorList
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    // Network or parse error
    throw new ApiClientError(
      error.message || "Network connection error",
      0,
      "NETWORK_ERROR"
    );
  }
}

export const api = {
  get: (endpoint, params, options) =>
    apiRequest(endpoint, { method: "GET", params, ...options }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, { method: "POST", body, ...options }),
  patch: (endpoint, body, options) =>
    apiRequest(endpoint, { method: "PATCH", body, ...options }),
  delete: (endpoint, options) =>
    apiRequest(endpoint, { method: "DELETE", ...options }),
};

export default api;
