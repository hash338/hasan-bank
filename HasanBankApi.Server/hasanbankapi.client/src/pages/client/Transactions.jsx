import React, { useEffect, useState } from "react";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import TransactionRow from "../../ui/TransactionRow";
import MessageDialog from "../../ui/MessageDialog";
import { TransactionsSkeleton } from "../../ui/Skeletons";

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState("");

  const showMessage = (msg) => {
    const text = msg && msg.trim() ? msg : "No message";
    setMsgText(text);
    setMsgOpen(true);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/client/transactions");
        setTxs(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <TransactionsSkeleton />;

  return (
    <div>
      <div className="page-title">Transactions</div>

      <Card>
        <div style={{ padding: "6px 10px" }}>
          {txs.length === 0 ? (
            <div style={{ padding: 14, opacity: 0.7 }}>No transactions.</div>
          ) : (
            txs.map((tx) => (
              <TransactionRow key={tx.transactionId} tx={tx} onShowMessage={showMessage} />
            ))
          )}
        </div>
      </Card>

      <MessageDialog
        open={msgOpen}
        title="Message"
        text={msgText}
        onClose={() => setMsgOpen(false)}
      />
    </div>
  );
}
