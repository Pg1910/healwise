import React, { useState, useEffect, useRef } from 'react';

export default function MeditationSession({ darkMode, userProfile }) {
  const [activeSession, setActiveSession] = useState(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [breathCount, setBreathCount] = useState(0);
  const [showGuidance, setShowGuidance] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef(null);
  const phaseRef = useRef(null);

  const meditationSessions = {
    breathwork: {
      name: 'Mindful Breathing',
      duration: 300, // 5 minutes
      icon: '🌬️',
      description: 'Focus on your breath to center yourself and reduce anxiety',
      phases: [
        { type: 'intro', duration: 30, text: 'Welcome. Find a comfortable position and close your eyes if you wish.' },
        { type: 'breath_focus', duration: 60, text: 'Begin by noticing your natural breath. No need to change anything.' },
        { type: 'counted_breathing', duration: 120, text: 'Now breathe in for 4 counts, hold for 4, and out for 6.' },
        { type: 'mindful_awareness', duration: 60, text: 'Notice any thoughts without judgment. Return focus to your breath.' },
        { type: 'closing', duration: 25, text: 'Slowly wiggle your fingers and toes. Take a moment to appreciate this time.' }
      ]
    },
    body_scan: {
      name: 'Body Scan Relaxation',
      duration: 600, // 10 minutes
      icon: '🧘‍♀️',
      description: 'Progressive relaxation technique to release tension and stress',
      phases: [
        { type: 'intro', duration: 45, text: 'Lie down comfortably. We\'ll scan your body from head to toe.' },
        { type: 'head_neck', duration: 90, text: 'Focus on your head and neck. Notice any tension, then let it melt away.' },
        { type: 'shoulders_arms', duration: 90, text: 'Feel your shoulders dropping. Let your arms become heavy and relaxed.' },
        { type: 'chest_core', duration: 90, text: 'Notice your chest rising and falling. Feel your core muscles softening.' },
        { type: 'hips_legs', duration: 120, text: 'Release tension from your hips, thighs, and calves. Feel grounded.' },
        { type: 'feet_toes', duration: 60, text: 'Finally, relax your feet and toes. Feel completely at ease.' },
        { type: 'integration', duration: 90, text: 'Feel your whole body relaxed and peaceful. Rest in this sensation.' },
        { type: 'closing', duration: 15, text: 'Slowly return your awareness to the room. Move gently when ready.' }
      ]
    },
    loving_kindness: {
      name: 'Loving-Kindness Meditation',
      duration: 480, // 8 minutes
      icon: '💖',
      description: 'Cultivate compassion for yourself and others',
      phases: [
        { type: 'intro', duration: 60, text: 'Place your hand on your heart. We\'ll practice sending love and kindness.' },
        { type: 'self_love', duration: 90, text: 'Silently repeat: "May I be happy. May I be healthy. May I be at peace."' },
        { type: 'loved_one', duration: 90, text: 'Think of someone you love. Send them: "May you be happy. May you be healthy. May you be at peace."' },
        { type: 'neutral_person', duration: 90, text: 'Picture someone neutral. Extend the same wishes: "May you be happy, healthy, and at peace."' },
        { type: 'difficult_person', duration: 75, text: 'If comfortable, include someone challenging. Send them peace and healing.' },
        { type: 'all_beings', duration: 60, text: 'Expand to all beings everywhere: "May all beings be happy, healthy, and free from suffering."' },
        { type: 'closing', duration: 15, text: 'Rest in this feeling of universal love and connection.' }
      ]
    },
    quick_calm: {
      name: 'Quick Calm (3-Min)',
      duration: 180, // 3 minutes
      icon: '⚡',
      description: 'Rapid stress relief for busy moments',
      phases: [
        { type: 'intro', duration: 15, text: 'Take three deep breaths. You have this moment for yourself.' },
        { type: 'grounding', duration: 45, text: 'Feel your feet on the ground. Notice 3 things you can see, 2 you can hear, 1 you can touch.' },
        { type: 'breathing', duration: 90, text: 'Breathe in calm for 4 counts, hold peace for 4, breathe out stress for 6.' },
        { type: 'intention', duration: 30, text: 'Set an intention for the rest of your day. You are capable and calm.' }
      ]
    },
    sleep_prep: {
      name: 'Sleep Preparation',
      duration: 720, // 12 minutes
      icon: '🌙',
      description: 'Gentle transition into peaceful sleep',
      phases: [
        { type: 'intro', duration: 60, text: 'Settle into bed. Let your body sink into comfort and support.' },
        { type: 'day_release', duration: 120, text: 'Acknowledge your day without judgment. Let thoughts drift away like clouds.' },
        { type: 'muscle_relaxation', duration: 180, text: 'Starting with your toes, consciously relax each part of your body.' },
        { type: 'breath_slowing', duration: 150, text: 'Allow your breathing to become slower and deeper with each exhale.' },
        { type: 'peaceful_imagery', duration: 180, text: 'Imagine a peaceful place where you feel completely safe and serene.' },
        { type: 'sleep_transition', duration: 30, text: 'Rest in this peace. Let sleep come naturally when it\'s ready.' }
      ]
    }
  };

  const startSession = (sessionKey) => {
    const session = meditationSessions[sessionKey];
    setActiveSession({ key: sessionKey, ...session });
    setSessionProgress(0);
    setBreathCount(0);
    setCurrentPhase(session.phases[0]);
    setIsPlaying(true);
    setShowGuidance(true);
  };

  const pauseSession = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeSession = () => {
    setIsPlaying(true);
  };

  const endSession = () => {
    setIsPlaying(false);
    setActiveSession(null);
    setSessionProgress(0);
    setCurrentPhase('');
    setCompletedSessions(prev => prev + 1);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (phaseRef.current) {
      clearTimeout(phaseRef.current);
    }
  };

  useEffect(() => {
    if (isPlaying && activeSession) {
      intervalRef.current = setInterval(() => {
        setSessionProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= activeSession.duration) {
            endSession();
            return activeSession.duration;
          }
          return newProgress;
        });
      }, 1000);

      // Handle phase transitions
      let currentTime = 0;
      activeSession.phases.forEach((phase, index) => {
        phaseRef.current = setTimeout(() => {
          if (isPlaying) {
            setCurrentPhase(phase);
            
            // Special breathing guidance for breath-focused sessions
            if (phase.type === 'counted_breathing' && activeSession.key === 'breathwork') {
              let breathTimer = setInterval(() => {
                setBreathCount(prev => prev + 1);
              }, 14000); // One complete breath cycle (4+4+6 = 14 seconds)
              
              setTimeout(() => clearInterval(breathTimer), phase.duration * 1000);
            }
          }
        }, currentTime * 1000);
        currentTime += phase.duration;
      });

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (phaseRef.current) clearTimeout(phaseRef.current);
      };
    }
  }, [isPlaying, activeSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = activeSession ? (sessionProgress / activeSession.duration) * 100 : 0;

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  if (activeSession) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'}`}>
        <div className={`${cardClasses} border p-8 rounded-xl max-w-2xl w-full text-center`}>
          {/* Session Header */}
          <div className="mb-6">
            <div className="text-4xl mb-2">{activeSession.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{activeSession.name}</h2>
            <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatTime(sessionProgress)} / {formatTime(activeSession.duration)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mb-6`}>
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Current Phase Guidance */}
          {currentPhase && showGuidance && (
            <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-50'}`}>
              <p className={`text-lg leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                {currentPhase.text}
              </p>
              
              {/* Breathing Visual for counted breathing */}
              {currentPhase.type === 'counted_breathing' && (
                <div className="mt-4">
                  <div className={`w-20 h-20 mx-auto rounded-full border-4 ${darkMode ? 'border-blue-400' : 'border-blue-600'} breathing-circle`}></div>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Follow the circle • Breath #{breathCount}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            {isPlaying ? (
              <button
                onClick={pauseSession}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all"
              >
                ▶️ Continue
              </button>
            )}
            
            <button
              onClick={() => setShowGuidance(!showGuidance)}
              className={`px-4 py-3 ${cardClasses} border rounded-xl hover:shadow-md transition-all`}
            >
              {showGuidance ? '🙈 Hide Text' : '👁️ Show Text'}
            </button>
            
            <button
              onClick={endSession}
              className={`px-4 py-3 ${darkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'} rounded-xl transition-all`}
            >
              ✕ End
            </button>
          </div>

          {/* Completion Message */}
          {sessionProgress >= activeSession.duration && (
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50'}`}>
              <h3 className="text-xl font-semibold mb-2">🎉 Session Complete!</h3>
              <p className={`${darkMode ? 'text-green-200' : 'text-green-800'}`}>
                Well done! You've completed {formatTime(activeSession.duration)} of mindful meditation.
                Take a moment to notice how you feel.
              </p>
            </div>
          )}
        </div>

        {/* Breathing Animation Styles */}
        <style jsx>{`
          .breathing-circle {
            animation: breathe 14s infinite;
          }
          
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            28.5% { transform: scale(1.3); opacity: 1; } /* 4s in */
            57% { transform: scale(1.3); opacity: 1; } /* 4s hold */
            85.5% { transform: scale(1); opacity: 0.7; } /* 6s out */
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardClasses} border p-8 rounded-xl max-w-4xl w-full`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">🧘 Guided Meditation Center</h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Personalized meditation sessions for every moment and mood
          </p>
          {userProfile && (
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Welcome back, {userProfile.name}! You've completed {completedSessions} sessions.
            </p>
          )}
        </div>

        {/* Session Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(meditationSessions).map(([key, session]) => (
            <div
              key={key}
              onClick={() => startSession(key)}
              className={`p-6 rounded-xl cursor-pointer transition-all hover:shadow-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{session.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{session.name}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  {session.description}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded-full ${darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    {formatTime(session.duration)}
                  </span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {session.phases.length} phases
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl mb-8`}>
          <h3 className="text-xl font-semibold mb-4 text-center">🌟 Science-Backed Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="font-medium mb-1">Reduces Anxiety</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Regular meditation decreases cortisol and activates the parasympathetic nervous system
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💪</div>
              <h4 className="font-medium mb-1">Improves Focus</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Strengthens attention span and cognitive control through mindfulness practice
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">😴</div>
              <h4 className="font-medium mb-1">Better Sleep</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Meditation increases melatonin production and improves sleep quality
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">❤️</div>
              <h4 className="font-medium mb-1">Emotional Balance</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Develops emotional regulation and increases self-awareness
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🌱</div>
              <h4 className="font-medium mb-1">Stress Resilience</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Builds capacity to handle life's challenges with greater ease
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-medium mb-1">Compassion</h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loving-kindness practice increases empathy and social connection
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className={`p-4 ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'} rounded-lg`}>
          <h4 className="font-semibold mb-2">💡 Meditation Tips:</h4>
          <ul className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'} space-y-1`}>
            <li>• Find a quiet, comfortable space where you won't be disturbed</li>
            <li>• It's normal for your mind to wander - gently return focus when you notice</li>
            <li>• Start with shorter sessions and gradually increase duration</li>
            <li>• Consistency matters more than duration - even 3 minutes daily helps</li>
            <li>• Use headphones for the best experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}