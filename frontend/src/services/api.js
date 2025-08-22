// frontend/src/services/api.js

const API_BASE = "http://127.0.0.1:8000"; // FastAPI backend

export async function analyzeText(text) {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
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
    throw error;
  }
}
