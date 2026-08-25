import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/Login";

import ClientLayout from "./layout/ClientLayout";
import AdminLayout from "./layout/AdminLayout";

import Dashboard from "./pages/client/Dashboard";
import Transactions from "./pages/client/Transactions";
import Accounts from "./pages/client/Accounts";
import Profile from "./pages/client/Profile";
import AiBot from "./pages/client/AiBot";

import CreateClient from "./pages/admin/CreateClient";
import Clients from "./pages/admin/Clients";
import Deposit from "./pages/admin/Deposit";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/client"
            element={
              <ProtectedRoute allowRole="CLIENT">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="profile" element={<Profile />} />
            <Route path="ai" element={<AiBot />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="create-client" replace />} />
            <Route path="create-client" element={<CreateClient />} />
            <Route path="clients" element={<Clients />} />
            <Route path="deposit" element={<Deposit />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
