import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ allowRole, children }) {
  const { accessToken, role } = useAuth();

  if (!accessToken) return <Navigate to="/login" replace />;
  if (allowRole && role !== allowRole) return <Navigate to="/login" replace />;

  return children;
}
