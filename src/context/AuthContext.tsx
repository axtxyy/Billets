import { useState, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContextDef";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("authUser");
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          localStorage.removeItem("authUser");
        }
      }
    }
    return null;
  });
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (!email || !password) throw new Error("Email and password required");
    const newUser = { email, name: email.split("@")[0] };
    setUser(newUser);
    localStorage.setItem("authUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};