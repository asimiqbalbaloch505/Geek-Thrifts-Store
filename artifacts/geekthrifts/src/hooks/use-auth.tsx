import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper to safely decode a JWT token payload without external libraries
 */
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Validates that the token strictly belongs to an Admin and is not expired
 */
function isValidAdminToken(token: string | null): boolean {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload) return false;

  const isAdmin = payload.role === "admin";
  const isNotExpired = payload.exp ? payload.exp * 1000 > Date.now() : true;

  return isAdmin && isNotExpired;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (isValidAdminToken(storedToken)) {
      return storedToken;
    }
    // Clean up if the stored token isn't a valid admin token
    localStorage.removeItem("adminToken");
    return null;
  });

  useEffect(() => {
    if (token && isValidAdminToken(token)) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  const login = (newToken: string) => {
    if (isValidAdminToken(newToken)) {
      setToken(newToken);
    } else {
      console.error("Login failed: Provided token is not an admin token.");
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
  };

  const isAuthenticated = isValidAdminToken(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}