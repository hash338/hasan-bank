import React from "react";

/** Base shimmer block. */
export function Skeleton({ width = "100%", height = 14, radius = 8, dark = false, style }) {
  return (
    <div
      className={dark ? "sk sk-dark" : "sk"}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

/** Several shimmer lines (paragraph placeholder). */
export function SkeletonText({ lines = 3, gap = 10, widths }) {
  return (
    <div style={{ display: "grid", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={widths?.[i] ?? (i === lines - 1 ? "60%" : "100%")}
        />
      ))}
    </div>
  );
}

/** Transaction-like rows (arrow, date, two names, bell, amount). */
export function SkeletonRows({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "22px 120px 1fr 1fr 44px 110px",
            gap: 12,
            alignItems: "center",
            padding: "16px 14px",
            borderBottom: i === count - 1 ? "none" : "1px solid var(--line)",
          }}
        >
          <Skeleton width={16} height={16} radius={999} />
          <Skeleton width={88} height={12} />
          <Skeleton height={12} />
          <Skeleton width="70%" height={12} />
          <Skeleton width={16} height={16} radius={999} />
          <Skeleton width={92} height={32} radius={10} style={{ justifySelf: "end" }} />
        </div>
      ))}
    </>
  );
}
