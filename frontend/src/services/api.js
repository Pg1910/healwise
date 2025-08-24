// frontend/src/services/api.js
import { analyzeWithMistral } from './enhancedAnalysis.js';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://healwise-backend.railway.app'  
  : 'http://localhost:8000';

export async function analyzeText(text, conversationHistory = []) {
  try {
    console.log('🔄 Starting enhanced analysis...');
    
    // Try enhanced analysis with Mistral first
    const enhancedResult = await analyzeWithMistral(text, conversationHistory);
    if (enhancedResult) {
      console.log('✅ Enhanced analysis complete:', enhancedResult);
      return enhancedResult;
    }
    
    // Fallback to original backend if enhanced fails
    const startTime = Date.now();
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ text }),
    });

    const endTime = Date.now();
    console.log(`⏱️ API call took ${endTime - startTime}ms`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('✅ Backend analysis complete:', data);
    
    // Validate response matches copilot instructions contract
    if (!data.probs || !data.supportive_message || !data.suggested_next_steps || !data.helpful_resources) {
      console.warn('⚠️ Incomplete response from backend:', data);
      throw new Error('Incomplete response format');
    }
    
    return data;
  } catch (error) {
    console.error("🚨 All analysis methods failed, using basic fallback:", error.message);
    
    // Basic fallback response
    return generateContextualFallback(text);
  }
}

function generateContextualFallback(text) {
  const textLower = text.toLowerCase();
  
  // Analyze text for context
  let supportive_message = "Thank you for sharing what's on your mind with me. I can tell there's depth to what you're experiencing. (Note: Running in offline mode)";
  let suggested_next_steps = [];
  let helpful_resources = [];
  let probs = { neutral: 0.8, optimism: 0.2 };
  let recommendations = {
    activities: [],
    books: [],
    movies: [],
    nutrition: [],
    resources: []
  };
  
  // Contextual responses based on keywords
  if (textLower.includes('anxious') || textLower.includes('worry') || textLower.includes('stress')) {
    supportive_message = "I can hear the anxiety in what you're sharing. Feeling anxious is completely natural, and you're not alone in this. It takes courage to acknowledge these feelings. (Running in offline mode)";
    probs = { anxiety: 0.7, fear: 0.2, neutral: 0.1 };
    suggested_next_steps = [
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
  } else if (textLower.includes('sad') || textLower.includes('down') || textLower.includes('depressed')) {
    supportive_message = "I can sense the heaviness in your words. Sadness is a valid emotion that deserves space to be felt and processed. You're taking a brave step by reaching out. (Running in offline mode)";
    probs = { sadness: 0.8, neutral: 0.2 };
    suggested_next_steps = [
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
  } else if (textLower.includes('angry') || textLower.includes('frustrated') || textLower.includes('mad')) {
    supportive_message = "I can feel the intensity of your frustration. Anger is often our heart's way of saying 'this matters to me.' Your feelings are completely valid. (Running in offline mode)";
    probs = { anger: 0.7, frustration: 0.2, neutral: 0.1 };
    suggested_next_steps = [
      "Channel this energy through physical activity like walking or exercise",
      "Write out your feelings without editing - let the anger flow onto paper",
      "Practice deep breathing to help manage the intensity",
      "Consider what boundary or change might address the source of anger"
    ];
    recommendations = {
      activities: [
        { name: "Physical Exercise", description: "Channel energy positively", duration: "20 minutes" },
        { name: "Anger Journaling", description: "Write freely without editing", duration: "10 minutes" }
      ],
      books: [
        { title: "The Dance of Anger", author: "Harriet Lerner" },
        { title: "Anger: Wisdom for Cooling the Flames", author: "Thich Nhat Hanh" }
      ],
      movies: [
        { title: "Inside Out", description: "Understanding emotions", mood: "educational" }
      ],
      nutrition: [
        { name: "Green Tea", benefit: "Calming properties" },
        { name: "Complex Carbohydrates", benefit: "Mood stabilization" }
      ],
      resources: []
    };
  } else if (textLower.includes('overwhelmed') || textLower.includes('too much')) {
    supportive_message = "It sounds like you're carrying a lot right now. Feeling overwhelmed makes complete sense when life feels like too much all at once. You're handling more than anyone should manage alone. (Running in offline mode)";
    probs = { overwhelmed: 0.6, anxiety: 0.3, neutral: 0.1 };
    suggested_next_steps = [
      "Break down overwhelming tasks into smaller, manageable steps",
      "Practice saying 'no' to non-essential commitments right now",
      "Set aside 10 minutes for deep breathing or meditation",
      "Ask for help with specific tasks if possible"
    ];
    recommendations = {
      activities: [
        { name: "Task Breakdown", description: "Make a manageable to-do list", duration: "10 minutes" },
        { name: "Meditation", description: "Simple breathing meditation", duration: "10 minutes" }
      ],
      books: [
        { title: "Getting Things Done", author: "David Allen" },
        { title: "The Power of Now", author: "Eckhart Tolle" }
      ],
      movies: [
        { title: "Julie & Julia", description: "Taking things one step at a time", mood: "inspiring" }
      ],
      nutrition: [
        { name: "Herbal Tea", benefit: "Calming ritual" },
        { name: "Balanced Meals", benefit: "Sustained energy" }
      ],
      resources: []
    };
  } else {
    suggested_next_steps = [
      "Take a few moments to check in with your body and breath",
      "Consider what one small thing might bring you comfort right now",
      "Practice mindful awareness of your current feelings",
      "Engage in an activity that usually brings you peace"
    ];
    recommendations = {
      activities: [
        { name: "Mindful Check-in", description: "Body and breath awareness", duration: "5 minutes" },
        { name: "Comfort Activity", description: "Something that brings you peace", duration: "15 minutes" }
      ],
      books: [
        { title: "The Gifts of Imperfection", author: "Brené Brown" }
      ],
      movies: [
        { title: "Studio Ghibli Films", description: "Peaceful and calming", mood: "serene" }
      ],
      nutrition: [
        { name: "Mindful Eating", benefit: "Present moment awareness" }
      ],
      resources: []
    };
  }
  
  // Always include supportive resources per copilot instructions contract
  helpful_resources = [
    "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
    "National Suicide Prevention Lifeline: 988",
    "Mental Health America resources: mhanational.org"
  ];
  
  return {
    probs,
    risk: 'SAFE',
    supportive_message,
    suggested_next_steps,
    helpful_resources,
    recommendations
  };
}

// In your main app component, ensure you're properly setting the response data
const handleSubmit = async (message) => {
  try {
    const response = await analyzeText(message);
    
    // Make sure all the data is being set
    setSupportiveMessage(response.supportive_message);
    setSuggestedNextSteps(response.suggested_next_steps || []);
    setHelpfulResources(response.helpful_resources || []);
    setEmotionProbs(response.probs || {});
    
    // Force re-render of suggestion tabs
    setIsAnalyzing(false);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
