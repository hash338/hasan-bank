import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

function cleanLetters(s) {
  return (s || "").replace(/[^A-Za-z]/g, "");
}

function buildPayeePreview(first, last) {
  const f = cleanLetters(first);
  const l = cleanLetters(last);
  if (!f || !l) return "";

  const fLower = f.substring(0, 1).toLowerCase() + f.substring(1).toLowerCase();
  const lCap = l.substring(0, 1).toUpperCase() + l.substring(1).toLowerCase();
  return `@${fLower}${lCap}`;
}

export default function CreateClient() {
  const location = useLocation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  // Payee generation checkbox
  const [autoGeneratePayee, setAutoGeneratePayee] = useState(true);
  const payeePreview = useMemo(
    () => (autoGeneratePayee ? buildPayeePreview(firstName, lastName) : ""),
    [autoGeneratePayee, firstName, lastName]
  );

  // Accounts checkboxes + initial balances
  const [addChecking, setAddChecking] = useState(true);
  const [checkingBalance, setCheckingBalance] = useState("0");

  const [addSavings, setAddSavings] = useState(true);
  const [savingsBalance, setSavingsBalance] = useState("0");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPassword("");

    setAutoGeneratePayee(true);

    setAddChecking(true);
    setCheckingBalance("0");

    setAddSavings(true);
    setSavingsBalance("0");

    setErr("");
    setOk("");
    setCreated(null);
    setLoading(false);
  };

  //  Reset every time you enter this page (so textboxes stay empty)
  useEffect(() => {
    resetForm();
  }, [location.key]);

  const submit = async () => {
    setErr("");
    setOk("");
    setCreated(null);

    const f = firstName.trim();
    const l = lastName.trim();
    const p = password.trim();

    if (!f || !l || !p) {
      setErr("Please fill First Name, Last Name, and Password.");
      return;
    }

    if (!addChecking && !addSavings) {
      setErr("Select at least one account type (Checking or Savings).");
      return;
    }

    // per your spec: payee textbox NOT editable manually
    if (!autoGeneratePayee) {
      setErr("Enable Payee Address auto-generation to create the client.");
      return;
    }

    if (!payeePreview) {
      setErr("Enter First Name and Last Name to generate Payee Address.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        firstName: f,
        lastName: l,
        password: p,

        autoGeneratePayee: true,
        payeeAddress: "",

        addCheckingAccount: addChecking,
        checkingInitialBalance: addChecking ? Number(checkingBalance || 0) : 0,

        addSavingsAccount: addSavings,
        savingsInitialBalance: addSavings ? Number(savingsBalance || 0) : 0,
      };

      const res = await api.post("/api/admin/clients", body);
      setCreated(res.data);
      setOk("Client created successfully.");
    } catch (e) {
      setErr(e?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">Create Client</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "start" }}>
        {/* LEFT: Form */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Client Info</div>

          <div style={{ display: "grid", gap: 12, maxWidth: 650 }}>
            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>First Name</div>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="off"
                name="hb_createclient_first"
              />
            </div>

            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Last Name</div>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="off"
                name="hb_createclient_last"
              />
            </div>

            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Password</div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                name="hb_createclient_password"
              />
            </div>

            {/* Payee Address */}
            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={autoGeneratePayee}
                  onChange={(e) => setAutoGeneratePayee(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <div style={{ fontWeight: 800 }}>Auto-generate Payee Address</div>
              </div>

              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Payee Address</div>
              <Input value={autoGeneratePayee ? payeePreview : ""} readOnly autoComplete="off" name="hb_createclient_payee" />
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>
                Generated as: <b>{payeePreview || "—"}</b> (backend will ensure uniqueness if taken)
              </div>
            </div>

            {/* Accounts creation */}
            <div style={{ marginTop: 8, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Create Accounts</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Checking */}
                <Card style={{ borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={addChecking}
                      onChange={(e) => setAddChecking(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    <div style={{ fontWeight: 900 }}>Add Checking Account</div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Initial Balance ($)</div>
                    <Input
                      value={checkingBalance}
                      onChange={(e) => setCheckingBalance(e.target.value)}
                      disabled={!addChecking}
                      autoComplete="off"
                      name="hb_createclient_checking_balance"
                    />
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
                      Weekly limit defaults to $2000 (SEND_MONEY only).
                    </div>
                  </div>
                </Card>

                {/* Savings */}
                <Card style={{ borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={addSavings}
                      onChange={(e) => setAddSavings(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    <div style={{ fontWeight: 900 }}>Add Savings Account</div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Initial Balance ($)</div>
                    <Input
                      value={savingsBalance}
                      onChange={(e) => setSavingsBalance(e.target.value)}
                      disabled={!addSavings}
                      autoComplete="off"
                      name="hb_createclient_savings_balance"
                    />
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
                      Weekly limit defaults to $2000 (SEND_MONEY only).
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {err && <div style={{ color: "crimson", fontWeight: 700 }}>{err}</div>}
            {ok && <div style={{ color: "green", fontWeight: 700 }}>{ok}</div>}

            <Button onClick={submit} disabled={loading} style={{ width: 260 }}>
              {loading ? "Creating..." : "Create New Client"}
            </Button>
          </div>
        </Card>

        {/* RIGHT: Result preview */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Created Client</div>

          {!created ? (
            <div style={{ opacity: 0.7 }}>Create a client to see details here.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div><b>Name:</b> {created.firstName} {created.lastName}</div>
              <div><b>Payee:</b> {created.payeeAddress}</div>
              <div><b>Client Public ID:</b> {created.clientPublicId16}</div>
              <div><b>Created:</b> {String(created.createdAt).slice(0, 10)}</div>

              <div style={{ marginTop: 10, fontWeight: 900 }}>Accounts:</div>
              <div style={{ display: "grid", gap: 10 }}>
                {(created.accounts || []).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fff",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{a.type}</div>
                    <div style={{ opacity: 0.75, fontSize: 13 }}>Account #: {a.accountNumber16}</div>
                    <div style={{ fontWeight: 900, marginTop: 6 }}>${Number(a.balance).toFixed(2)}</div>
                    <div style={{ opacity: 0.7, fontSize: 13 }}>Weekly Limit: ${Number(a.weeklyLimit).toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
