export default function Button({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        border: 0,
        background: "var(--green)",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
