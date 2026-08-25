import React, { useEffect, useRef, useState } from "react";
import { api } from "../../api/http";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function AiBot() {
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]); // [{conversationId, createdAt, title}]
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const bottomRef = useRef(null);
    const scrollDown = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    const loadConversations = async () => {
        const res = await api.get("/api/client/ai/conversations");
        setConversations(res.data || []);
        return res.data || [];
    };

    const loadHistory = async (cid) => {
        const res = await api.get(`/api/client/ai/history?conversationId=${cid}`);
        setMessages(res.data || []);
        setTimeout(scrollDown, 50);
    };

    const newChat = async () => {
        setErr("");
        setLoading(true);
        try {
            const res = await api.post("/api/client/ai/new-chat");
            const cid = res.data.conversationId;
            setConversationId(cid);
            setMessages([]);
            await loadConversations();
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to create new chat");
        } finally {
            setLoading(false);
        }
    };

    const deleteChat = async () => {
        if (!conversationId) return;
        setErr("");
        setLoading(true);
        try {
            await api.delete(`/api/client/ai/conversations?conversationId=${conversationId}`);

            const nextList = conversations.filter(c => c.conversationId !== conversationId);
            setConversations(nextList);

            // new chat
            if (nextList.length > 0) {
                setConversationId(nextList[0].conversationId);
            } else {
                setConversationId(null);
                setMessages([]);
                await newChat();
            }
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to delete chat");
        } finally {
            setLoading(false);
        }
    };


    const send = async () => {
        if (!text.trim()) return;
        setErr("");
        setLoading(true);

        const userMsg = text.trim();
        setText("");

        // optimistic
        setMessages((prev) => [
            ...prev,
            { role: "USER", content: userMsg, createdAt: new Date().toISOString() },
        ]);

        try {
            let cid = conversationId;

            // If no conversation selected, create one
            if (!cid) {
                const resNew = await api.post("/api/client/ai/new-chat");
                cid = resNew.data.conversationId;
                setConversationId(cid);
            }

            const res = await api.post("/api/client/ai/chat", {
                conversationId: cid,
                message: userMsg,
            });

            setMessages((prev) => [
                ...prev,
                { role: "BOT", content: res.data.reply, createdAt: new Date().toISOString() },
            ]);

            // refresh list 
            await loadConversations();

            setTimeout(scrollDown, 50);
        } catch (e) {
            setErr(e?.response?.data?.message || "Send failed");
        } finally {
            setLoading(false);
        }
    };

    // On page load: load conversations, select most recent; if none -> create new
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const list = await loadConversations();
                if (list.length > 0) {
                    setConversationId(list[0].conversationId);
                    await loadHistory(list[0].conversationId);
                } else {
                    await newChat();
                }
            } catch (e) {
                setErr(e?.response?.data?.message || "Failed to load AI");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // When selecting a conversation
    useEffect(() => {
        if (!conversationId) return;
        loadHistory(conversationId).catch(() => { });
    }, [conversationId]);

    return (
        <div>
            <div className="page-title">AI Bot</div>

            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <button
                    onClick={newChat}
                    style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--line)",
                        background: "#fff",
                        fontWeight: 800,
                        cursor: "pointer",
                    }}
                >
                    New Chat
                </button>

                <button
                    onClick={deleteChat}
                    disabled={!conversationId}
                    style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: 0,
                        background: "var(--green)",
                        color: "#fff",
                        fontWeight: 900,
                        cursor: "pointer",
                        opacity: conversationId ? 1 : 0.5,
                    }}
                >
                    Delete Chat
                </button>
            </div>

            {err && <div style={{ color: "crimson", marginBottom: 10 }}>{err}</div>}

            {/* Layout: Conversations list (left) + Chat (right) */}
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
                {/* LEFT: conversations */}
                <Card style={{ height: "68vh", overflow: "auto" }}>
                    <div style={{ fontWeight: 900, marginBottom: 10 }}>History</div>

                    {conversations.length === 0 ? (
                        <div style={{ opacity: 0.7 }}>No chats yet.</div>
                    ) : (
                        conversations.map((c) => {
                            const active = c.conversationId === conversationId;
                            return (
                                <div
                                    key={c.conversationId}
                                    onClick={() => setConversationId(c.conversationId)}
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        border: "1px solid var(--line)",
                                        marginBottom: 10,
                                        cursor: "pointer",
                                        background: active ? "var(--green)" : "#fff",
                                        color: active ? "#fff" : "#111",
                                    }}
                                >
                                    <div style={{ fontWeight: 800 }}>
                                        {c.title && c.title.trim() ? c.title : "New chat"}
                                    </div>
                                    <div style={{ fontSize: 12, opacity: active ? 0.9 : 0.6, marginTop: 4 }}>
                                        {(c.createdAt || "").toString().slice(0, 10)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </Card>

                {/* RIGHT: chat */}
                <Card style={{ height: "68vh", display: "flex", flexDirection: "column" }}>
                    {/* chat area */}
                    <div style={{ flex: 1, overflow: "auto", padding: 10 }}>
                        {messages.length === 0 ? (
                            <div style={{ padding: 12, opacity: 0.7 }}>Start a conversation…</div>
                        ) : (
                            messages.map((m, idx) => {
                                const isUser = (m.role || "").toUpperCase() === "USER";
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            display: "flex",
                                            justifyContent: isUser ? "flex-end" : "flex-start",
                                            margin: "10px 0",
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: "70%",
                                                padding: "12px 14px",
                                                borderRadius: 14,
                                                background: isUser ? "var(--green)" : "#f4f6f5",
                                                color: isUser ? "#fff" : "#111",
                                                border: isUser ? "none" : "1px solid var(--line)",
                                                whiteSpace: "pre-wrap",
                                                lineHeight: 1.35,
                                            }}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* input */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 140px",
                            gap: 10,
                            padding: 10,
                            borderTop: "1px solid var(--line)",
                        }}
                    >
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") send();
                            }}
                        />
                        <Button onClick={send} disabled={loading} style={{ width: "100%" }}>
                            {loading ? "..." : "Send"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
