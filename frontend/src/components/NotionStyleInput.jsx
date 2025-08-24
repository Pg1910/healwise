import React, { useState, useRef, useEffect } from 'react';

const NotionStyleInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  loading, 
  darkMode 
}) => {
  const [placeholder, setPlaceholder] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  const placeholders = [
    "What's weighing on your mind today? ✨",
    "Share what you're feeling right now... 💭",
    "Tell me about your day, I'm here to listen 🌟",
    "What thoughts are swirling in your head? 🌸",
    "How are you really doing today? 💫",
    "What's been on your heart lately? 🫶",
    "Share your story, no matter how small... 📝",
    "What would you tell your closest friend? 💌",
    "Paint me a picture of your current mood... 🎨",
    "What chapter are you writing today? 📖"
  ];

  const writingPrompts = [
    "💭 How did you feel when you woke up this morning?",
    "🌟 What's one thing that made you smile recently?",
    "🌱 What's growing in your life right now?",
    "🤔 What's been challenging you lately?",
    "💝 What are you grateful for today?",
    "🌈 Describe your ideal version of tomorrow",
    "🎯 What's one goal that excites you?",
    "🌸 How do you want to feel?",
    "📚 What lesson is life teaching you?",
    "✨ What would you do if you felt completely free?"
  ];

  useEffect(() => {
    const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
    setPlaceholder(randomPlaceholder);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const insertPrompt = (prompt) => {
    onChange(value + (value ? '\n\n' : '') + prompt + ' ');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div className={`${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-orange-200'
    } border-t transition-all duration-300 ${
      focused ? 'shadow-2xl' : 'shadow-sm'
    }`}>
      {/* Writing Prompts Bar */}
      {focused && !value.trim() && (
        <div className={`px-6 py-3 border-b ${
          darkMode ? 'border-gray-700 bg-gray-750' : 'border-orange-100 bg-orange-25'
        }`}>
          <p className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-orange-600'
          } mb-2 font-medium`}>
            ✨ Need inspiration? Try one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {writingPrompts.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => insertPrompt(prompt)}
                className={`text-xs px-3 py-1 rounded-full ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                } transition-colors duration-200 border-none outline-none`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-6">
        <div className={`relative ${
          focused ? 'transform scale-105' : ''
        } transition-transform duration-200`}>
          {/* Character Count & Mood Indicator */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-4">
              <span className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-orange-600'
              } font-medium`}>
                💭 Your private space
              </span>
              {value.length > 0 && (
                <span className={`text-xs ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {value.length} characters
                </span>
              )}
            </div>
            
            {/* Engagement Elements */}
            {value.length > 50 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs">🌟</span>
                <span className={`text-xs ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                } font-medium`}>
                  Beautiful thoughts!
                </span>
              </div>
            )}
          </div>

          {/* Textarea Container */}
          <div className={`relative border-2 rounded-2xl transition-all duration-300 ${
            focused 
              ? (darkMode 
                  ? 'border-amber-500 bg-gray-700 shadow-xl' 
                  : 'border-orange-500 bg-orange-25 shadow-xl'
                )
              : (darkMode 
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-500' 
                  : 'border-orange-200 bg-white hover:border-orange-300'
                )
          }`}>
            
            {/* Floating Label Effect */}
            {focused && (
              <div className={`absolute -top-3 left-4 px-2 text-xs font-medium ${
                darkMode 
                  ? 'bg-gray-800 text-amber-400' 
                  : 'bg-white text-orange-600'
              }`}>
                ✍️ Share your thoughts
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              className={`w-full resize-none bg-transparent ${
                darkMode ? 'text-gray-100' : 'text-gray-800'
              } px-6 py-4 rounded-2xl focus:outline-none font-serif text-base leading-relaxed placeholder:italic ${
                darkMode ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'
              }`}
              style={{
                minHeight: '80px',
                maxHeight: '200px'
              }}
              disabled={loading}
            />

            {/* Submit Button */}
            <div className="absolute bottom-3 right-3">
              <button
                onClick={onSubmit}
                disabled={loading || !value.trim()}
                className={`${
                  value.trim() 
                    ? (darkMode 
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                      )
                    : (darkMode ? 'bg-gray-600' : 'bg-gray-300')
                } text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Reflecting...</span>
                  </>
                ) : (
                  <>
                    <span>Share</span>
                    <span>✨</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Encouraging Messages */}
          {!focused && !value && (
            <div className={`mt-3 text-center ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            } text-sm italic`}>
              🌟 Every thought matters. Start typing to begin your journey...
            </div>
          )}

          {focused && value.length === 0 && (
            <div className={`mt-3 text-center ${
              darkMode ? 'text-amber-400' : 'text-orange-600'
            } text-sm font-medium animate-pulse`}>
              💫 Take your time. There's no rush here.
            </div>
          )}
        </div>

        {/* Additional Encouragement */}
        {value.length > 100 && (
          <div className={`mt-4 p-3 rounded-xl ${
            darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  You're doing great!
                </p>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Expressing yourself is a powerful step toward wellness.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotionStyleInput;
