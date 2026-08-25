export default function ConfirmDialog({
  open,
  title = "Confirm",
  text,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 420,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid var(--line)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          padding: 18,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>{title}</div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: 12,
            minHeight: 70,
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: 0,
              background: "crimson",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
