import React, { useState, useEffect } from "react";

function App() {
  const [conversations, setConversations] = useState({});
  const [activeConvId, setActiveConvId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize with a default conversation
  useEffect(() => {
    const defaultId = "default";
    setConversations({ [defaultId]: { messages: [], createdAt: new Date().toISOString() } });
    setActiveConvId(defaultId);
  }, []);

  const currentMessages = activeConvId ? conversations[activeConvId]?.messages || [] : [];

  const createNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    setConversations(prev => ({
      ...prev,
      [newId]: { messages: [], createdAt: new Date().toISOString() }
    }));
    setActiveConvId(newId);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeConvId) return;

    const userMsg = { from: "user", text, timestamp: new Date().toISOString() };
    
    // Update current conversation
    setConversations(prev => ({
      ...prev,
      [activeConvId]: {
        ...prev[activeConvId],
        messages: [...(prev[activeConvId]?.messages || []), userMsg]
      }
    }));
    
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/analyze/${activeConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      const botMsg = {
        from: "bot",
        text: data.supportive_message,
        timestamp: new Date().toISOString(),
        risk: data.risk
      };

      setConversations(prev => ({
        ...prev,
        [activeConvId]: {
          ...prev[activeConvId],
          messages: [...(prev[activeConvId]?.messages || []), botMsg]
        }
      }));
    } catch (err) {
      console.error(err);
      const errorMsg = {
        from: "bot",
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toISOString()
      };
      setConversations(prev => ({
        ...prev,
        [activeConvId]: {
          ...prev[activeConvId],
          messages: [...(prev[activeConvId]?.messages || []), errorMsg]
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            HealWise
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your mental wellness companion</p>
        </div>
        
        <div className="p-4">
          <button
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            + New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.entries(conversations).map(([id, conv]) => (
            <div
              key={id}
              onClick={() => setActiveConvId(id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeConvId === id 
                  ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-800">
                {conv.messages.length > 0 
                  ? conv.messages[0].text.substring(0, 30) + '...'
                  : 'New conversation'
                }
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(conv.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {activeConvId ? `Chat ${activeConvId.replace('conv_', '').substring(0, 8)}` : 'Select a conversation'}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start space-x-3 ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.from === "bot" && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  🧠
                </div>
              )}
              <div
                className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.from === "user"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.risk && msg.risk !== 'SAFE' && (
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    msg.risk === 'HIGH' || msg.risk === 'CRISIS' 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {msg.risk.toLowerCase()} risk
                  </div>
                )}
              </div>
              {msg.from === "user" && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
                  👤
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                🧠
              </div>
              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">HealWise is thinking</span>
                  <div className="typing-dots flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share how you're feeling..."
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows="1"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
