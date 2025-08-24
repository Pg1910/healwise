import React, { useState } from 'react';

export default function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [understandSupport, setUnderstandSupport] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!agreeToTerms || !understandSupport) {
      alert('Please read and agree to the terms and privacy notice before continuing.');
      return;
    }
    
    setLoading(true);
    
    // Simulate auth process
    setTimeout(() => {
      const userData = {
        email,
        id: Date.now().toString(),
        name: email.split('@')[0],
        authMethod: 'email',
        agreedToTerms: true,
        consentDate: new Date().toISOString()
      };
      onAuth(userData);
      setLoading(false);
    }, 1000);
  };

  const handleGoogleAuth = () => {
    if (!agreeToTerms || !understandSupport) {
      alert('Please read and agree to the terms and privacy notice before continuing.');
      return;
    }
    
    setLoading(true);
    // Simulate Google auth
    setTimeout(() => {
      const userData = {
        email: 'user@gmail.com',
        id: Date.now().toString(),
        name: 'User',
        authMethod: 'google',
        agreedToTerms: true,
        consentDate: new Date().toISOString()
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
          
          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">🛡️ Your Privacy & Safety</h3>
            <ul className="text-xs text-purple-700 space-y-1 text-left">
              <li>• All conversations stored locally on your device</li>
              <li>• No data shared with third parties</li>
              <li>• Crisis support available 24/7</li>
              <li>• Not a replacement for professional therapy</li>
            </ul>
          </div>
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

          {/* Consent Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3 text-sm">
              <input
                type="checkbox"
                checked={understandSupport}
                onChange={(e) => setUnderstandSupport(e.target.checked)}
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">
                I understand that HealWise provides <strong>emotional support and wellness guidance</strong>, but is not a substitute for professional mental healthcare or crisis intervention.
              </span>
            </label>

            <label className="flex items-start space-x-3 text-sm">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">
                I agree to store my conversations locally on this device and acknowledge that all data remains <strong>private and secure</strong>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreeToTerms || !understandSupport}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={loading || !agreeToTerms || !understandSupport}
            className="mt-4 w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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