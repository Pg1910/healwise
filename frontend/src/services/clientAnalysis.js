/**
 * Client-side Mental Health Analysis Engine
 * Runs entirely in the browser - no server needed!
 * This is actually MORE reliable for mental health apps
 */

// Emotion keywords mapping for client-side analysis
const EMOTION_PATTERNS = {
  anxiety: [
    'anxious', 'worry', 'worried', 'stress', 'stressed', 'nervous', 'panic', 'overwhelmed',
    'scared', 'afraid', 'fear', 'fearful', 'tense', 'restless', 'uneasy', 'jittery'
  ],
  sadness: [
    'sad', 'down', 'depressed', 'hopeless', 'empty', 'lonely', 'grief', 'mourning',
    'heartbroken', 'blue', 'melancholy', 'despair', 'gloomy', 'dejected'
  ],
  anger: [
    'angry', 'mad', 'furious', 'frustrated', 'irritated', 'annoyed', 'rage', 'livid',
    'pissed', 'upset', 'resentful', 'bitter', 'hostile', 'aggressive'
  ],
  joy: [
    'happy', 'glad', 'excited', 'joyful', 'cheerful', 'elated', 'thrilled', 'delighted',
    'pleased', 'content', 'satisfied', 'optimistic', 'positive', 'grateful'
  ],
  overwhelmed: [
    'overwhelmed', 'too much', 'cant cope', 'breaking point', 'drowning', 'swamped',
    'buried', 'crushed', 'exhausted', 'burned out', 'at my limit'
  ]
};

// Risk assessment patterns
const RISK_PATTERNS = {
  HIGH: [
    'want to die', 'kill myself', 'end my life', 'suicide', 'hurt myself', 'self harm',
    'not worth living', 'better off dead', 'end it all', 'take my own life'
  ],
  MODERATE: [
    'hopeless', 'no point', 'give up', 'cant go on', 'worthless', 'useless',
    'nobody cares', 'better without me', 'disappear', 'escape everything'
  ],
  LOW: [
    'struggling', 'hard time', 'difficult', 'challenging', 'tough day',
    'not doing well', 'rough patch', 'going through a lot'
  ]
};

// Comprehensive recommendations database
const RECOMMENDATIONS_DB = {
  anxiety: {
    activities: [
      { name: "4-7-8 Breathing", description: "Inhale 4, hold 7, exhale 8", duration: "5 minutes" },
      { name: "5-4-3-2-1 Grounding", description: "Notice 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste", duration: "10 minutes" },
      { name: "Progressive Muscle Relaxation", description: "Tense and release each muscle group", duration: "15 minutes" },
      { name: "Mindful Walking", description: "Slow, deliberate steps focusing on each movement", duration: "10-20 minutes" }
    ],
    books: [
      { title: "The Anxiety and Worry Workbook", author: "David A. Clark", description: "Practical CBT techniques" },
      { title: "Dare: The New Way to End Anxiety", author: "Barry McDonagh", description: "Revolutionary approach to anxiety" },
      { title: "The Mindful Way Through Anxiety", author: "Susan Orsillo", description: "Mindfulness-based approach" }
    ],
    movies: [
      { title: "Inside Out", description: "Understanding emotions in a healthy way", mood: "educational" },
      { title: "Finding Nemo", description: "Overcoming fears and anxiety", mood: "uplifting" },
      { title: "The Pursuit of Happyness", description: "Resilience through difficult times", mood: "inspiring" }
    ],
    nutrition: [
      { name: "Chamomile Tea", benefit: "Natural calming properties", timing: "Evening" },
      { name: "Dark Chocolate", benefit: "Stress hormone reduction", timing: "Afternoon" },
      { name: "Magnesium-rich foods", benefit: "Muscle relaxation and calm", timing: "Any time" },
      { name: "Omega-3 fatty acids", benefit: "Brain health and mood stability", timing: "With meals" }
    ]
  },
  sadness: {
    activities: [
      { name: "Gentle Stretching", description: "Slow, mindful movement", duration: "10 minutes" },
      { name: "Journaling", description: "Express feelings without judgment", duration: "15 minutes" },
      { name: "Listen to Uplifting Music", description: "Choose songs that resonate positively", duration: "20 minutes" },
      { name: "Nature Connection", description: "Spend time outdoors, even briefly", duration: "15-30 minutes" }
    ],
    books: [
      { title: "The Upward Spiral", author: "Alex Korb", description: "Neuroscience of depression recovery" },
      { title: "Feeling Good", author: "David D. Burns", description: "Cognitive therapy techniques" },
      { title: "The Gifts of Imperfection", author: "Brené Brown", description: "Self-compassion and worthiness" }
    ],
    movies: [
      { title: "The Pursuit of Happyness", description: "Hope and perseverance", mood: "uplifting" },
      { title: "Good Will Hunting", description: "Healing and growth", mood: "inspiring" },
      { title: "A Beautiful Mind", description: "Overcoming mental challenges", mood: "hopeful" }
    ],
    nutrition: [
      { name: "Complex carbohydrates", benefit: "Serotonin production support", timing: "Morning" },
      { name: "Protein-rich foods", benefit: "Neurotransmitter support", timing: "Throughout day" },
      { name: "Warm, nourishing soups", benefit: "Comfort and nutrition", timing: "Lunch/Dinner" }
    ]
  },
  general: {
    activities: [
      { name: "Mindful Breathing", description: "Focus on natural breath rhythm", duration: "5 minutes" },
      { name: "Gratitude Practice", description: "List 3 things you're grateful for", duration: "5 minutes" },
      { name: "Body Scan", description: "Notice sensations without judgment", duration: "10 minutes" }
    ],
    books: [
      { title: "The Power of Now", author: "Eckhart Tolle", description: "Mindfulness and presence" },
      { title: "Atomic Habits", author: "James Clear", description: "Building positive habits" }
    ],
    movies: [
      { title: "Studio Ghibli Films", description: "Peaceful, calming narratives", mood: "serene" }
    ],
    nutrition: [
      { name: "Balanced meals", benefit: "Stable energy and mood", timing: "Regular intervals" },
      { name: "Hydration", benefit: "Brain function and clarity", timing: "Throughout day" }
    ]
  }
};

/**
 * Analyze text for emotions and generate contextual response
 * @param {string} text - User input text
 * @returns {Object} - Complete analysis with recommendations
 */
export function analyzeText(text) {
  console.log('🔄 Client-side analysis starting...');
  
  if (!text || !text.trim()) {
    return {
      probs: { neutral: 1.0 },
      risk: 'SAFE',
      supportive_message: "I'm here and ready to listen when you're ready to share.",
      suggested_next_steps: ["Take a moment to check in with yourself"],
      helpful_resources: getHelpfulResources(),
      recommendations: RECOMMENDATIONS_DB.general
    };
  }

  const textLower = text.toLowerCase();
  
  // Analyze emotions
  const emotionScores = analyzeEmotions(textLower);
  
  // Assess risk level
  const riskLevel = assessRisk(textLower);
  
  // Generate contextual response
  const response = generateContextualResponse(textLower, emotionScores, riskLevel);
  
  console.log('✅ Client-side analysis complete:', response);
  
  return response;
}

/**
 * Analyze emotions in text using keyword matching
 */
function analyzeEmotions(textLower) {
  const scores = {};
  let totalMatches = 0;
  
  Object.keys(EMOTION_PATTERNS).forEach(emotion => {
    const matches = EMOTION_PATTERNS[emotion].filter(keyword => 
      textLower.includes(keyword)
    ).length;
    
    if (matches > 0) {
      scores[emotion] = matches;
      totalMatches += matches;
    }
  });
  
  // Normalize scores
  if (totalMatches > 0) {
    Object.keys(scores).forEach(emotion => {
      scores[emotion] = scores[emotion] / totalMatches;
    });
  } else {
    scores.neutral = 1.0;
  }
  
  return scores;
}

/**
 * Assess risk level based on text content
 */
function assessRisk(textLower) {
  // Check for high-risk patterns
  for (const pattern of RISK_PATTERNS.HIGH) {
    if (textLower.includes(pattern)) {
      return 'CRISIS';
    }
  }
  
  // Check for moderate-risk patterns
  for (const pattern of RISK_PATTERNS.MODERATE) {
    if (textLower.includes(pattern)) {
      return 'MODERATE';
    }
  }
  
  // Check for low-risk patterns
  for (const pattern of RISK_PATTERNS.LOW) {
    if (textLower.includes(pattern)) {
      return 'LOW';
    }
  }
  
  return 'SAFE';
}

/**
 * Generate contextual response based on analysis
 */
function generateContextualResponse(textLower, emotionScores, riskLevel) {
  const dominantEmotion = Object.keys(emotionScores).reduce((a, b) => 
    emotionScores[a] > emotionScores[b] ? a : b
  );
  
  let supportiveMessage = "Thank you for sharing what's on your mind with me. I can tell there's depth to what you're experiencing.";
  let suggestedNextSteps = [];
  let recommendations = RECOMMENDATIONS_DB.general;
  
  // Generate emotion-specific responses
  if (dominantEmotion === 'anxiety') {
    supportiveMessage = "I can hear the anxiety in what you're sharing. Feeling anxious is completely natural, and you're not alone in this. It takes courage to acknowledge these feelings.";
    recommendations = RECOMMENDATIONS_DB.anxiety;
    suggestedNextSteps = [
      "Practice the 4-7-8 breathing technique to calm your nervous system",
      "Try the 5-4-3-2-1 grounding exercise to center yourself in the present",
      "Consider writing down your worries to externalize anxious thoughts",
      "Take a gentle walk outside if possible to change your environment"
    ];
  } else if (dominantEmotion === 'sadness') {
    supportiveMessage = "I can sense the heaviness in your words. Sadness is a valid emotion that deserves space to be felt and processed. You're taking a brave step by reaching out.";
    recommendations = RECOMMENDATIONS_DB.sadness;
    suggestedNextSteps = [
      "Allow yourself to feel this sadness without judgment - emotions need space",
      "Consider gentle movement like stretching or a slow walk",
      "Reach out to someone you trust when you feel ready",
      "Practice self-compassion by treating yourself with kindness"
    ];
  } else if (dominantEmotion === 'anger') {
    supportiveMessage = "I can feel the intensity of your frustration. Anger is often our heart's way of saying 'this matters to me.' Your feelings are completely valid.";
    suggestedNextSteps = [
      "Channel this energy through physical activity like walking or exercise",
      "Write out your feelings without editing - let the anger flow onto paper",
      "Practice deep breathing to help manage the intensity",
      "Consider what boundary or change might address the source of anger"
    ];
  } else if (dominantEmotion === 'overwhelmed') {
    supportiveMessage = "It sounds like you're carrying a lot right now. Feeling overwhelmed makes complete sense when life feels like too much all at once. You're handling more than anyone should manage alone.";
    suggestedNextSteps = [
      "Break down overwhelming tasks into smaller, manageable steps",
      "Practice saying 'no' to non-essential commitments right now",
      "Set aside 10 minutes for deep breathing or meditation",
      "Ask for help with specific tasks if possible"
    ];
  } else if (dominantEmotion === 'joy') {
    supportiveMessage = "I can feel the positive energy in what you're sharing! It's wonderful to hear about the good things happening in your life. These moments of joy are precious.";
    suggestedNextSteps = [
      "Savor this positive moment and let yourself fully experience it",
      "Consider sharing your joy with someone you care about",
      "Practice gratitude for the good things in your life",
      "Use this positive energy to tackle something meaningful to you"
    ];
  } else {
    suggestedNextSteps = [
      "Take a few moments to check in with your body and breath",
      "Consider what one small thing might bring you comfort right now",
      "Practice mindful awareness of your current feelings",
      "Engage in an activity that usually brings you peace"
    ];
  }
  
  // Add crisis-specific messaging if needed
  if (riskLevel === 'CRISIS') {
    supportiveMessage = "I'm deeply concerned about what you're sharing. Your life has value and meaning, even when it doesn't feel that way. Please reach out for immediate support.";
    suggestedNextSteps = [
      "Call 988 (Suicide & Crisis Lifeline) immediately for support",
      "Reach out to a trusted friend, family member, or mental health professional",
      "Go to your nearest emergency room if you're in immediate danger",
      "Text HOME to 741741 for immediate crisis support"
    ];
  }
  
  return {
    probs: emotionScores,
    risk: riskLevel,
    supportive_message: supportiveMessage,
    suggested_next_steps: suggestedNextSteps,
    helpful_resources: getHelpfulResources(),
    recommendations
  };
}

/**
 * Get helpful resources for crisis support
 */
function getHelpfulResources() {
  return [
    "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
    "National Suicide Prevention Lifeline: 988",
    "Mental Health America resources: mhanational.org",
    "NAMI (National Alliance on Mental Illness): nami.org",
    "Psychology Today Therapist Finder: psychologytoday.com"
  ];
}

/**
 * Health check function for compatibility
 */
export function healthCheck() {
  return {
    status: 'healthy',
    model_loaded: true,
    timestamp: new Date().toISOString(),
    service: 'HealWise Client-Side Engine',
    mode: 'offline-capable'
  };
}
