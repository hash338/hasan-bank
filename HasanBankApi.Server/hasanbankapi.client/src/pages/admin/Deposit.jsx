import React, { useMemo, useState } from "react";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function Deposit() {
  const [payee, setPayee] = useState("");
  const [found, setFound] = useState(null); // search result
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [amount, setAmount] = useState("");
  const [targetType, setTargetType] = useState(""); // CHECKING / SAVINGS

  const accounts = found?.accounts || [];
  const hasBoth = accounts.length >= 2;

  const availableTypes = useMemo(() => {
    return accounts.map(a => a.type);
  }, [accounts]);

  const search = async () => {
    setErr(""); setOk("");
    setFound(null);
    setTargetType("");
    try {
      const res = await api.get(`/api/admin/clients/search?payeeAddress=${encodeURIComponent(payee.trim())}`);
      setFound(res.data);

      // auto-select if only one account exists
      if (res.data?.accounts?.length === 1) {
        setTargetType(res.data.accounts[0].type);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Client not found");
    }
  };

  const deposit = async () => {
    setErr(""); setOk("");

    if (!found) { setErr("Search a client first"); return; }
    if (!amount || Number(amount) <= 0) { setErr("Put a valid amount of money"); return; }

    // If both exist, require selection
    if (hasBoth && !targetType) { setErr("Select target account"); return; }

    try {
      const body = {
        payeeAddress: found.payeeAddress,
        targetAccountType: hasBoth ? targetType : null,
        amount: Number(amount),
      };

      const res = await api.post("/api/admin/deposits", body);

      setOk(`Deposit successful. New balance: $${Number(res.data.newBalance).toFixed(2)}`);
      setAmount("");

      // re-search to update balances on screen
      await search();
    } catch (e) {
      setErr(e?.response?.data?.message || "Deposit failed");
    }
  };

  return (
    <div>
      <div className="page-title">Deposit</div>

      {err && <div style={{ color: "crimson", fontWeight: 700, marginBottom: 10 }}>{err}</div>}
      {ok && <div style={{ color: "green", fontWeight: 700, marginBottom: 10 }}>{ok}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        {/* LEFT: Search */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Search Client</div>

          <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Payee Address</div>
            <Input value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="@payee" />

            <Button onClick={search} style={{ width: 220 }}>Search</Button>
          </div>

          {found && (
            <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Client</div>
              <div><b>Name:</b> {found.firstName} {found.lastName}</div>
              <div><b>Payee:</b> {found.payeeAddress}</div>
              <div><b>Public ID:</b> {found.clientPublicId16}</div>

              <div style={{ marginTop: 12, fontWeight: 900 }}>Accounts</div>
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {accounts.map(a => (
                  <div key={a.accountId} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
                    <div style={{ fontWeight: 900 }}>{a.type}</div>
                    <div style={{ opacity: 0.75, marginTop: 4 }}>Balance: <b>${Number(a.balance).toFixed(2)}</b></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT: Deposit */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Make Deposit</div>

          {!found ? (
            <div style={{ opacity: 0.7 }}>Search for a client to enable deposit.</div>
          ) : (
            <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
              <div>
                <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Amount ($)</div>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              </div>

              <div>
                <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Target Account</div>

                {!hasBoth ? (
                  <Input value={availableTypes[0]} readOnly />
                ) : (
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--line)" }}
                  >
                    <option value="">Select</option>
                    {availableTypes.includes("CHECKING") && <option value="CHECKING">CHECKING</option>}
                    {availableTypes.includes("SAVINGS") && <option value="SAVINGS">SAVINGS</option>}
                  </select>
                )}
              </div>

              <Button onClick={deposit} style={{ width: 220 }}>Deposit</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
