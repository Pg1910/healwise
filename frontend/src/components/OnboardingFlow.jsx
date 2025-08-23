import React, { useState } from 'react';

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    interests: [],
    personality: '',
    botPersona: '',
    preferredTone: '',
    mentalHealthGoals: [],
    currentMood: ''
  });

  const personalityTypes = [
    { id: 'foody', label: '🍕 Foodie', desc: 'Love exploring cuisines and cooking' },
    { id: 'techy', label: '💻 Tech Enthusiast', desc: 'Into gadgets, coding, and innovation' },
    { id: 'genz', label: '🌟 Gen-Z Vibe', desc: 'Modern, trendy, social media savvy' },
    { id: 'creative', label: '🎨 Creative Soul', desc: 'Artistic, imaginative, expressive' },
    { id: 'fitness', label: '💪 Fitness Focus', desc: 'Health, exercise, and wellness oriented' },
    { id: 'bookworm', label: '📚 Bookworm', desc: 'Love reading, learning, and deep conversations' }
  ];

  const botPersonas = [
    { id: 'friend', label: '👫 Understanding Friend', desc: 'Casual, supportive, like a close buddy' },
    { id: 'sibling', label: '👨‍👩‍👧‍👦 Caring Sibling', desc: 'Playful, protective, familiar energy' },
    { id: 'parent', label: '👨‍👩‍👧 Nurturing Parent', desc: 'Wise, comforting, always supportive' },
    { id: 'mentor', label: '🧑‍🏫 Wise Mentor', desc: 'Guiding, insightful, growth-focused' }
  ];

  const interests = [
    'Music', 'Movies', 'Sports', 'Gaming', 'Travel', 'Photography',
    'Cooking', 'Reading', 'Art', 'Technology', 'Nature', 'Fitness',
    'Fashion', 'Writing', 'Learning', 'Socializing'
  ];

  const mentalHealthGoals = [
    'Manage anxiety', 'Handle stress better', 'Improve mood', 'Better sleep',
    'Build confidence', 'Process emotions', 'Develop coping skills', 'Find motivation',
    'Reduce loneliness', 'Practice gratitude', 'Mindfulness', 'Work-life balance'
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      const profile = {
        ...formData,
        personality: formData.personality || 'creative',
        botPersona: formData.botPersona || 'friend',
        preferredTone: formData.preferredTone || 'supportive',
        createdAt: new Date().toISOString()
      };
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Let's Get to Know You! ✨
            </h1>
            <span className="text-sm text-gray-500">Step {step} of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">👋 Basic Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What should I call you?
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your preferred name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your age"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">🎯 What describes you best?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalityTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => updateField('personality', type.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.personality === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{type.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{type.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">💫 Your interests (select multiple)</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleArrayField('interests', interest)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">🤝 How should I interact with you?</h2>
              <div className="grid grid-cols-1 gap-4">
                {botPersonas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => updateField('botPersona', persona.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.botPersona === persona.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{persona.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{persona.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">🎯 What are your wellness goals?</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {mentalHealthGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleArrayField('mentalHealthGoals', goal)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.mentalHealthGoals.includes(goal)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling today? 😊
              </label>
              <select
                value={formData.currentMood}
                onChange={(e) => updateField('currentMood', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select your current mood</option>
                <option value="great">😄 Great - feeling amazing!</option>
                <option value="good">😊 Good - pretty positive</option>
                <option value="okay">😐 Okay - just average</option>
                <option value="low">😔 Low - not feeling great</option>
                <option value="stressed">😰 Stressed - lots on my mind</option>
                <option value="anxious">😟 Anxious - feeling worried</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            {step === 4 ? "Let's Start! 🚀" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}