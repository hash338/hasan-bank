export default function TransactionRow({ tx, onShowMessage }) {
  const isIn = tx.direction === "IN";
  const arrow = isIn ? "→" : "←";
  const arrowColor = isIn ? "#2d8a45" : "#c43b3b";

  // date like screenshot: YYYY-MM-DD (ISO)
  const date = (tx.createdAt || "").toString().slice(0, 10) || new Date().toLocaleDateString();

  // INTERNAL_TRANSFER label
  const isInternal = tx.type === "INTERNAL" && tx.fromAccountType && tx.toAccountType;
   const fromText = isInternal ? `${tx.fromAccountType} -> ${tx.toAccountType}` : tx.fromPayee;
  const toText = isInternal ? "" : tx.toPayee;

  return (
    <div className="txPill">
      <div className="txArrow" style={{ color: arrowColor }}>
        {arrow}
      </div>

      <div className="txDate">{date}</div>

      <div className="txName">{fromText}</div>
      <div className="txName">{toText}</div>

      <div className="txBell" onClick={() => onShowMessage(tx.message)} title="Message">
        🔔
      </div>

      <div className="txAmount">${Number(tx.amount).toFixed(2)}</div>
    </div>
  );
}
