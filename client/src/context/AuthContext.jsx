import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me")
      .then((response) => {
        if (active) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // REGISTER
  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    return response.data;
  };

  // VERIFY EMAIL
  const verifyEmail = async (token) => {
    const response = await api.post("/auth/verify-email", {
      token,
    });

    return response.data;
  };

  // RESEND VERIFICATION
  const resendVerification = async (email) => {
    const response = await api.post(
      "/auth/resend-verification",
      { email }
    );

    return response.data;
  };

  // LOGIN
  const login = async (formData) => {
    const response = await api.post("/auth/login", formData);

    setUser(response.data.user);

    return response.data;
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email }
    );

    return response.data;
  };

  // RESET PASSWORD
  const resetPassword = async (token, password) => {
    const response = await api.post(
      "/auth/reset-password",
      { token, password }
    );

    return response.data;
  };

  // LOGOUT
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}