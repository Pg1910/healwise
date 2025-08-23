import React, { useState } from 'react';

export default function QuickTools({ darkMode, userProfile }) {
  const [activeExercise, setActiveExercise] = useState(null);

  const quickExercises = [
    {
      id: 'breathing',
      name: '4-7-8 Breathing',
      icon: '🌬️',
      duration: '2 min',
      description: 'Quick anxiety relief',
      component: BreathingExercise
    },
    {
      id: 'grounding',
      name: '5-4-3-2-1 Grounding',
      icon: '🏔️',
      duration: '3 min',
      description: 'Anxiety & panic management',
      component: GroundingExercise
    },
    {
      id: 'gratitude',
      name: 'Quick Gratitude',
      icon: '🙏',
      duration: '1 min',
      description: 'Mood boost',
      component: GratitudeExercise
    },
    {
      id: 'affirmation',
      name: 'Power Affirmations',
      icon: '💪',
      duration: '2 min',
      description: 'Confidence building',
      component: AffirmationExercise
    }
  ];

  if (activeExercise) {
    const ExerciseComponent = activeExercise.component;
    return (
      <ExerciseComponent 
        onComplete={() => setActiveExercise(null)}
        darkMode={darkMode}
        userProfile={userProfile}
      />
    );
  }

  const cardClasses = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-200";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">⚡ Quick Mental Health Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickExercises.map(exercise => (
          <div
            key={exercise.id}
            onClick={() => setActiveExercise(exercise)}
            className={`${cardClasses} border p-4 rounded-xl cursor-pointer hover:shadow-lg transition-all text-center`}
          >
            <div className="text-3xl mb-2">{exercise.icon}</div>
            <h3 className="font-semibold mb-1">{exercise.name}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              {exercise.description}
            </p>
            <span className={`inline-block px-2 py-1 rounded text-xs ${darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
              {exercise.duration}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}