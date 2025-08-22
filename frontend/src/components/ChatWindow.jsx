// frontend/src/components/ChatWindow.jsx
import { useState, useRef, useEffect } from "react";
import { analyzeText } from "../services/api";

function ChatWindow() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi, I’m HealWise. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Ref for auto-scroll
  const messagesEndRef = useRef(null);

  // Scroll into view when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await analyzeText(userMsg.text);

      const botMsg = {
        sender: "bot",
        text: res.supportive_message || "I'm here for you.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, I couldn’t connect right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 bg-indigo-600 text-white font-bold text-lg shadow">
        HealWise Chat
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow max-w-xs ${
                msg.sender === "user"
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-none shadow flex items-center space-x-1">
              <span>HealWise is typing</span>
              <span className="flex space-x-1">
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-300"></span>
              </span>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type how you're feeling..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
