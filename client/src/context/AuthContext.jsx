import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

// ============================================
// API CONFIGURATION
// ============================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: API_URL,

  // Required for cross-origin authentication cookies.
  withCredentials: true,

  // Allow time for Render cold starts.
  timeout: 60000,

  headers: {
    "Content-Type": "application/json",
  },
});

export { api };

// ============================================
// AUTH PROVIDER
// ============================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // CHECK EXISTING SESSION
  // ============================================

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await api.get("/auth/me");

        if (active) {
          setUser(response.data.user || null);
        }
      } catch (error) {
        if (active) {
          setUser(null);

          // A 401 is normal when a visitor is logged out.
          if (error.response?.status !== 401) {
            console.error(
              "Session check failed:",
              error.response?.data?.message ||
                error.message
            );
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  // ============================================
  // REGISTER
  // ============================================

  const register = async (formData) => {
    const response = await api.post(
      "/auth/register",
      formData
    );

    return response.data;
  };

  // ============================================
  // VERIFY EMAIL
  // ============================================

  const verifyEmail = async (token) => {
    const response = await api.post(
      "/auth/verify-email",
      { token }
    );

    return response.data;
  };

  // ============================================
  // RESEND VERIFICATION EMAIL
  // ============================================

  const resendVerification = async (email) => {
    const response = await api.post(
      "/auth/resend-verification",
      { email }
    );

    return response.data;
  };

  // ============================================
  // LOGIN
  // ============================================

  const login = async (formData) => {
    const response = await api.post(
      "/auth/login",
      formData
    );

    setUser(response.data.user);

    return response.data;
  };

  // ============================================
  // FORGOT PASSWORD
  // ============================================

  const forgotPassword = async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email }
    );

    return response.data;
  };

  // ============================================
  // RESET PASSWORD
  // ============================================

  const resetPassword = async (token, password) => {
    const response = await api.post(
      "/auth/reset-password",
      {
        token,
        password,
      }
    );

    return response.data;
  };

  // ============================================
  // LOGOUT
  // ============================================

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),

    register,
    verifyEmail,
    resendVerification,

    login,
    forgotPassword,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// CUSTOM AUTH HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}