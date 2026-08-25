import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Sidebar role="ADMIN" />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
