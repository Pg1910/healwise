import React, { useState, useEffect } from "react";
import AuthScreen from "./components/AuthScreen";
import OnboardingFlow from "./components/OnboardingFlow";
import TherapyProgressChart from "./components/TherapyProgressChart";
import GameCenter from "./components/GameCenter";
import EarlyWarningDashboard from './components/EarlyWarningDashboard';
import TestingDashboard from './components/TestingDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [conversations, setConversations] = useState({});
  const [activeConvId, setActiveConvId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showEarlyWarning, setShowEarlyWarning] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [progressData, setProgressData] = useState([]);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('healwise_auth');
    const savedProfile = localStorage.getItem('healwise_profile');
    const savedConversations = localStorage.getItem('healwise_conversations');
    const savedDarkMode = localStorage.getItem('healwise_darkMode');
    const savedProgress = localStorage.getItem('healwise_progress');

    if (savedAuth) {
      setIsAuthenticated(true);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        setShowOnboarding(true);
      }
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
      if (savedProgress) {
        setProgressData(JSON.parse(savedProgress));
      }
    }
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save conversations and progress to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('healwise_conversations', JSON.stringify(conversations));
      localStorage.setItem('healwise_progress', JSON.stringify(progressData));
    }
  }, [conversations, progressData, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('healwise_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleAuth = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem('healwise_auth', JSON.stringify(userData));
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (profile) => {
    setUserProfile(profile);
    setShowOnboarding(false);
    localStorage.setItem('healwise_profile', JSON.stringify(profile));
    
    // Create initial conversation
    const defaultId = "welcome_chat";
    const welcomeConv = {
      messages: [{
        from: "bot",
        text: getPersonalizedWelcome(profile),
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };
    setConversations({ [defaultId]: welcomeConv });
    setActiveConvId(defaultId);
  };

  const getPersonalizedWelcome = (profile) => {
    const { personality, botPersona, interests } = profile;
    const personaGreetings = {
      friend: "Hey there! 🌟 I'm so glad you're here.",
      sibling: "Heyyyy! Your digital sibling is here for you! 💫",
      parent: "Hello sweetheart, I'm here to support you always. 🤗",
      mentor: "Welcome! I'm here to guide and support your journey. 🌱"
    };
    
    return `${personaGreetings[botPersona] || personaGreetings.friend} I can see you're interested in ${interests.slice(0, 2).join(' and ')}, and I love that about you! Think of me as your personal mental wellness companion - I'm here whenever you need to talk, reflect, or just share what's on your mind. What's going well for you today?`;
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuth={handleAuth} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} darkMode={darkMode} />;
  }

  if (showProgress) {
    return (
      <TherapyProgressChart 
        progressData={progressData}
        onBack={() => setShowProgress(false)}
        darkMode={darkMode}
      />
    );
  }

  if (showGames) {
    return (
      <GameCenter 
        onBack={() => setShowGames(false)}
        darkMode={darkMode}
        userProfile={userProfile}
      />
    );
  }

  if (showEarlyWarning) {
    return (
      <EarlyWarningDashboard 
        conversations={conversations}
        userProfile={userProfile}
        onBack={() => setShowEarlyWarning(false)}
        darkMode={darkMode}
      />
    );
  }

  if (showTesting) {
    return (
      <TestingDashboard 
        onBack={() => setShowTesting(false)}
        darkMode={darkMode}
      />
    );
  }

  const currentMessages = activeConvId ? conversations[activeConvId]?.messages || [] : [];

  const createNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    setConversations(prev => ({
      ...prev,
      [newId]: { messages: [], createdAt: new Date().toISOString() }
    }));
    setActiveConvId(newId);
  };

  const updateProgressData = (emotionScores, riskLevel) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: today,
      mood: emotionScores.joy || 0,
      anxiety: emotionScores.fear || emotionScores.nervousness || 0,
      depression: emotionScores.sadness || emotionScores.disappointment || 0,
      overall: Object.values(emotionScores).reduce((sum, val) => sum + val, 0) / Object.keys(emotionScores).length,
      riskLevel: riskLevel
    };

    setProgressData(prev => {
      const filtered = prev.filter(entry => entry.date !== today);
      return [...filtered, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeConvId) return;

    const userMsg = { from: "user", text, timestamp: new Date().toISOString() };
    
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
      const res = await fetch(`http://127.0.0.1:8000/analyze`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Profile": JSON.stringify(userProfile)
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      
      // Update progress tracking
      if (data.probs) {
        updateProgressData(data.probs, data.risk);
      }

      const botMsg = {
        from: "bot",
        text: data.supportive_message,
        timestamp: new Date().toISOString(),
        risk: data.risk,
        recommendations: data.helpful_resources,
        nextSteps: data.suggested_next_steps,
        emotions: data.probs
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

  const baseClasses = darkMode 
    ? "bg-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50";
  
  const sidebarClasses = darkMode
    ? "bg-gray-800 border-gray-700 shadow-xl"
    : "bg-gradient-to-b from-amber-100 to-orange-100 border-orange-200 shadow-xl";

  const cardClasses = darkMode
    ? "bg-gray-700 border-gray-600"
    : "bg-white border-orange-200";

  return (
    <div className={`flex h-screen ${baseClasses}`}>
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 ${sidebarClasses} border-r flex flex-col`}>
        <div className="p-6 border-b border-opacity-20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'} font-serif`}>
                  ✍️ HealWise
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-amber-600'} mt-1 italic`}>
                  Your personal wellness journal
                </p>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-orange-200'} transition-colors`}
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-orange-200'} transition-colors`}
                title="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
        
        {!sidebarCollapsed && (
          <>
            <div className="p-4 space-y-2">
              <button
                onClick={createNewConversation}
                className={`w-full ${darkMode ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'} text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                📝 New Journal Entry
              </button>
              
              <button
                onClick={() => setShowProgress(true)}
                className={`w-full ${cardClasses} py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-md`}
              >
                📊 Progress Charts
              </button>
              
              <button
                onClick={() => setShowGames(true)}
                className={`w-full ${cardClasses} py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-md`}
              >
                🎮 Mind Games
              </button>

              <button
                onClick={() => setShowEarlyWarning(true)}
                className={`w-full ${cardClasses} py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-md flex items-center space-x-2`}
              >
                <span>🔮</span>
                <span>Wellness Insights</span>
              </button>

              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowTesting(true)}
                  className={`w-full ${cardClasses} py-2 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-md border-2 border-dashed border-blue-500`}
                >
                  🧪 System Testing
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {Object.entries(conversations).map(([id, conv]) => (
                <div
                  key={id}
                  onClick={() => setActiveConvId(id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeConvId === id 
                      ? `${darkMode ? 'bg-gray-700 border-l-4 border-amber-500' : 'bg-orange-50 border-l-4 border-orange-500'} shadow-sm` 
                      : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-orange-50'}`
                  }`}
                >
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {conv.messages.length > 0 
                      ? conv.messages[0].text.substring(0, 30) + '...'
                      : 'New conversation'
                    }
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Chat Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'} shadow-sm border-b p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'} font-serif`}>
                📖 Personal Wellness Journal
              </h2>
              {userProfile && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-amber-600'} italic`}>
                  Speaking with your {userProfile.botPersona} • {userProfile.personality} mode
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 ${darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'} rounded-full text-xs font-medium`}>
                🔒 Local & Private
              </span>
            </div>
          </div>
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
                <div className={`w-8 h-8 ${darkMode ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                  ✍️
                </div>
              )}
              <div
                className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.from === "user"
                    ? `${darkMode ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'} text-white rounded-br-md`
                    : `${darkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-orange-200'} rounded-bl-md border`
                }`}
              >
                <p className="text-sm leading-relaxed font-serif">{msg.text}</p>
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className={`mt-3 p-2 ${darkMode ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-50'} rounded-lg`}>
                    <p className={`text-xs font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'} mb-1`}>💡 Gentle suggestions:</p>
                    <ul className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'} space-y-1`}>
                      {msg.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {msg.from === "user" && (
                <div className={`w-8 h-8 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full flex items-center justify-center ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  👤
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${darkMode ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                ✍️
              </div>
              <div className={`${darkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-orange-200'} rounded-2xl rounded-bl-md border px-4 py-3 shadow-sm`}>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} italic`}>HealWise is reflecting...</span>
                  <div className="typing-dots flex space-x-1">
                    <div className={`w-2 h-2 ${darkMode ? 'bg-amber-500' : 'bg-orange-500'} rounded-full animate-bounce`}></div>
                    <div className={`w-2 h-2 ${darkMode ? 'bg-amber-500' : 'bg-orange-500'} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
                    <div className={`w-2 h-2 ${darkMode ? 'bg-amber-500' : 'bg-orange-500'} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'} border-t p-4`}>
          <div className="flex space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What's weighing on your mind today? Share your thoughts, feelings, or experiences... 📝"
              className={`flex-1 resize-none border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 focus:ring-amber-500' : 'border-orange-300 bg-white text-gray-800 focus:ring-orange-500'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 font-serif`}
              rows="2"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`${darkMode ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700' : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'} text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? "..." : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
