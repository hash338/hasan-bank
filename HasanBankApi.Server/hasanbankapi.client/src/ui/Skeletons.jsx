import React from "react";
import Card from "./Card";
import { Skeleton, SkeletonRows } from "./Skeleton";

/* ── Dashboard ─────────────────────────────────────────── */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true">
      <div className="page-title">Dashboard</div>
      <Skeleton width={260} height={40} radius={10} style={{ margin: "0 0 22px" }} />

      <div className="gridTop">
        <div>
          <div className="cards2">
            <Skeleton height={150} radius={14} dark />
            <Skeleton height={150} radius={14} dark />
          </div>

          <div style={{ marginTop: 26 }}>
            <Skeleton width={280} height={16} style={{ margin: "8px 0 14px" }} />
            <Card>
              <div style={{ padding: "6px 10px" }}>
                <SkeletonRows count={4} />
              </div>
            </Card>
          </div>
        </div>

        <div>
          <div className="summaryRight">
            <Skeleton width={150} height={16} style={{ marginBottom: 18 }} />
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderTop: i ? "1px solid var(--line)" : "none",
                }}
              >
                <Skeleton width={80} height={12} />
                <Skeleton width={110} height={12} />
              </div>
            ))}
          </div>

          <div className="sendRight">
            <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ marginTop: 12 }}>
                <Skeleton width={100} height={11} style={{ marginBottom: 8 }} />
                <Skeleton height={44} radius={8} />
              </div>
            ))}
            <Skeleton height={48} radius={10} style={{ marginTop: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Accounts ──────────────────────────────────────────── */
export function AccountsSkeleton() {
  return (
    <div aria-busy="true">
      <div className="page-title">Accounts</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22, alignItems: "start" }}>
        <Card style={{ minHeight: 700 }}>
          {[0, 1].map((block) => (
            <div
              key={block}
              style={{
                padding: 100,
                borderBottom: block === 0 ? "6px solid var(--line)" : "none",
              }}
            >
              <Skeleton width={190} height={20} style={{ marginBottom: 24 }} />
              {[0, 1, 2, 3].map((row) => (
                <div
                  key={row}
                  style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 15, marginBottom: 18 }}
                >
                  <Skeleton width={120} height={12} />
                  <Skeleton width="55%" height={12} />
                </div>
              ))}
            </div>
          ))}
        </Card>

        <div style={{ display: "grid", gap: 150, marginTop: 150 }}>
          {[0, 1].map((i) => (
            <Card key={i}>
              <Skeleton width={270} height={16} style={{ marginBottom: 14 }} />
              <Skeleton height={44} radius={8} />
              <Skeleton height={46} radius={10} style={{ marginTop: 12 }} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Transactions ──────────────────────────────────────── */
export function TransactionsSkeleton() {
  return (
    <div aria-busy="true">
      <div className="page-title">Transactions</div>
      <Card>
        <div style={{ padding: "6px 10px" }}>
          <SkeletonRows count={7} />
        </div>
      </Card>
    </div>
  );
}

/* ── Profile ───────────────────────────────────────────── */
export function ProfileSkeleton() {
  return (
    <div aria-busy="true">
      <div className="page-title">Profile</div>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 12 }}>
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <Skeleton width={110} height={12} />
              <Skeleton width="45%" height={12} />
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div style={{ marginTop: 18 }}>
        <Skeleton width={190} height={24} style={{ marginBottom: 14 }} />
        <div className="cards2">
          <Skeleton height={150} radius={14} dark />
          <Skeleton height={150} radius={14} dark />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
        {[0, 1].map((card) => (
          <Card key={card}>
            <Skeleton width={160} height={18} style={{ marginBottom: 18 }} />
            <div style={{ display: "grid", gap: 14, maxWidth: 520 }}>
              {[0, 1, 2].map((field) => (
                <div key={field}>
                  <Skeleton width={90} height={11} style={{ marginBottom: 8 }} />
                  <Skeleton height={44} radius={8} />
                </div>
              ))}
              <Skeleton width={220} height={44} radius={10} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── AI Bot ────────────────────────────────────────────── */
export function AiBotSkeleton() {
  return (
    <div aria-busy="true">
      <div className="page-title">AI Bot</div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Skeleton width={118} height={44} radius={10} />
        <Skeleton width={130} height={44} radius={10} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
        <Card style={{ height: "68vh", overflow: "hidden" }}>
          <Skeleton width={70} height={14} style={{ marginBottom: 16 }} />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={62} radius={12} style={{ marginBottom: 10 }} />
          ))}
        </Card>

        <Card style={{ height: "68vh", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, padding: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: i % 2 ? "flex-end" : "flex-start",
                  margin: "12px 0",
                }}
              >
                <Skeleton width={i % 2 ? "45%" : "62%"} height={46} radius={14} />
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px",
              gap: 10,
              padding: 10,
              borderTop: "1px solid var(--line)",
            }}
          >
            <Skeleton height={44} radius={8} />
            <Skeleton height={44} radius={10} />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── Admin: Clients table ──────────────────────────────── */
export function ClientsSkeleton() {
  const cols = "1.2fr 1.1fr 1.1fr 1.2fr 140px";

  return (
    <div aria-busy="true">
      <div className="page-title">Clients</div>

      <Card>
        <div style={{ padding: "6px 10px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              gap: 12,
              padding: "12px 10px",
              borderBottom: "1px solid var(--line)",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                height={12}
                width={i === 4 ? 70 : "60%"}
                style={{ justifySelf: i === 4 ? "end" : "start" }}
              />
            ))}
          </div>

          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: 12,
                padding: "18px 10px",
                borderBottom: row === 5 ? "none" : "1px solid var(--line)",
                alignItems: "center",
              }}
            >
              <Skeleton width="70%" height={12} />
              <Skeleton width="60%" height={12} />
              <Skeleton width="80%" height={12} />
              <Skeleton width="55%" height={12} />
              <Skeleton width={78} height={38} radius={10} style={{ justifySelf: "end" }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── Admin: client search result (Deposit) ─────────────── */
export function ClientSearchSkeleton() {
  return (
    <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
      <Skeleton width={70} height={14} style={{ marginBottom: 14 }} />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} width="45%" height={12} style={{ marginBottom: 10 }} />
      ))}

      <Skeleton width={80} height={14} style={{ margin: "14px 0 10px" }} />
      {[0, 1].map((i) => (
        <Skeleton key={i} height={64} radius={12} style={{ marginBottom: 10 }} />
      ))}
    </div>
  );
}
