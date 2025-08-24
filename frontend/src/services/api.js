// frontend/src/services/api.js
import { analyzeText as clientAnalyzeText, healthCheck } from './clientAnalysis.js';

// For development, we can still try the local backend, but fallback to client-side
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8000'
  : null; // No external API in production

export async function analyzeText(text) {
  console.log('🔄 Starting analysis...');
  const startTime = Date.now();
  
  // In development, try local backend first
  if (API_BASE_URL) {
    try {
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

      if (res.ok) {
        const data = await res.json();
        const endTime = Date.now();
        console.log(`⏱️ Backend API call took ${endTime - startTime}ms`);
        console.log('✅ Backend analysis complete:', data);
        return data;
      }
    } catch (error) {
      console.log('🔄 Backend unavailable, using client-side analysis:', error.message);
    }
  }
  
  // Use client-side analysis (production mode or fallback)
  const data = clientAnalyzeText(text);
  const endTime = Date.now();
  console.log(`⏱️ Client-side analysis took ${endTime - startTime}ms`);
  console.log('✅ Client-side analysis complete:', data);
  
  return data;
}

// Health check function
export async function getHealth() {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.log('Backend health check failed, using client-side');
    }
  }
  
  return healthCheck();
}
