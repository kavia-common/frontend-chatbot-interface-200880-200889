import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

/**
 * @typedef {"user" | "bot"} Sender
 * @typedef {{ id: string, sender: Sender, text: string, createdAt: number }} ChatMessage
 */

function generateId() {
  // Simple client-only id generator (no external deps).
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * Message bubble rendering with distinct alignment and styling based on sender.
 */
function MessageBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`messageRow ${isUser ? "messageRowUser" : "messageRowBot"}`}>
      <div
        className={`messageBubble ${
          isUser ? "messageBubbleUser" : "messageBubbleBot"
        }`}
        aria-label={isUser ? "User message" : "Bot message"}
      >
        {message.text}
      </div>
    </div>
  );
}

/**
 * Fixed input bar with a growing textarea and Send button.
 */
function ChatInputBar({ value, onChange, onSend, disabled }) {
  // Basic autosize up to a max height; keeps layout stable within the input bar.
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 140); // reasonable limit
    el.style.height = `${next}px`;
  }, [value]);

  return (
    <form
      className="chatInputBar"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      <label className="srOnly" htmlFor="chatInput">
        Type your message
      </label>
      <textarea
        id="chatInput"
        ref={textareaRef}
        className="chatTextarea"
        placeholder="Type a message…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
      />
      <button className="sendButton" type="submit" disabled={disabled}>
        Send
      </button>
    </form>
  );
}

/**
 * Chat window: scrollable transcript + fixed input bar.
 */
function ChatWindow() {
  const initialMessages = useMemo(
    () => [
      {
        id: generateId(),
        sender: "bot",
        text: "Hi! I'm a client-only demo bot. Type a message to add it to the transcript.",
        createdAt: Date.now(),
      },
    ],
    []
  );

  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const transcriptRef = useRef(null);
  const endRef = useRef(null);

  const sendDisabled = draft.trim().length === 0;

  const appendUserMessage = () => {
    const text = draft.trim();
    if (!text) return;

    /** @type {ChatMessage} */
    const next = {
      id: generateId(),
      sender: "user",
      text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, next]);
    setDraft("");
  };

  // Auto-scroll to the bottom whenever a new message is added.
  useEffect(() => {
    if (!endRef.current) return;
    // Use scrollIntoView to avoid manual calculations and keep behavior consistent.
    endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className="chatCard" role="application" aria-label="Chatbot UI">
      <div className="chatHeader">
        <div className="chatTitle">Chat</div>
        <div className="chatSubtitle">Client-side transcript (no backend)</div>
      </div>

      <div className="chatTranscript" ref={transcriptRef} role="log" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} />
      </div>

      <ChatInputBar
        value={draft}
        onChange={setDraft}
        onSend={appendUserMessage}
        disabled={sendDisabled}
      />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** This is the application entry component for the CRA frontend. */
  return (
    <div className="App">
      <main className="page">
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;
