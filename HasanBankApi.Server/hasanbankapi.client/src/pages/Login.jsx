import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const { loginAdmin, loginClient } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  //  Reset every time we NAVIGATE to /login (works after logout)
  useEffect(() => {
    setIdentifier("");
    setPassword("");
    setErr("");
    setBusy(false);
  }, [location.key]);

  // "@..."  → client (payee address)
  // anything else → admin username
  const isClient = identifier.trim().startsWith("@");

  const submit = async () => {
    if (busy) return;

    setErr("");

    const id = identifier.trim();
    const p = password.trim();

    if (!id || !p) {
      setErr(isClient ? "Payee address and password required" : "Username and password required");
      return;
    }

    setBusy(true);
    try {
      if (isClient) {
        await loginClient(id, p);
        nav("/client/dashboard", { replace: true });
      } else {
        await loginAdmin(id, p);
        nav("/admin/create-client", { replace: true });
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    //  key forces a fresh DOM (also helps against browser autofill)
    <div key={location.key} style={{ display: "flex", height: "100vh" }}>
      {/* LEFT GREEN PANEL */}
      <div
        style={{
          width: 360,
          background: "var(--green)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 600 }}>Hasan Bank</div>

        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 18,
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
            <path d="M3 10.5L12 4l9 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10.5V20h14v-9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 20v-6h8v6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 13h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ opacity: 0.85, fontSize: 14 }}>
          Application With Data Persistence – 2025
        </div>
      </div>

      {/* RIGHT FORM */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 520 }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>Sign in to your account</div>
          <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 18 }}>
            Start with <b>@</b> for a client payee address.
          </div>

          <div style={{ margin: "10px 0 6px" }}>Payee Address:</div>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="@payee"
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid var(--line)",
              borderRadius: 6,
            }}
            autoComplete="off"
            name="hb_identifier"
            autoFocus
          />

          <div style={{ margin: "14px 0 6px" }}>Password:</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            style={{ width: "100%", padding: 12, border: "1px solid var(--line)", borderRadius: 6 }}
            autoComplete="new-password"
            name="hb_password"
          />

          {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}

          <button
            type="button"
            onClick={submit}
            disabled={busy}
            style={{
              width: "100%",
              marginTop: 18,
              padding: 14,
              background: "var(--green)",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              fontSize: 16,
              opacity: busy ? 0.7 : 1,
              cursor: busy ? "progress" : "pointer",
            }}
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
