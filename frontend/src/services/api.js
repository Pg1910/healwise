// frontend/src/services/api.js

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://healwise-backend.railway.app'  // Will update after backend deployment
  : 'http://127.0.0.1:8000';  // Local FastAPI backend

export async function analyzeText(text) {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error calling backend:", error);
    // Fallback for demo when backend is down
    return {
      probs: { 
        neutral: 0.7, 
        optimism: 0.2, 
        curiosity: 0.1 
      },
      risk: 'SAFE',
      supportive_message: 'Thank you for sharing. I\'m here to listen and support you.',
      suggested_next_steps: [
        'Take a few deep breaths',
        'Consider writing in a journal',
        'Try a short walk outside'
      ],
      helpful_resources: [
        'Crisis Text Line: Text HOME to 741741',
        'National Suicide Prevention Lifeline: 988'
      ]
    };
  }
}
