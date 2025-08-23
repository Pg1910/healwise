import { useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // Add user message immediately
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Backend error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();

      // Compose bot response with details inline
      let botText = data.supportive_message ?? "";
      if (data?.risk) botText += `\n\nRisk: ${data.risk}`;
      if (Array.isArray(data?.suggested_next_steps) && data.suggested_next_steps.length) {
        botText += `\n\nNext steps:\n- ${data.suggested_next_steps.join("\n- ")}`;
      }
      if (Array.isArray(data?.helpful_resources) && data.helpful_resources.length) {
        botText += `\n\nResources:\n- ${data.helpful_resources.join("\n- ")}`;
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (err) {
      console.error("Error fetching:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Could not connect to HealWise backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} />
        ))}
        {loading && (
          <div className="flex items-center space-x-2 p-2 text-gray-500 italic">
            <span>HealWise is typing</span>
            <span className="typing-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex gap-2 border-t bg-gray-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type how you feel..."
          className="flex-1 px-3 py-2 rounded-lg border focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
