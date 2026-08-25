export default function Card({ children, style }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--line)",
        padding: 16,
        background: "#fff",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
