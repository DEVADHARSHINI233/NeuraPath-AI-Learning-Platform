import React, { useState, useRef, useEffect } from "react";
import { api } from "../lib/api.js";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your AI study assistant. Ask me about DSA, ML concepts, placements, resumes, or anything career-related." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await api.chat(text);
      setMessages((m) => [...m, { role: "bot", text: res.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, I couldn't process that right now." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 h-96 mb-3 bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface2 flex items-center justify-between">
            <span className="text-sm font-display font-semibold">AI Study Assistant</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-ink2 text-sm">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                  m.role === "user" ? "bg-violet/20 text-ink2 ml-auto" : "bg-surface2 text-ink2"
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && <div className="text-xs text-muted px-1">Thinking…</div>}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a question…"
              className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet"
            />
            <button
              onClick={send}
              className="bg-gradient-to-r from-violet to-violetSoft text-white text-sm px-3 rounded-lg"
            >
              ↑
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-violet to-cyan shadow-lg flex items-center justify-center text-white text-lg"
      >
        {open ? "×" : "✦"}
      </button>
    </div>
  );
}
