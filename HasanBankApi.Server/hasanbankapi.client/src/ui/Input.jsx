export default function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: 12,
        border: "1px solid var(--line)",
        borderRadius: 8,
        outline: "none",
        ...props.style,
      }}
    />
  );
}
