
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

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
        if (active) setUser(response.data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    setUser(response.data.user);
    return response.data;
  };

  const login = async (formData) => {
    const response = await api.post("/auth/login", formData);
    setUser(response.data.user);
    return response.data;
  };

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
        login,
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
