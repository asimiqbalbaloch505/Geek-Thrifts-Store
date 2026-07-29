import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type UserAuthContextType = {
  userToken: string | null;
  user: UserProfile | null;
  userLogin: (token: string, user: UserProfile) => void;
  userLogout: () => void;
  isUserLoggedIn: boolean;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(() => {
    return localStorage.getItem("userToken");
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    if (userToken && user) {
      localStorage.setItem("userToken", userToken);
      localStorage.setItem("userProfile", JSON.stringify(user));
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userProfile");
    }
  }, [userToken, user]);

  const userLogin = (token: string, profile: UserProfile) => {
    setUserToken(token);
    setUser(profile);
  };

  const userLogout = () => {
    setUserToken(null);
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ userToken, user, userLogin, userLogout, isUserLoggedIn: !!userToken }}>
      {children}
    </UserAuthContext.Provider>
  );
}

// Ensure this hook is explicitly exported as a named export
export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error("useUserAuth must be used within UserAuthProvider");
  return context;
}