import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiClient } from "../lib/api-client";
import type { UserPublic } from "@gs-medcure/shared";

interface AuthState {
  user: UserPublic | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const token = localStorage.getItem("gsmedcure_token");
      const userStr = localStorage.getItem("gsmedcure_user");
      return {
        token,
        user: userStr ? (JSON.parse(userStr) as UserPublic) : null,
      };
    } catch {
      return { token: null, user: null };
    }
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ token: string; user: UserPublic }>(
      "/auth/login",
      { email, password }
    );
    const { token, user } = res.data;
    localStorage.setItem("gsmedcure_token", token);
    localStorage.setItem("gsmedcure_user", JSON.stringify(user));
    setState({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gsmedcure_token");
    localStorage.removeItem("gsmedcure_user");
    setState({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAuthenticated: !!state.token && !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
