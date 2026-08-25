import React, { createContext, useContext, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/http";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

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

export function AuthProvider({ children }) {
  const [accessToken, _setAccessToken] = useState(null);

  const role = useMemo(() => {
    if (!accessToken) return null;
    return parseJwt(accessToken)?.role || null; // ADMIN | CLIENT
  }, [accessToken]);

  const setAccessToken = (token) => {
    setAuthToken(token);
    _setAccessToken(token);
  };

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
