import React, { useEffect, useState } from "react";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import ConfirmDialog from "../../ui/ConfirmDialog";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null); // client row

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/api/admin/clients");
      setClients(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const askDelete = (c) => {
    setOk("");
    setSelected(c);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!selected) return;
    setErr("");
    setOk("");
    try {
      await api.delete(`/api/admin/clients/${selected.clientId}`);
      setConfirmOpen(false);
      setSelected(null);
      setOk("Client deleted");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="page-title">Clients</div>

      {err && <div style={{ color: "crimson", fontWeight: 700, marginBottom: 10 }}>{err}</div>}
      {ok && <div style={{ color: "green", fontWeight: 700, marginBottom: 10 }}>{ok}</div>}

      <Card>
        {loading ? (
          <div style={{ padding: 14, opacity: 0.7 }}>Loading…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: 14, opacity: 0.7 }}>No clients.</div>
        ) : (
          <div style={{ padding: "6px 10px" }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.1fr 1.1fr 1.2fr 140px",
                gap: 12,
                padding: "12px 10px",
                fontWeight: 900,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>Name</div>
              <div>Payee</div>
              <div>Client Public ID</div>
              <div>Created</div>
              <div style={{ textAlign: "right" }}>Action</div>
            </div>

            {/* Rows */}
            {clients.map((c) => (
              <div
                key={c.clientId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.1fr 1.1fr 1.2fr 140px",
                  gap: 12,
                  padding: "14px 10px",
                  borderBottom: "1px solid var(--line)",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 800 }}>
                  {c.firstName} {c.lastName}
                </div>

                <div style={{ fontWeight: 700 }}>{c.payeeAddress}</div>

                <div style={{ fontWeight: 700, letterSpacing: 1 }}>{c.clientPublicId16}</div>

                <div style={{ opacity: 0.7 }}>{String(c.createdAt).slice(0, 10)}</div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => askDelete(c)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: 0,
                      background: "crimson",
                      color: "#fff",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Client"
        text={
          selected
            ? `Are you sure you want to permanently delete:\n\n${selected.firstName} ${selected.lastName}\n${selected.payeeAddress}\n\nThis will remove ALL related data (accounts, transactions, AI history).`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={doDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
