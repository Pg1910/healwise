import { useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import AnalysisCard from "./AnalysisCard";
import { analyzeText, health } from "../services/api";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { type: "text", sender: "bot", text: "Hi, I’m HealWise. How are you feeling today?" }
  ]);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => setConnected(await health()))();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { type: "text", sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await analyzeText(text);
      // Show supportive message as a bot reply
      const botMsg = { type: "text", sender: "bot", text: result.supportive_message };
      setMessages((prev) => [...prev, botMsg]);
      setLastAnalysis(result);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { type: "text", sender: "bot", text: "⚠️ Couldn't analyze that. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">HealWise 🪷</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {connected ? "Connected" : "Offline"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, idx) =>
          msg.type === "text" ? (
            <MessageBubble key={idx} sender={msg.sender} text={msg.text} />
          ) : null
        )}

        {/* Latest analysis panel */}
        {lastAnalysis && <AnalysisCard analysis={lastAnalysis} />}
        {loading && <div className="text-center text-sm text-gray-500 mt-2">Analyzing…</div>}
      </div>

      <div className="flex mt-2">
        <input
          className="flex-1 border rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your thoughts..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
