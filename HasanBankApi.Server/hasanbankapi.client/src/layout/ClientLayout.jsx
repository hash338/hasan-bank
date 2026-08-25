import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function ClientLayout() {
  return (
    <div className="app-shell">
      <Sidebar role="CLIENT" />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
