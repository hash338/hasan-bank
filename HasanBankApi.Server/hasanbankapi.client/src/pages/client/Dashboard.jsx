import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import TransactionRow from "../../ui/TransactionRow";
import MessageDialog from "../../ui/MessageDialog";
import { DashboardSkeleton } from "../../ui/Skeletons";


export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [weeklyTx, setWeeklyTx] = useState([]);
    const [loading, setLoading] = useState(true);

    const [fromAccountType, setFromAccountType] = useState("CHECKING");
    const [toPayeeAddress, setToPayeeAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [sendErr, setSendErr] = useState("");
    const [sendOk, setSendOk] = useState("");

    const [msgOpen, setMsgOpen] = useState(false);
    const [msgText, setMsgText] = useState("");


    const hasChecking = useMemo(() => accounts.some((a) => a.type === "CHECKING"), [accounts]);
    const hasSavings = useMemo(() => accounts.some((a) => a.type === "SAVINGS"), [accounts]);

    const refresh = async (silent = false) => {
        if (!silent) setLoading(true);
        const [p, a, s, w] = await Promise.all([
            api.get("/api/client/profile"),
            api.get("/api/client/accounts"),
            api.get("/api/client/summary"),
            api.get("/api/client/transactions?range=weekly"),
        ]);
        setProfile(p.data);
        setAccounts(a.data);
        setSummary(s.data);
        setWeeklyTx(w.data);
        setLoading(false);
    };

    useEffect(() => {
        refresh().catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!hasChecking && hasSavings) setFromAccountType("SAVINGS");
    }, [hasChecking, hasSavings]);

    const mask16 = (last4) => `************ ${last4}`;
    const showMessage = (msg) => {
        const text = msg && msg.trim() ? msg : "No message";
        setMsgText(text);
        setMsgOpen(true);
    };

    const sendMoney = async () => {
        setSendErr("");
        setSendOk("");
        try {
            await api.post("/api/client/transfers/send-money", {
                fromAccountType,
                toPayeeAddress,
                amount: Number(amount),
                message: message.trim() ? message : null,
            });
            setSendOk("Sent successfully");
            setToPayeeAddress("");
            setAmount("");
            setMessage("");
            await refresh(true);
        } catch (e) {
            setSendErr(e?.response?.data?.message || "Send failed");
        }
    };

    if (loading) return <DashboardSkeleton />;

    const checking = accounts.find((a) => a.type === "CHECKING");
    const savings = accounts.find((a) => a.type === "SAVINGS");

    return (
        <div>
            <div className="page-title">Dashboard</div>
            {profile && <div className="hiBig">Hi, {profile.firstName}</div>}

            <div className="gridTop">
                {/* LEFT: Cards + Latest Transactions */}
                <div>
                    <div className="cards2">
                        {checking && (
                            <div className="cardBank" style={{ background: "var(--green)" }}>
                                <div className="stripe" />
                                <div className="bankIcon">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 10.5L12 4l9 6.5"
                                            stroke="#0f2f20"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M5 10.5V20h14v-9.5"
                                            stroke="#0f2f20"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                                <div className="money">{Number(checking.balance).toFixed(2)}</div>
                                <div className="mask">{mask16(checking.accountNumber16?.slice(-4) ?? "0000")}</div>
                                <div className="typeLabel">Checking Account</div>
                            </div>
                        )}

                        {savings && (
                            <div className="cardBank" style={{ background: "var(--green2)" }}>
                                <div className="stripe" />
                                <div className="bankIcon">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 10.5L12 4l9 6.5"
                                            stroke="#0f2f20"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M5 10.5V20h14v-9.5"
                                            stroke="#0f2f20"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                                <div className="money">{Number(savings.balance).toFixed(2)}</div>
                                <div className="mask">{mask16(savings.accountNumber16?.slice(-4) ?? "0000")}</div>
                                <div className="typeLabel">Savings Account</div>
                            </div>
                        )}
                    </div>

                    {/* Latest Transactions (left, like screenshot) */}
                    <div className="txBox">
                        <div style={{ fontSize: 16, fontWeight: 800, margin: "8px 0 12px" }}>
                            WEEKLY Latest Transactions
                        </div>

                        <Card>
                            <div style={{ padding: "6px 10px" }}>
                                {weeklyTx.length === 0 ? (
                                    <div style={{ padding: 14, opacity: 0.7 }}>No transactions in last 7 days.</div>
                                ) : (
                                    weeklyTx.map((tx) => (
                                        <TransactionRow key={tx.transactionId} tx={tx} onShowMessage={showMessage} />
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                </div>

                {/* RIGHT: Summary small box + Send Money (no big cards) */}
                <div>
                    <div className="summaryRight">
                        <div className="title">Accounts Summary</div>

                        <div className="row">
                            <div>Income</div>
                            <div className="valIncome">+ ${summary ? Number(summary.income).toFixed(2) : "0.00"}</div>
                        </div>

                        <div className="row">
                            <div>Expenses</div>
                            <div className="valExpense">- ${summary ? Number(summary.expenses).toFixed(2) : "0.00"}</div>
                        </div>
                    </div>

                    <div className="sendRight">
                        <div className="title">Send Money</div>

                        <div className="label">From Account</div>
                        <select
                            value={fromAccountType}
                            onChange={(e) => setFromAccountType(e.target.value)}
                            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--line)" }}
                        >
                            {hasChecking && <option value="CHECKING">CHECKING</option>}
                            {hasSavings && <option value="SAVINGS">SAVINGS</option>}
                        </select>

                        <div className="label">Payee Address:</div>
                        <Input value={toPayeeAddress} onChange={(e) => setToPayeeAddress(e.target.value)} placeholder="@payee" />

                        <div className="label">Amount In $:</div>
                        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />

                        <div className="label">Message:(Optional)</div>
                        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="..." />

                        {sendErr && <div style={{ color: "crimson", marginTop: 8 }}>{sendErr}</div>}
                        {sendOk && <div style={{ color: "green", marginTop: 8 }}>{sendOk}</div>}

                        <button className="btn" onClick={sendMoney}>
                            Send Money
                        </button>
                    </div>
                </div>
            </div>
            <MessageDialog
                open={msgOpen}
                title="Message"
                text={msgText}
                onClose={() => setMsgOpen(false)}
            />

        </div>
    );
}
