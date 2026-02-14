"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthService, User } from "../services/auth.service";
import { getHttpClient } from "@sous/client-sdk";

/**
 * Hook for managing application-wide authentication state.
 * Handles token persistence in localStorage and provides
 * methods for login, logout, and registration.
 *
 * @returns {object} Auth state and methods.
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Fetches the currently authenticated user's profile.
   */
  const fetchMe = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setUser(null);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    setLoading(true);
    try {
      const http = await getHttpClient();
      http.setToken(token);
      const data = await AuthService.me();
      setUser(data);
    } catch (e: any) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  /**
   * Authenticates a user and stores the access token.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   */
  const login = async (email: string, password: string) => {
    const res = await AuthService.login(email, password);
    if (typeof window !== "undefined")
      localStorage.setItem("token", res.access_token);
    const http = await getHttpClient();
    http.setToken(res.access_token);
    await fetchMe();
  };

  /**
   * Terminates the user session and clears local storage.
   */
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.warn("Logout request failed, clearing local session anyway.");
    }
    if (typeof window !== "undefined") localStorage.removeItem("token");
    const http = await getHttpClient();
    http.setToken(null);
    setUser(null);
  };

  /**
   * Registers a new user.
   * @param {any} data - Registration payload.
   */
  const register = async (data: any) => {
    const user = await AuthService.register(data);
    return user;
  };

  return {
    user,
    loading: loading || !isInitialized,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    refresh: fetchMe,
    isInitialized,
  };
};
