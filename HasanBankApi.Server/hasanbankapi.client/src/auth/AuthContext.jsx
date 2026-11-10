import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/http";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const STORAGE_KEY = "hb_access_token";

function parseJwt(token) {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function isExpired(token) {
  const payload = parseJwt(token);
  return !payload?.exp || payload.exp * 1000 <= Date.now();
}

// Restore the session before the first render so a page refresh keeps you
// logged in (and the pages can show their skeleton instead of bouncing to /login).
const initialToken = (() => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored || isExpired(stored)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    setAuthToken(stored);
    return stored;
  } catch {
    return null;
  }
})();

export function AuthProvider({ children }) {
  const [accessToken, _setAccessToken] = useState(initialToken);

  const role = useMemo(() => {
    if (!accessToken) return null;
    return parseJwt(accessToken)?.role || null; // ADMIN | CLIENT
  }, [accessToken]);

  const setAccessToken = (token) => {
    try {
      if (token) sessionStorage.setItem(STORAGE_KEY, token);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage can be unavailable (private mode) — memory still works */
    }
    setAuthToken(token);
    _setAccessToken(token);
  };

  // Token rejected or expired mid-session → drop it, ProtectedRoute redirects.
  useEffect(() => {
    const onUnauthorized = () => setAccessToken(null);
    window.addEventListener("hb:unauthorized", onUnauthorized);
    return () => window.removeEventListener("hb:unauthorized", onUnauthorized);
  }, []);

  const loginAdmin = async (username, password) => {
    const res = await api.post("/api/auth/admin/login", {
      username: username.trim(),
      password: password.trim(),
    });
    setAccessToken(res.data.accessToken);
  };

  const loginClient = async (payeeAddress, password) => {
    const res = await api.post("/api/auth/client/login", {
      payeeAddress: payeeAddress.trim(),
      password: password.trim(),
    });
    setAccessToken(res.data.accessToken);
  };

  const logout = () => setAccessToken(null);

  return (
    <AuthCtx.Provider value={{ accessToken, role, loginAdmin, loginClient, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
