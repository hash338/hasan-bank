import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [c2sAmount, setC2sAmount] = useState("");
  const [s2cAmount, setS2cAmount] = useState("");

  const [err1, setErr1] = useState("");
  const [ok1, setOk1] = useState("");
  const [err2, setErr2] = useState("");
  const [ok2, setOk2] = useState("");

  const checking = useMemo(() => accounts.find(a => a.type === "CHECKING"), [accounts]);
  const savings  = useMemo(() => accounts.find(a => a.type === "SAVINGS"), [accounts]);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/client/accounts");
    setAccounts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const transfer = async (fromType, toType, amountStr, setErr, setOk, clearAmount) => {
    setErr(""); setOk("");
    try {
      await api.post("/api/client/transfers/internal", {
        fromAccountType: fromType,
        toAccountType: toType,
        amount: Number(amountStr),
      });
      setOk("Transfer successful");
      clearAmount("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Transfer failed");
    }
  };

  if (loading) return <div className="page-title">Accounts</div>;

  return (
    <div>
      <div className="page-title">Accounts</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22, alignItems: "start" }}>
        
        {/* LEFT: account details */}

        <Card style={{ minHeight: 700 }}>
          {!checking && !savings && (
            <div style={{ padding: 14, opacity: 0.7 }}>No accounts.</div>
          )}

          {checking && (
            <div style={{ padding: 100, borderBottom: "6px solid var(--line)" }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Checking Account</div>

              <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", rowGap: 15 }}>
                <div style={{ opacity: 0.7 }}>Account Number:</div>
                <div style={{ fontWeight: 700 }}>{checking.accountNumberLast8}</div>

                <div style={{ opacity: 0.7 }}>Transaction Limit:</div>
                <div style={{ fontWeight: 700 }}>${Number(checking.weeklyLimit).toFixed(0)}</div>

                <div style={{ opacity: 0.7 }}>Date Created:</div>
                <div style={{ fontWeight: 700 }}>{new Date(checking.createdAt).toLocaleDateString()}</div>

                <div style={{ opacity: 0.7 }}>Balance:</div>
                <div style={{ fontWeight: 900 }}>${Number(checking.balance).toFixed(2)}</div>
              </div>
            </div>
          )}

          {savings && (
            <div style={{ padding: 100 }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Savings Account</div>

              <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", rowGap: 15 }}>
                <div style={{ opacity: 0.7 }}>Account Number:</div>
                <div style={{ fontWeight: 700 }}>{savings.accountNumberLast8}</div>

                <div style={{ opacity: 0.7 }}>Withdrawal Limit:</div>
                <div style={{ fontWeight: 700 }}>${Number(savings.weeklyLimit).toFixed(0)}</div>

                <div style={{ opacity: 0.7 }}>Date Created:</div>
                <div style={{ fontWeight: 700 }}>{new Date(savings.createdAt).toLocaleDateString()}</div>

                <div style={{ opacity: 0.7 }}>Balance:</div>
                <div style={{ fontWeight: 900 }}>${Number(savings.balance).toFixed(2)}</div>
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT: internal transfer boxes */}
        <div style={{ display: "grid", gap: 150, marginTop: 150 }}>
          <Card>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>Move Funds To Savings Account:</div>
            <Input value={c2sAmount} onChange={(e) => setC2sAmount(e.target.value)} placeholder="0" />

            {err1 && <div style={{ color: "crimson", marginTop: 10 }}>{err1}</div>}
            {ok1 && <div style={{ color: "green", marginTop: 10 }}>{ok1}</div>}

            <Button
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => transfer("CHECKING", "SAVINGS", c2sAmount, setErr1, setOk1, setC2sAmount)}
            >
              Transfer
            </Button>
          </Card>

          <Card>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>Move Funds To Checking Account:</div>
            <Input value={s2cAmount} onChange={(e) => setS2cAmount(e.target.value)} placeholder="0" />

            {err2 && <div style={{ color: "crimson", marginTop: 10 }}>{err2}</div>}
            {ok2 && <div style={{ color: "green", marginTop: 10 }}>{ok2}</div>}

            <Button
              style={{ width: "100%", marginTop: 12 }}
              onClick={() => transfer("SAVINGS", "CHECKING", s2cAmount, setErr2, setOk2, setS2cAmount)}
            >
              Transfer
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
