// Enhanced Analysis with Mistral Integration
const MISTRAL_API_BASE = 'http://localhost:11434/api/generate';

export async function analyzeWithMistral(userText, conversationHistory = []) {
  console.log('🧠 Enhanced analysis started with Mistral...');
  
  try {
    // First try Mistral for deep analysis
    const mistralResponse = await callMistralAPI(userText, conversationHistory);
    if (mistralResponse) {
      return mistralResponse;
    }
  } catch (error) {
    console.warn('Mistral unavailable, using enhanced local analysis:', error);
  }
  
  // Enhanced fallback with rich content
  return generateEnhancedLocalAnalysis(userText, conversationHistory);
}

async function callMistralAPI(userText, conversationHistory) {
  try {
    const contextPrompt = buildContextualPrompt(userText, conversationHistory);
    
    const response = await fetch(MISTRAL_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral:latest',
        prompt: contextPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return parseMistralResponse(data.response, userText);
    
  } catch (error) {
    console.error('Mistral API call failed:', error);
    return null;
  }
}

function buildContextualPrompt(userText, conversationHistory) {
  const historyContext = conversationHistory.length > 0 
    ? `Previous conversation context: ${conversationHistory.slice(-3).map(msg => `${msg.from}: ${msg.text}`).join('\n')}`
    : '';

  return `You are an empathetic mental health companion named HealWise. Analyze this user message and provide a detailed response.

${historyContext}

Current user message: "${userText}"

Please provide:
1. Emotional analysis (detect primary emotions and their intensity 0-1)
2. A deeply empathetic, personalized response that shows understanding
3. 3-4 specific, actionable next steps
4. Ask 1-2 thoughtful follow-up questions to understand their situation better
5. Risk assessment (SAFE, LOW, MODERATE, HIGH, CRISIS)

Be warm, understanding, and avoid generic responses. Show that you're really listening and want to understand their unique situation deeper. Ask questions that encourage them to share more about their feelings, circumstances, or what led to this moment.

Format your response as JSON:
{
  "emotions": {"emotion": probability},
  "supportive_message": "detailed empathetic response with follow-up questions",
  "suggested_next_steps": ["specific actionable step 1", "step 2", "step 3"],
  "risk_level": "SAFE|LOW|MODERATE|HIGH|CRISIS",
  "follow_up_questions": ["thoughtful question 1", "question 2"]
}`;
}

function parseMistralResponse(mistralText, originalText) {
  try {
    // Try to extract JSON from Mistral response
    const jsonMatch = mistralText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        probs: parsed.emotions || analyzeEmotionsLocal(originalText),
        risk: parsed.risk_level || 'SAFE',
        supportive_message: parsed.supportive_message || "I hear you and I'm here with you.",
        suggested_next_steps: parsed.suggested_next_steps || generateDefaultSteps(originalText),
        follow_up_questions: parsed.follow_up_questions || [],
        helpful_resources: getHelpfulResources(),
        recommendations: generateRichRecommendations(originalText, parsed.emotions)
      };
    }
  } catch (error) {
    console.error('Failed to parse Mistral response:', error);
  }
  
  // Fallback if parsing fails
  return generateEnhancedLocalAnalysis(originalText);
}

function generateEnhancedLocalAnalysis(userText, conversationHistory = []) {
  const textLower = userText.toLowerCase();
  const emotions = analyzeEmotionsLocal(userText);
  const primaryEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
  
  // Generate contextual response with depth
  const response = generateContextualResponse(userText, emotions, primaryEmotion, conversationHistory);
  
  return {
    probs: emotions,
    risk: assessRiskLevel(userText, emotions),
    supportive_message: response.message,
    suggested_next_steps: response.steps,
    follow_up_questions: response.questions,
    helpful_resources: getHelpfulResources(),
    recommendations: generateRichRecommendations(userText, emotions)
  };
}

function generateContextualResponse(userText, emotions, primaryEmotion, conversationHistory) {
  const textLower = userText.toLowerCase();
  const isFirstMessage = conversationHistory.length === 0;
  
  let message, steps, questions;
  
  if (textLower.includes('anxious') || textLower.includes('anxiety') || textLower.includes('worry')) {
    message = isFirstMessage 
      ? `I can sense the weight of anxiety in your words. It takes real courage to reach out when you're feeling this way. Anxiety can feel overwhelming, like your mind is racing with worries that seem bigger than you can handle. I want you to know that what you're experiencing is valid, and you're not alone in feeling this way.

Can you tell me more about what's been triggering these anxious feelings lately? Sometimes it helps to explore what specific situations or thoughts are feeding the anxiety.`
      : `I'm hearing the anxiety continuing in what you've shared. It sounds like this feeling is really persistent for you right now. That must be exhausting to carry.

What does the anxiety feel like in your body right now? Are you noticing it more in certain situations, or does it feel like it's with you most of the time?`;
    
    steps = [
      "Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, out for 8 - repeat 4 times",
      "Use the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
      "Write down your anxious thoughts on paper to externalize them from your mind",
      "Take a 10-minute walk outside if possible, focusing on your surroundings rather than your thoughts"
    ];
    
    questions = [
      "What time of day do you notice the anxiety feels strongest?",
      "Are there any activities or places where the anxiety feels less intense?"
    ];
  } else if (textLower.includes('sad') || textLower.includes('depression') || textLower.includes('down')) {
    message = isFirstMessage
      ? `I can feel the heaviness in what you've shared with me. Depression and sadness can make everything feel harder, like you're moving through thick fog where even simple things require enormous effort. Your feelings are completely valid, and I want you to know that reaching out like this shows incredible strength, even when you might not feel strong at all.

What has this sadness been like for you? Has it been building up over time, or did something specific happen that intensified these feelings?`
      : `The sadness you're describing sounds really profound. It takes a lot of energy to keep going when you're feeling this way, and I can see that you're doing your best.

How long have you been carrying this feeling? And are there moments, even small ones, where the weight feels a little lighter?`;
    
    steps = [
      "Allow yourself to feel the sadness without judgment - emotions need space to be processed",
      "Try gentle movement like stretching or a slow walk around your living space",
      "Practice one small act of self-care today, even if it feels difficult",
      "Reach out to one person you trust, even if it's just to say hello"
    ];
    
    questions = [
      "What does a typical day look like for you when the sadness feels heaviest?",
      "Is there anything that used to bring you joy that feels out of reach right now?"
    ];
  } else if (textLower.includes('overwhelmed') || textLower.includes('too much')) {
    message = isFirstMessage
      ? `It sounds like you're carrying an enormous load right now. When life feels overwhelming, it's like trying to juggle too many things at once while everything keeps getting added to the pile. That feeling of "too much" is your system's way of saying it needs some relief and support.

I'd love to understand more about what's contributing to feeling so overwhelmed. Is it work, relationships, responsibilities, or maybe a combination of different pressures?`
      : `The sense of being overwhelmed seems to be really weighing on you. It's like your cup is overflowing and there's no room for anything else.

Can you help me understand what feels like the most pressing thing on your mind right now? Sometimes breaking down the overwhelm can help us find where to start.`;
    
    steps = [
      "Make a list of everything on your mind, then categorize: urgent vs. important vs. can wait",
      "Choose just ONE small task to focus on today - ignore the rest for now",
      "Practice saying 'no' to any new requests or commitments this week",
      "Set a timer for 10 minutes of deep breathing or meditation"
    ];
    
    questions = [
      "If you could remove just one thing from your plate right now, what would it be?",
      "What support do you have around you that maybe you haven't been able to access?"
    ];
  } else {
    message = isFirstMessage
      ? `Thank you for sharing what's on your mind with me. I can tell there's something weighing on you, and I want you to know that whatever you're experiencing matters. Sometimes it's hard to put feelings into words, and that's okay too.

I'm here to listen and understand better. Would you feel comfortable sharing more about what brought you here today? What's been on your heart or mind lately?`
      : `I'm continuing to listen and want to understand your experience more deeply. Every feeling and thought you share helps me better support you through whatever you're going through.

What feels most important for you to talk about right now? Is there something specific that's been weighing on your mind?`;
    
    steps = [
      "Take three deep breaths and notice what you're feeling in your body right now",
      "Consider what one small thing might bring you a moment of peace today",
      "Practice gentle self-compassion by speaking to yourself as you would a good friend",
      "Engage in one activity that usually helps you feel grounded or centered"
    ];
    
    questions = [
      "What's one thing that's been on your mind that you haven't been able to share with anyone?",
      "How have you been taking care of yourself lately?"
    ];
  }
  
  return { message, steps, questions };
}

function analyzeEmotionsLocal(text) {
  const textLower = text.toLowerCase();
  let emotions = { neutral: 0.1 };
  
  // Enhanced emotion detection
  if (textLower.match(/anxious|anxiety|worry|worried|nervous|stress|stressed|panic/)) {
    emotions.anxiety = 0.8;
    emotions.fear = 0.3;
  }
  if (textLower.match(/sad|sadness|depressed|depression|down|low|empty|hopeless/)) {
    emotions.sadness = 0.8;
    emotions.grief = 0.2;
  }
  if (textLower.match(/angry|anger|mad|frustrated|furious|annoyed|irritated/)) {
    emotions.anger = 0.7;
    emotions.frustration = 0.4;
  }
  if (textLower.match(/overwhelmed|too much|can't cope|exhausted|burned out/)) {
    emotions.overwhelmed = 0.8;
    emotions.fatigue = 0.4;
  }
  if (textLower.match(/happy|joy|excited|great|wonderful|amazing|good/)) {
    emotions.joy = 0.7;
    emotions.optimism = 0.5;
  }
  if (textLower.match(/confused|lost|uncertain|don't know|unclear/)) {
    emotions.confusion = 0.6;
  }
  if (textLower.match(/lonely|alone|isolated|disconnected/)) {
    emotions.loneliness = 0.7;
  }
  
  return emotions;
}

function assessRiskLevel(text, emotions) {
  const textLower = text.toLowerCase();
  
  if (textLower.match(/suicide|kill myself|end it all|don't want to live|hurt myself/)) {
    return 'CRISIS';
  }
  if (textLower.match(/can't go on|no point|nothing matters|hate myself/)) {
    return 'HIGH';
  }
  if (emotions.sadness > 0.7 || emotions.anxiety > 0.8 || emotions.overwhelmed > 0.7) {
    return 'MODERATE';
  }
  if (emotions.sadness > 0.4 || emotions.anxiety > 0.5) {
    return 'LOW';
  }
  
  return 'SAFE';
}

function generateRichRecommendations(text, emotions) {
  const textLower = text.toLowerCase();
  
  // Rich, contextual recommendations
  const recommendations = {
    activities: [],
    books: [],
    movies: [],
    nutrition: [],
    resources: [],
    quotes: [],
    exercises: []
  };
  
  if (textLower.includes('anxious') || emotions.anxiety > 0.5) {
    recommendations.activities = [
      { name: "4-7-8 Breathing", description: "Inhale 4, hold 7, exhale 8 seconds", duration: "5 minutes", benefit: "Activates calm response" },
      { name: "Progressive Muscle Relaxation", description: "Tense and release each muscle group", duration: "15 minutes", benefit: "Physical anxiety relief" },
      { name: "Mindful Walking", description: "Slow walk focusing on each step", duration: "10 minutes", benefit: "Grounds you in present" }
    ];
    
    recommendations.books = [
      { title: "The Anxiety and Worry Workbook", author: "David A. Clark", description: "Practical CBT techniques" },
      { title: "Dare: The New Way to End Anxiety", author: "Barry McDonagh", description: "Face anxiety with acceptance" },
      { title: "When Panic Attacks", author: "David D. Burns", description: "Drug-free techniques for anxiety" }
    ];
    
    recommendations.movies = [
      { title: "Inside Out", description: "Understanding emotions", mood: "calming", duration: "95 min" },
      { title: "My Neighbor Totoro", description: "Peaceful Studio Ghibli film", mood: "serene", duration: "86 min" },
      { title: "The Secret Garden", description: "Healing through nature", mood: "uplifting", duration: "101 min" }
    ];
    
    recommendations.nutrition = [
      { name: "Chamomile Tea", benefit: "Natural calming effects", timing: "Evening" },
      { name: "Dark Chocolate (70%+)", benefit: "Reduces stress hormones", timing: "Afternoon" },
      { name: "Magnesium-rich foods", benefit: "Muscle relaxation", examples: "Almonds, spinach, avocado" }
    ];
    
    recommendations.quotes = [
      "You are braver than you believe, stronger than you seem, and smarter than you think. - A.A. Milne",
      "Anxiety is the dizziness of freedom. - Søren Kierkegaard",
      "Nothing diminishes anxiety faster than action. - Walter Anderson"
    ];
    
    recommendations.exercises = [
      { name: "Gentle Yoga", description: "Child's pose, cat-cow, legs up wall", duration: "20 minutes" },
      { name: "Tai Chi", description: "Slow, flowing movements", duration: "15 minutes" },
      { name: "Swimming", description: "Rhythmic, meditative exercise", duration: "30 minutes" }
    ];
  }
  
  if (textLower.includes('sad') || emotions.sadness > 0.5) {
    recommendations.activities = [
      { name: "Gratitude Journaling", description: "Write 3 things you're grateful for", duration: "10 minutes", benefit: "Shifts focus to positive" },
      { name: "Creative Expression", description: "Draw, paint, write, or sing", duration: "30 minutes", benefit: "Emotional release" },
      { name: "Nature Connection", description: "Sit outside or by a window", duration: "15 minutes", benefit: "Natural mood boost" }
    ];
    
    recommendations.books = [
      { title: "The Upward Spiral", author: "Alex Korb", description: "Neuroscience of depression recovery" },
      { title: "Feeling Good", author: "David D. Burns", description: "CBT for depression" },
      { title: "The Gifts of Imperfection", author: "Brené Brown", description: "Self-compassion and worth" }
    ];
    
    recommendations.movies = [
      { title: "The Pursuit of Happyness", description: "Hope and resilience", mood: "inspiring", duration: "117 min" },
      { title: "Julie & Julia", description: "Finding passion in daily life", mood: "uplifting", duration: "123 min" },
      { title: "Soul", description: "Finding meaning and purpose", mood: "thoughtful", duration: "100 min" }
    ];
    
    recommendations.quotes = [
      "The wound is the place where the Light enters you. - Rumi",
      "Every storm runs out of rain. - Maya Angelou",
      "You are allowed to be both a masterpiece and a work in progress simultaneously. - Sophia Bush"
    ];
  }
  
  // Always include crisis resources
  recommendations.resources = [
    "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
    "National Suicide Prevention Lifeline: 988",
    "SAMHSA National Helpline: 1-800-662-4357",
    "Mental Health America: mhanational.org",
    "NAMI (National Alliance on Mental Illness): nami.org"
  ];
  
  return recommendations;
}

function getHelpfulResources() {
  return [
    "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
    "National Suicide Prevention Lifeline: 988",
    "SAMHSA National Helpline: 1-800-662-4357",
    "Mental Health America: mhanational.org",
    "Psychology Today Therapist Finder: psychologytoday.com"
  ];
}
