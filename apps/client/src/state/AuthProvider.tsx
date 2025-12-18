import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { getAccessToken, setAccessToken } from "./tokenStorage";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  requireAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Initial session bootstrap
  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!getAccessToken()) {
          setLoading(false);
          return;
        }
        const { data } = await api.get<AuthUser>("/auth/me");
        setUser(data);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    try {
      console.log('login******************************************************************************', email, password, remember);
      const { data } = await api.post<{ accessToken: string; refreshToken?: string; user: AuthUser }>(
        "/auth/login",
        { email, password, remember }
      );
      console.log('data******************************************************************************', data);
      if (!data.accessToken || !data.user) {
        throw new Error("Invalid response from server");
      }
      console.log('data.accessToken******************************************************************************', data.accessToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
      await queryClient.invalidateQueries();
      
      // Navigate based on user role - check the data directly to avoid state timing issues
      // Use a small delay to ensure React has processed the state update
      const isAdmin = data.user.roles && data.user.roles.indexOf("admin") !== -1;
      console.log('isAdmin******************************************************************************', isAdmin);
      setTimeout(() => {
        if (isAdmin) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 10);
    } catch (error) {
      // cRe-throw to be handled by the caller
      console.log('error******************************************************************************', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors here
    } finally {
      setAccessToken(null);
      setUser(null);
      await queryClient.clear();
      navigate("/auth/login", { replace: true });
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!(user?.roles && user.roles.indexOf("admin") !== -1),
      loading,
      login,
      logout,
      requireAdmin: () => !!(user?.roles && user.roles.indexOf("admin") !== -1),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
};


