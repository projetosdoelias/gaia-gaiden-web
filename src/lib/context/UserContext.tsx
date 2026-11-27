"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiJson, endSession } from "@/lib/api/clientFetch";

export type User = {
  id: number;
  username: string;
  email?: string;
};

type UserContextValue = {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // A 401 here ends the session inside apiJson (clientFetch).
    apiJson<User>("/api/auth/profile")
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Same session-end routine as an expired session (clears the cookie, full
  // page load to /login), so no state from this session survives.
  const logout = useCallback(() => endSession("logout"), []);

  return (
    <UserContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
