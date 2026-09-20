"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { registerLogoutHandler } from "@/lib/api/clientFetch";

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
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        credentials: "include",
      });
      if (response.ok) {
        const data = (await response.json()) as User;
        setUser(data);
      } else if (response.status === 401) {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Proceed even if the request fails
    }

    setUser(null);
    router.push("/login");
  }, [router]);

  // Register the logout handler for automatic 401/403 interception
  useEffect(() => {
    registerLogoutHandler(logout);
  }, [logout]);

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