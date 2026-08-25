import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ConfirmDialog from "../ui/ConfirmDialog";

const itemBase = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  margin: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
  border: "1px solid var(--line)",
  background: "#fff",
  color: "#1a1a1a",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const itemActive = {
  background: "var(--green)",
  color: "#fff",
  border: "1px solid var(--green)",
  boxShadow: "none",
};

function Icon({ name }) {
  if (name === "dashboard") return <span style={{ fontSize: 16 }}>🏠</span>;
  if (name === "tx") return <span style={{ fontSize: 16 }}>🔄</span>;
  if (name === "acc") return <span style={{ fontSize: 16 }}>💳</span>;
  if (name === "profile") return <span style={{ fontSize: 16 }}>👤</span>;
  if (name === "ai") return <span style={{ fontSize: 16 }}>🤖</span>;
  return <span style={{ fontSize: 16 }}>•</span>;
}

export default function Sidebar({ role }) {
  const { logout } = useAuth();
  const nav = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const doLogout = () => {
    setConfirmOpen(false);
    logout();
    nav("/login", { replace: true });
  };

  const linkStyle = ({ isActive }) => (isActive ? { ...itemBase, ...itemActive } : itemBase);

  //  ADMIN sidebar
  if (role === "ADMIN") {
    return (
      <>
        <div
          style={{
            width: 270,
            background: "#fff",
            borderRight: "1px solid var(--line)",
            paddingTop: 18,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "var(--green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                🏛️
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>Hasan Bank</div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--line)", margin: "0 12px 6px" }} />

          <NavLink to="/admin/create-client" style={linkStyle}>
            <Icon name="profile" /> Create Client
          </NavLink>

          <NavLink to="/admin/clients" style={linkStyle}>
            <Icon name="acc" /> Clients
          </NavLink>

          <NavLink to="/admin/deposit" style={linkStyle}>
            <Icon name="tx" /> Deposit
          </NavLink>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => setConfirmOpen(true)}
            style={{
              margin: "14px 12px 18px",
              padding: "14px 14px",
              borderRadius: 12,
              border: 0,
              background: "var(--green)",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(15,47,32,0.25)",
            }}
          >
            Logout
          </button>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="Logout"
          text="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Cancel"
          onConfirm={doLogout}
          onClose={() => setConfirmOpen(false)}
        />
      </>
    );
  }

  //  CLIENT sidebar
  return (
    <>
      <div
        style={{
          width: 270,
          background: "#fff",
          borderRight: "1px solid var(--line)",
          paddingTop: 18,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                background: "var(--green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
              }}
            >
              🏛️
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>Hasan Bank</div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--line)", margin: "0 12px 6px" }} />

        <NavLink to="/client/dashboard" style={linkStyle}>
          <Icon name="dashboard" /> Dashboard
        </NavLink>

        <NavLink to="/client/transactions" style={linkStyle}>
          <Icon name="tx" /> Transaction
        </NavLink>

        <NavLink to="/client/accounts" style={linkStyle}>
          <Icon name="acc" /> Accounts
        </NavLink>

        <div style={{ height: 1, background: "var(--line)", margin: "10px 12px" }} />

        <NavLink to="/client/profile" style={linkStyle}>
          <Icon name="profile" /> Profile
        </NavLink>

        <NavLink to="/client/ai" style={linkStyle}>
          <Icon name="ai" /> AI Bot
        </NavLink>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setConfirmOpen(true)}
          style={{
            margin: "14px 12px 18px",
            padding: "14px 14px",
            borderRadius: 12,
            border: 0,
            background: "var(--green)",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 8px 18px rgba(15,47,32,0.25)",
          }}
        >
          Logout
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Logout"
        text="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={doLogout}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
