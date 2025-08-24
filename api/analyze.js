export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { text = '' } = req.body || {};
    
    // Generate contextual response
    const response = generateContextualFallback(text);
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      probs: { neutral: 1.0 },
      risk: 'SAFE',
      supportive_message: "I'm here to support you, though I'm having a technical moment. Your feelings are valid and important.",
      suggested_next_steps: ["Take a deep breath", "Try again in a moment"],
      helpful_resources: ["Crisis Text Line: Text HOME to 741741"],
      recommendations: { activities: [], books: [], movies: [], nutrition: [], resources: [] }
    });
  }
}

function generateContextualFallback(text) {
  const textLower = text.toLowerCase();
  
  // Base response
  let supportiveMessage = "Thank you for sharing what's on your mind with me. I can tell there's depth to what you're experiencing.";
  let suggestedNextSteps = [];
  let helpfulResources = [];
  let probs = { neutral: 0.8, optimism: 0.2 };
  let recommendations = {
    activities: [],
    books: [],
    movies: [],
    nutrition: [],
    resources: []
  };
  
  // Contextual responses based on keywords
  if (textLower.includes('anxious') || textLower.includes('worry') || textLower.includes('stress') || textLower.includes('nervous')) {
    supportiveMessage = "I can hear the anxiety in what you're sharing. Feeling anxious is completely natural, and you're not alone in this. It takes courage to acknowledge these feelings.";
    probs = { anxiety: 0.7, fear: 0.2, neutral: 0.1 };
    suggestedNextSteps = [
      "Practice the 4-7-8 breathing technique to calm your nervous system",
      "Try the 5-4-3-2-1 grounding exercise to center yourself in the present",
      "Consider writing down your worries to externalize anxious thoughts",
      "Take a gentle walk outside if possible to change your environment"
    ];
    recommendations = {
      activities: [
        { name: "Breathing Exercise", description: "4-7-8 breathing technique", duration: "5 minutes" },
        { name: "Mindful Walking", description: "Gentle outdoor walk", duration: "15 minutes" }
      ],
      books: [
        { title: "The Anxiety and Worry Workbook", author: "David A. Clark" },
        { title: "Dare: The New Way to End Anxiety", author: "Barry McDonagh" }
      ],
      movies: [
        { title: "Inside Out", description: "Understanding emotions", mood: "calming" }
      ],
      nutrition: [
        { name: "Chamomile Tea", benefit: "Natural calming effects" },
        { name: "Dark Chocolate", benefit: "Stress reduction" }
      ],
      resources: []
    };
  } else if (textLower.includes('sad') || textLower.includes('down') || textLower.includes('depressed') || textLower.includes('hopeless')) {
    supportiveMessage = "I can sense the heaviness in your words. Sadness is a valid emotion that deserves space to be felt and processed. You're taking a brave step by reaching out.";
    probs = { sadness: 0.8, neutral: 0.2 };
    suggestedNextSteps = [
      "Allow yourself to feel this sadness without judgment - emotions need space",
      "Consider gentle movement like stretching or a slow walk",
      "Reach out to someone you trust when you feel ready",
      "Practice self-compassion by treating yourself with kindness"
    ];
    recommendations = {
      activities: [
        { name: "Gentle Stretching", description: "Slow, mindful movement", duration: "10 minutes" },
        { name: "Journaling", description: "Express your feelings on paper", duration: "15 minutes" }
      ],
      books: [
        { title: "The Upward Spiral", author: "Alex Korb" },
        { title: "Feeling Good", author: "David D. Burns" }
      ],
      movies: [
        { title: "The Pursuit of Happyness", description: "Hope and resilience", mood: "uplifting" }
      ],
      nutrition: [
        { name: "Omega-3 Rich Foods", benefit: "Mood support" },
        { name: "Warm Soup", benefit: "Comfort and nourishment" }
      ],
      resources: []
    };
  } else if (textLower.includes('angry') || textLower.includes('frustrated') || textLower.includes('mad') || textLower.includes('furious')) {
    supportiveMessage = "I can feel the intensity of your frustration. Anger is often our heart's way of saying 'this matters to me.' Your feelings are completely valid.";
    probs = { anger: 0.7, frustration: 0.2, neutral: 0.1 };
    suggestedNextSteps = [
      "Channel this energy through physical activity like walking or exercise",
      "Write out your feelings without editing - let the anger flow onto paper",
      "Practice deep breathing to help manage the intensity",
      "Consider what boundary or change might address the source of anger"
    ];
  } else if (textLower.includes('overwhelmed') || textLower.includes('too much') || textLower.includes('cant cope')) {
    supportiveMessage = "It sounds like you're carrying a lot right now. Feeling overwhelmed makes complete sense when life feels like too much all at once.";
    probs = { overwhelmed: 0.6, anxiety: 0.3, neutral: 0.1 };
    suggestedNextSteps = [
      "Break down overwhelming tasks into smaller, manageable steps",
      "Practice saying 'no' to non-essential commitments right now",
      "Set aside 10 minutes for deep breathing or meditation",
      "Ask for help with specific tasks if possible"
    ];
  } else {
    suggestedNextSteps = [
      "Take a few moments to check in with your body and breath",
      "Consider what one small thing might bring you comfort right now",
      "Practice mindful awareness of your current feelings",
      "Engage in an activity that usually brings you peace"
    ];
  }
  
  // Always include supportive resources
  helpfulResources = [
    "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
    "National Suicide Prevention Lifeline: 988",
    "Mental Health America resources: mhanational.org"
  ];
  
  return {
    probs,
    risk: 'SAFE',
    supportive_message: supportiveMessage,
    suggested_next_steps: suggestedNextSteps,
    helpful_resources: helpfulResources,
    recommendations
  };
}
