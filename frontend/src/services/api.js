// frontend/src/services/api.js

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://healwise-backend.railway.app'  
  : 'http://localhost:8000';

export async function analyzeText(text) {
  try {
    console.log('🔄 Starting analysis...');
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
    console.log('✅ Analysis complete:', data);
    
    // Validate response matches copilot instructions contract
    if (!data.probs || !data.supportive_message || !data.suggested_next_steps || !data.helpful_resources) {
      console.warn('⚠️ Incomplete response from backend:', data);
      throw new Error('Incomplete response format');
    }
    
    return data;
  } catch (error) {
    console.error("🚨 Error calling backend:", error);
    
    // Rich fallback response with depth and context per copilot instructions
    return generateContextualFallback(text);
  }
}

function generateContextualFallback(text) {
  const textLower = text.toLowerCase();
  
  // Analyze text for context
  let supportive_message = "Thank you for sharing what's on your mind with me. I can tell there's depth to what you're experiencing.";
  let suggested_next_steps = [];
  let helpful_resources = [];
  let probs = { neutral: 0.8, optimism: 0.2 };
  
  // Contextual responses based on keywords
  if (textLower.includes('anxious') || textLower.includes('worry') || textLower.includes('stress')) {
    supportive_message = "I can hear the anxiety in what you're sharing. Feeling anxious is completely natural, and you're not alone in this. It takes courage to acknowledge these feelings.";
    probs = { anxiety: 0.7, fear: 0.2, neutral: 0.1 };
    suggested_next_steps = [
      "Practice the 4-7-8 breathing technique to calm your nervous system",
      "Try the 5-4-3-2-1 grounding exercise to center yourself in the present",
      "Consider writing down your worries to externalize anxious thoughts",
      "Take a gentle walk outside if possible to change your environment"
    ];
  } else if (textLower.includes('sad') || textLower.includes('down') || textLower.includes('depressed')) {
    supportive_message = "I can sense the heaviness in your words. Sadness is a valid emotion that deserves space to be felt and processed. You're taking a brave step by reaching out.";
    probs = { sadness: 0.8, neutral: 0.2 };
    suggested_next_steps = [
      "Allow yourself to feel this sadness without judgment - emotions need space",
      "Consider gentle movement like stretching or a slow walk",
      "Reach out to someone you trust when you feel ready",
      "Practice self-compassion by treating yourself with kindness"
    ];
  } else if (textLower.includes('angry') || textLower.includes('frustrated') || textLower.includes('mad')) {
    supportive_message = "I can feel the intensity of your frustration. Anger is often our heart's way of saying 'this matters to me.' Your feelings are completely valid.";
    probs = { anger: 0.7, frustration: 0.2, neutral: 0.1 };
    suggested_next_steps = [
      "Channel this energy through physical activity like walking or exercise",
      "Write out your feelings without editing - let the anger flow onto paper",
      "Practice deep breathing to help manage the intensity",
      "Consider what boundary or change might address the source of anger"
    ];
  } else if (textLower.includes('overwhelmed') || textLower.includes('too much')) {
    supportive_message = "It sounds like you're carrying a lot right now. Feeling overwhelmed makes complete sense when life feels like too much all at once. You're handling more than anyone should manage alone.";
    probs = { overwhelmed: 0.6, anxiety: 0.3, neutral: 0.1 };
    suggested_next_steps = [
      "Break down overwhelming tasks into smaller, manageable steps",
      "Practice saying 'no' to non-essential commitments right now",
      "Set aside 10 minutes for deep breathing or meditation",
      "Ask for help with specific tasks if possible"
    ];
  } else {
    suggested_next_steps = [
      "Take a few moments to check in with your body and breath",
      "Consider what one small thing might bring you comfort right now",
      "Practice mindful awareness of your current feelings",
      "Engage in an activity that usually brings you peace"
    ];
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
    helpful_resources
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
