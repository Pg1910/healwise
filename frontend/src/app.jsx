import React, { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // User message
    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();

      // Bot response
      const botMsg = {
        from: "bot",
        text: data.supportive_message,
        details: {
          risk: data.risk,
          nextSteps: data.suggested_next_steps || [],
          resources: data.helpful_resources || [],
        },
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Error contacting backend." },
      ]);
    }

    setInput(""); // clear input
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 text-xl font-semibold">
        HealWise 🧠
      </header>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start ${
              msg.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.from === "bot" && (
              <div className="mr-2 text-2xl">🧠</div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-lg shadow ${
                msg.from === "user"
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>

              {/* Extra details only for bot */}
              {msg.from === "bot" && msg.details && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <strong>Risk:</strong> {msg.details.risk}
                  </p>
                  <div>
                    <strong>✅ Next Steps:</strong>
                    <ul className="list-disc ml-5">
                      {msg.details.nextSteps?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>📚 Resources:</strong>
                    <ul className="list-disc ml-5">
                      {msg.details.resources?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            {msg.from === "user" && (
              <div className="ml-2 text-2xl">🙂</div>
            )}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-4 flex space-x-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your thoughts here..."
          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
