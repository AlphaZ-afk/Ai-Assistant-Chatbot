"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "ai"; text: string };

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hey ✨ I’m your AI Assistant. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>")
      .replace(/\* (.*?)(<br\/>|$)/g, "• $1<br/>");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Msg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });
      const data = await res.json();

      const aiText =
        data?.text ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ AI failed to respond.";

      setMessages((m) => [...m, { role: "ai", text: aiText }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "⚠️ Server error. Try again." },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.stars} />

      <div style={styles.chatCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>Gyanova</h1>
          <p style={styles.subtitle}>Your personal intelligent companion</p>
        </div>

        <div ref={containerRef} style={styles.chatArea}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.userBubble : styles.aiBubble),
              }}
              dangerouslySetInnerHTML={{
                __html: formatText(m.text),
              }}
            />
          ))}

          {thinking && (
            <div style={{ ...styles.bubble, ...styles.aiBubble }}>
              <span style={styles.shimmer}>AI is thinking…</span>
            </div>
          )}
        </div>

        <div style={styles.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.sendBtn}>
            ➤
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          from {
            opacity: 0.4;
          }
          to {
            opacity: 0.8;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200%;
          }
          100% {
            background-position: 200%;
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles: any = {
  page: {
    height: "100vh",
    width: "100vw",
    background: "radial-gradient(circle at top, #0b1020, #000)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui",
    color: "white",
  },

  stars: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      radial-gradient(1px 1px at 10% 20%, white 50%, transparent 51%),
      radial-gradient(1px 1px at 30% 80%, white 50%, transparent 51%),
      radial-gradient(1px 1px at 70% 30%, white 50%, transparent 51%),
      radial-gradient(1px 1px at 90% 60%, white 50%, transparent 51%),
      radial-gradient(1px 1px at 50% 50%, white 50%, transparent 51%)
    `,
    animation: "twinkle 6s infinite alternate",
    opacity: 0.6,
  },

  chatCard: {
    position: "relative",
    zIndex: 10,
    width: "90%",
    maxWidth: 900,
    height: "85vh",
    backdropFilter: "blur(18px)",
    background: "rgba(20, 25, 40, 0.65)",
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.12)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "0 0 60px rgba(120,200,255,0.15), inset 0 0 20px rgba(255,255,255,0.03)",
  },

  header: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 700 },
  subtitle: { opacity: 0.7 },

  chatArea: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 6,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  bubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: 18,
    lineHeight: 1.7,
    animation: "fadeUp 0.3s ease",
    transition: "transform 0.2s ease",
  },

  aiBubble: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e5f0ff",
  },

  userBubble: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #6cf, #9f6cff)",
    color: "#000",
    fontWeight: 600,
  },

  shimmer: {
    background: "linear-gradient(90deg, #aaa, #fff, #aaa)",
    backgroundSize: "200%",
    WebkitBackgroundClip: "text",
    color: "transparent",
    animation: "shimmer 1.5s infinite",
  },

  inputRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
  },

  input: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.5)",
    color: "white",
    outline: "none",
    fontSize: 15,
  },

  sendBtn: {
    borderRadius: "50%",
    width: 48,
    height: 48,
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #6cf, #9f6cff)",
    fontSize: 18,
  },
};