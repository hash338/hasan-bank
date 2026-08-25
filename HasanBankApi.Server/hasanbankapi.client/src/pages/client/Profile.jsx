import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // reveal toggle per accountId
  const [reveal, setReveal] = useState({});

  // edit profile
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editPayee, setEditPayee] = useState("");
  const [editErr, setEditErr] = useState("");
  const [editOk, setEditOk] = useState("");

  // change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwOk, setPwOk] = useState("");

  const checking = useMemo(() => accounts.find(a => a.type === "CHECKING"), [accounts]);
  const savings  = useMemo(() => accounts.find(a => a.type === "SAVINGS"), [accounts]);

  const refresh = async () => {
    setLoading(true);
    const [p, a] = await Promise.all([
      api.get("/api/client/profile"),
      api.get("/api/client/accounts"),
    ]);
    setProfile(p.data);
    setAccounts(a.data);

    // fill edit fields
    setEditFirst(p.data.firstName || "");
    setEditLast(p.data.lastName || "");
    setEditPayee(p.data.payeeAddress || "");

    setLoading(false);
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, []);

  const format16 = (s) => {
    if (!s) return "";
    const x = s.replace(/\s+/g, "");
    return x.replace(/(.{4})/g, "$1 ").trim();
  };

  const masked16 = (full16) => {
    const x = (full16 || "").replace(/\s+/g, "");
    if (x.length < 4) return "************";
    const last4 = x.slice(-4);
    return `************ ${last4}`;
  };

  const toggleReveal = (accountId) => {
    setReveal(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const updateProfile = async () => {
    setEditErr(""); setEditOk("");
    try {
      const res = await api.put("/api/client/profile", {
        firstName: editFirst,
        lastName: editLast,
      });
      setEditOk("Profile updated");
      setProfile(res.data); // update UI instantly
    } catch (e) {
      setEditErr(e?.response?.data?.message || "Update failed");
    }
  };

  const updatePassword = async () => {
    setPwErr(""); setPwOk("");

    if (newPassword !== confirmNewPassword) {
      setPwErr("Passwords do not match");
      return;
    }

    try {
      await api.put("/api/client/profile/password", {
        oldPassword: currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPwOk("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e) {
      setPwErr(e?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <div className="page-title">Profile</div>;

  return (
    <div>
      <div className="page-title">Profile</div>

      {/* Top info */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 10 }}>
          <div style={{ opacity: 0.7 }}>First Name:</div>
          <div style={{ fontWeight: 800 }}>{profile?.firstName}</div>

          <div style={{ opacity: 0.7 }}>Last Name:</div>
          <div style={{ fontWeight: 800 }}>{profile?.lastName}</div>

          <div style={{ opacity: 0.7 }}>Payee Address:</div>
          <div style={{ fontWeight: 800 }}>{profile?.payeeAddress}</div>
        </div>
      </Card>

      {/* Accounts cards */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 25, fontWeight: 800, marginBottom: 12 }}>My Accounts</div>

        <div className="cards2">
          {checking && (
            <div
              className="cardBank"
              style={{ background: "var(--green)", cursor: "pointer" }}
              onClick={() => toggleReveal(checking.accountId)}
              title="Click to reveal/mask"
            >
              <div className="stripe" />
              <div className="bankIcon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10.5L12 4l9 6.5" stroke="#0f2f20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 10.5V20h14v-9.5" stroke="#0f2f20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="money">{Number(checking.balance).toFixed(2)}</div>
              <div className="mask">
                {reveal[checking.accountId] ? format16(checking.accountNumber16) : masked16(checking.accountNumber16)}
              </div>
              <div className="typeLabel">Checking Account</div>
            </div>
          )}

          {savings && (
            <div
              className="cardBank"
              style={{ background: "var(--green2)", cursor: "pointer" }}
              onClick={() => toggleReveal(savings.accountId)}
              title="Click to reveal/mask"
            >
              <div className="stripe" />
              <div className="bankIcon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10.5L12 4l9 6.5" stroke="#0f2f20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 10.5V20h14v-9.5" stroke="#0f2f20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="money">{Number(savings.balance).toFixed(2)}</div>
              <div className="mask">
                {reveal[savings.accountId] ? format16(savings.accountNumber16) : masked16(savings.accountNumber16)}
              </div>
              <div className="typeLabel">Savings Account</div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile + Change Password side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
        {/* Edit Profile */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Edit Profile</div>

          <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>First Name</div>
              <Input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
            </div>

            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Last Name</div>
              <Input value={editLast} onChange={(e) => setEditLast(e.target.value)} />
            </div>



            {editErr && <div style={{ color: "crimson" }}>{editErr}</div>}
            {editOk && <div style={{ color: "green" }}>{editOk}</div>}

            <Button onClick={updateProfile} style={{ width: 220 }}>
              Update
            </Button>
          </div>
        </Card>

        {/* Change Password */}
        <Card>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Change Password</div>

          <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Current Password</div>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>

            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>New Password</div>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div>
              <div style={{ fontSize: 13, marginBottom: 6, opacity: 0.7 }}>Confirm New Password</div>
              <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>

            {pwErr && <div style={{ color: "crimson" }}>{pwErr}</div>}
            {pwOk && <div style={{ color: "green" }}>{pwOk}</div>}

            <Button onClick={updatePassword} style={{ width: 220 }}>
              Update
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
