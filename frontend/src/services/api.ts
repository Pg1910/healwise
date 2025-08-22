// src/services/api.ts
export async function analyzeText(text: string) {
  const response = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze text");
  }

  return response.json();
}
