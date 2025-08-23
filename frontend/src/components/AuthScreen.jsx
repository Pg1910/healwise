import React, { useState } from 'react';

export default function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate auth process
    setTimeout(() => {
      const userData = {
        email,
        id: Date.now().toString(),
        name: email.split('@')[0],
        authMethod: 'email'
      };
      onAuth(userData);
      setLoading(false);
    }, 1000);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    // Simulate Google auth
    setTimeout(() => {
      const userData = {
        email: 'user@gmail.com',
        id: Date.now().toString(),
        name: 'User',
        authMethod: 'google'
      };
      onAuth(userData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            ✨ HealWise ✨
          </h1>
          <p className="text-gray-600">Your personal mental wellness companion</p>
          <p className="text-sm text-gray-500 mt-2">🔒 100% Private & Local</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "Connecting..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-4 w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>🌐</span>
            <span>Google Account</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center space-y-1">
          <p>🔒 Your conversations stay on your device</p>
          <p>🚫 No cloud storage or data sharing</p>
          <p>💜 Built for your mental wellness</p>
        </div>
      </div>
    </div>
  );
}