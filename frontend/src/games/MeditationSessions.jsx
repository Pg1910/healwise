import React, { useState, useEffect, useRef } from 'react';

export default function MeditationSessions({ darkMode, userProfile }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sessionPhase, setSessionPhase] = useState('preparation'); // preparation, breathing, meditation, completion
  const [breathCount, setBreathCount] = useState(0);
  const [breathPattern, setBreathPattern] = useState('4-7-8'); // 4-7-8, box, 4-4-4-4
  const [completedSessions, setCompletedSessions] = useState([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const botPersona = userProfile?.botPersona || 'friend';
  const playerName = userProfile?.name || 'friend';

  const meditationSessions = {
    'morning-calm': {
      title: '🌅 Morning Calm',
      duration: 300, // 5 minutes
      description: 'Start your day with peaceful awareness',
      phases: [
        { name: 'preparation', duration: 30, instruction: 'Find a comfortable position and close your eyes...' },
        { name: 'breathing', duration: 120, instruction: 'Focus on your natural breath...' },
        { name: 'meditation', duration: 120, instruction: 'Let thoughts come and go like clouds...' },
        { name: 'completion', duration: 30, instruction: 'Slowly bring awareness back to your body...' }
      ],
      backgroundSound: 'nature',
      color: 'from-amber-400 to-orange-500'
    },
    'stress-relief': {
      title: '😌 Stress Relief',
      duration: 600, // 10 minutes
      description: 'Release tension and find your center',
      phases: [
        { name: 'preparation', duration: 60, instruction: 'Notice any tension in your body...' },
        { name: 'breathing', duration: 240, instruction: 'Breathe out stress, breathe in calm...' },
        { name: 'meditation', duration: 240, instruction: 'Imagine stress melting away...' },
        { name: 'completion', duration: 60, instruction: 'Feel the peace you\'ve created...' }
      ],
      backgroundSound: 'rain',
      color: 'from-blue-400 to-cyan-500'
    },
    'sleep-prep': {
      title: '🌙 Sleep Preparation',
      duration: 900, // 15 minutes
      description: 'Wind down for restful sleep',
      phases: [
        { name: 'preparation', duration: 90, instruction: 'Let go of the day\'s concerns...' },
        { name: 'breathing', duration: 360, instruction: 'Each breath brings deeper relaxation...' },
        { name: 'meditation', duration: 360, instruction: 'Drift into peaceful awareness...' },
        { name: 'completion', duration: 90, instruction: 'Rest in this peaceful state...' }
      ],
      backgroundSound: 'white-noise',
      color: 'from-indigo-400 to-purple-500'
    },
    'quick-reset': {
      title: '⚡ Quick Reset',
      duration: 180, // 3 minutes
      description: 'Fast mindfulness break for busy moments',
      phases: [
        { name: 'preparation', duration: 20, instruction: 'Take a moment to pause...' },
        { name: 'breathing', duration: 80, instruction: 'Three deep, cleansing breaths...' },
        { name: 'meditation', duration: 60, instruction: 'Find your center of calm...' },
        { name: 'completion', duration: 20, instruction: 'Carry this peace with you...' }
      ],
      backgroundSound: 'silence',
      color: 'from-green-400 to-emerald-500'
    },
    'loving-kindness': {
      title: '💖 Loving Kindness',
      duration: 480, // 8 minutes
      description: 'Cultivate compassion for yourself and others',
      phases: [
        { name: 'preparation', duration: 60, instruction: 'Connect with your heart center...' },
        { name: 'breathing', duration: 120, instruction: 'Breathe in love, breathe out compassion...' },
        { name: 'meditation', duration: 240, instruction: 'Send loving kindness to all beings...' },
        { name: 'completion', duration: 60, instruction: 'Rest in the warmth of universal love...' }
      ],
      backgroundSound: 'bells',
      color: 'from-pink-400 to-rose-500'
    }
  };

  const breathingPatterns = {
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, description: 'Calming pattern for stress relief' },
    'box': { inhale: 4, hold: 4, exhale: 4, pause: 4, description: 'Balanced breathing for focus' },
    '4-4-4-4': { inhale: 4, pause: 4, exhale: 4, pause: 4, description: 'Rhythmic breathing for anxiety' }
  };

  const botEncouragement = {
    start: {
      friend: `Let's find some peace together, ${playerName}. I'll guide you through this. 🧘‍♀️`,
      sibling: `Time to zen out! I'll be right here with you! 😌`,
      parent: `Take this precious time for yourself, sweetheart. 💕`,
      mentor: `Mindfulness is a journey of self-discovery. Let's begin. 🌱`
    },
    mid: {
      friend: `You're doing beautifully, ${playerName}. Stay with your breath. 🌊`,
      sibling: `Halfway there! Your mind is getting stronger! 💪`,
      parent: `I'm so proud of you for taking this time. 🌸`,
      mentor: `Notice how awareness naturally deepens with practice. 📈`
    },
    complete: {
      friend: `Wonderful session! How do you feel now? ✨`,
      sibling: `Boom! You just leveled up your mindfulness! 🎉`,
      parent: `You did so well, my dear. Carry this peace with you. 🤗`,
      mentor: `Excellent practice. Notice how this affects your day. 🎯`
    }
  };

  const startSession = (sessionKey) => {
    setSelectedSession(sessionKey);
    setIsPlaying(true);
    setCurrentTime(0);
    setSessionPhase('preparation');
    setBreathCount(0);
    
    // Start timer
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
  };

  const pauseSession = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeSession = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
  };

  const endSession = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (selectedSession && currentTime > 0) {
      const session = meditationSessions[selectedSession];
      const completionPercentage = Math.round((currentTime / session.duration) * 100);
      
      setCompletedSessions(prev => [
        ...prev,
        {
          session: selectedSession,
          date: new Date().toISOString(),
          duration: currentTime,
          completion: completionPercentage
        }
      ]);
    }
    
    setSelectedSession(null);
    setCurrentTime(0);
    setSessionPhase('preparation');
    setBreathCount(0);
  };

  // Update phase based on time
  useEffect(() => {
    if (!selectedSession || !isPlaying) return;
    
    const session = meditationSessions[selectedSession];
    let accumulatedTime = 0;
    
    for (const phase of session.phases) {
      if (currentTime >= accumulatedTime && currentTime < accumulatedTime + phase.duration) {
        setSessionPhase(phase.name);
        break;
      }
      accumulatedTime += phase.duration;
    }
    
    // Session complete
    if (currentTime >= session.duration) {
      endSession();
    }
  }, [currentTime, selectedSession, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPhase = () => {
    if (!selectedSession) return null;
    return meditationSessions[selectedSession].phases.find(phase => phase.name === sessionPhase);
  };

  const getProgress = () => {
    if (!selectedSession) return 0;
    return (currentTime / meditationSessions[selectedSession].duration) * 100;
  };

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  if (selectedSession) {
    const session = meditationSessions[selectedSession];
    const currentPhaseData = getCurrentPhase();
    const progress = getProgress();
    
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`${cardClasses} border p-8 rounded-xl max-w-2xl w-full`}>
          {/* Session Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{session.title}</h2>
            <div className="text-3xl font-bold mb-4">{formatTime(currentTime)} / {formatTime(session.duration)}</div>
            
            {/* Progress Bar */}
            <div className={`w-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mb-6`}>
              <div 
                className={`h-full bg-gradient-to-r ${session.color} rounded-full transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Current Phase */}
            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-50'}`}>
              <h3 className="font-semibold text-lg mb-2 capitalize">{sessionPhase}</h3>
              <p className={`${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                {currentPhaseData?.instruction}
              </p>
            </div>
          </div>

          {/* Breathing Guide */}
          {sessionPhase === 'breathing' && (
            <div className="text-center mb-6">
              <div className="mb-4">
                <select 
                  value={breathPattern}
                  onChange={(e) => setBreathPattern(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  {Object.entries(breathingPatterns).map(([key, pattern]) => (
                    <option key={key} value={key}>
                      {key} Breathing - {pattern.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-center">
                <div className="text-lg mb-2">Breath Count: {breathCount}</div>
                <button
                  onClick={() => setBreathCount(prev => prev + 1)}
                  className={`w-32 h-32 rounded-full border-4 border-blue-500 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} hover:bg-blue-200 transition-all duration-300 text-2xl`}
                >
                  🫁
                </button>
                <div className="mt-2 text-sm text-gray-500">
                  Click to count breaths
                </div>
              </div>
            </div>
          )}

          {/* Meditation Visual */}
          {sessionPhase === 'meditation' && (
            <div className="text-center mb-6">
              <div className="relative">
                <div className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-r ${session.color} opacity-20 animate-pulse`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${session.color} opacity-60 animate-ping`} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl">🧘‍♀️</div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {isPlaying ? (
              <button
                onClick={pauseSession}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-700 transition-all"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all"
              >
                ▶️ Resume
              </button>
            )}
            
            <button
              onClick={endSession}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all"
            >
              🔚 End Session
            </button>
          </div>

          {/* Encouragement */}
          <div className={`mt-6 p-3 rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-50 text-green-200' : 'bg-green-50 text-green-800'}`}>
            <div className="text-center">
              {progress < 30 ? botEncouragement.start[botPersona] :
               progress < 80 ? botEncouragement.mid[botPersona] :
               botEncouragement.complete[botPersona]}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className={`${cardClasses} border p-8 rounded-xl max-w-4xl w-full`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">🧘‍♀️ Meditation Sessions</h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            Guided mindfulness practices for mental wellness
          </p>
        </div>

        {/* Session Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(meditationSessions).map(([key, session]) => (
            <div
              key={key}
              className={`p-6 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'} transition-all cursor-pointer`}
              onClick={() => startSession(key)}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${session.color} flex items-center justify-center text-white text-xl font-bold mb-4`}>
                {session.title.split(' ')[0]}
              </div>
              
              <h3 className="text-xl font-bold mb-2">{session.title}</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                {session.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {formatTime(session.duration)}
                </span>
                <button className={`px-4 py-2 bg-gradient-to-r ${session.color} text-white rounded-lg font-medium hover:opacity-90 transition-all`}>
                  Start Session
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Session History */}
        {completedSessions.length > 0 && (
          <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg mb-6`}>
            <h3 className="text-xl font-bold mb-4">📈 Your Meditation Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedSessions.slice(-6).map((session, index) => (
                <div key={index} className={`p-3 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded-lg`}>
                  <div className="font-medium">{meditationSessions[session.session].title}</div>
                  <div className="text-sm text-gray-500">
                    {formatTime(session.duration)} • {session.completion}% complete
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedSessions.length}</div>
                <div className="text-sm text-gray-500">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(completedSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}
                </div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(completedSessions.reduce((acc, s) => acc + s.completion, 0) / completedSessions.length)}%
                </div>
                <div className="text-sm text-gray-500">Avg Completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
          <h3 className="text-xl font-bold mb-4">🌟 Meditation Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
              <li>• <strong>Stress Reduction:</strong> Lower cortisol and anxiety levels</li>
              <li>• <strong>Emotional Regulation:</strong> Better mood stability</li>
              <li>• <strong>Focus Enhancement:</strong> Improved attention span</li>
              <li>• <strong>Sleep Quality:</strong> Deeper, more restful sleep</li>
            </ul>
            <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
              <li>• <strong>Self-Awareness:</strong> Greater understanding of thoughts</li>
              <li>• <strong>Compassion:</strong> Increased empathy and kindness</li>
              <li>• <strong>Physical Health:</strong> Lower blood pressure, better immunity</li>
              <li>• <strong>Resilience:</strong> Better ability to handle challenges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}