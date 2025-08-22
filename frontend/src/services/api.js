export async function analyzeText(text) {
  const res = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Backend error");
  return res.json(); // { probs, risk, supportive_message, suggested_next_steps, helpful_resources }
}

export async function health() {
  try {
    const r = await fetch("http://127.0.0.1:8000/health");
    return r.ok;
  } catch {
    return false;
  }
}
