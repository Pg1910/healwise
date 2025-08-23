# backend/app.py
import sys
import os
import json
import requests

# Ensure repo root is on sys.path when running from backend/
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from pydantic import BaseModel
from backend.models.mental_classifier import score_probs
from safety.assessor import assess_crisis_signals, Risk
from utils.empathy import empathize
from safety.bias import de_stigmatize
from kb.retriever import retrieve
from safety.ladder import ACTIONS, Risk as LadderRisk
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HealWise API", version="1.0")

# Input schema
class UserInput(BaseModel):
    text: str

# Output schema
class AnalysisOutput(BaseModel):
    probs: dict
    risk: str
    supportive_message: str
    suggested_next_steps: list
    helpful_resources: list

# Map assessor.Risk to ladder.Risk for ACTIONS lookup
ASS_TO_LADDER = {
    Risk.SAFE: LadderRisk.SAFE,
    Risk.LOW: LadderRisk.ELEVATED,
    Risk.MODERATE: LadderRisk.ELEVATED,
    Risk.HIGH: LadderRisk.HIGH,
    Risk.CRISIS: LadderRisk.CRISIS,
}

def ladder_actions_for(assessor_risk: Risk) -> list:
    ladder_key = ASS_TO_LADDER.get(assessor_risk, LadderRisk.SAFE)
    return ACTIONS.get(ladder_key, [])

# ---- Ollama / Gemma connector ----
OLLAMA_HOST = "http://127.0.0.1:11434"

def query_gemma(prompt: str, model: str = "gemma2:2b") -> str:
    """
    Query Gemma via Ollama for natural conversational responses.
    Returns the raw response text.
    """
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {"model": model, "prompt": prompt, "stream": False}

    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        raw_response = response.json().get("response", "").strip()
        return raw_response
    except Exception as e:
        print(f"Gemma query failed: {e}")
        return ""  # Return empty string on failure

@app.post("/analyze", response_model=AnalysisOutput)
def analyze_text(user_input: UserInput):
    user_text = user_input.text.strip()
    if not user_text:
        return AnalysisOutput(
            probs={},
            risk="NONE",
            supportive_message="Please enter some text.",
            suggested_next_steps=[],
            helpful_resources=[]
        )

    # keep short memory (last 3 turns)
    if not hasattr(analyze_text, "history"):
        analyze_text.history = []

    # 1. Classifier probabilities
    probs = score_probs(user_text)

    # 2. Risk assessment (fast heuristic)
    risk = assess_crisis_signals(user_text, probs)

    # 3. Build Gemma reasoning prompt for natural, concise responses
    reasoning_prompt = f"""
    You are HealWise, a warm and empathetic mental health companion. 
    
    User just shared: "{user_text}"
    
    Respond as a caring friend would - naturally, briefly, and supportively. Keep your response to 1-2 sentences maximum.
    
    Guidelines:
    - Be warm and understanding, not clinical
    - Acknowledge their feelings first
    - Offer gentle encouragement or perspective
    - Avoid listing steps or resources unless absolutely critical
    - Use conversational language, not formal therapy speak
    
    Example good responses:
    - "That sounds really overwhelming. It's completely normal to feel anxious about big changes."
    - "I hear you, and what you're experiencing makes total sense. You're being really hard on yourself."
    - "Those feelings are so valid. Sometimes our minds can spiral, but you're stronger than you know."
    
    Respond with ONLY your supportive message - no JSON, no formatting, just a natural, caring response.
    """

    gemma_response = query_gemma(reasoning_prompt)
    
    # Extract the natural response (now returns plain text)
    if gemma_response and len(gemma_response.strip()) > 10:
        natural_message = gemma_response.strip()
    else:
        # Fallback if Gemma fails
        natural_message = empathize("neutral", analyze_text.history)
    
    final_message = de_stigmatize(natural_message)

    # Since we're now focusing on natural responses, skip detailed actions/resources for now
    # Users can ask for specific help if needed
    actions = []  # Keep simple for now
    resources = []  # Keep simple for now

    # update conversation history
    analyze_text.history.append(user_text)
    if len(analyze_text.history) > 3:
        analyze_text.history.pop(0)

    return AnalysisOutput(
        probs=probs,
        risk=risk.name if isinstance(risk, Risk) else str(risk),
        supportive_message=final_message,
        suggested_next_steps=actions,
        helpful_resources=resources,
    )

@app.get("/health")
def health():
    return {"status": "ok", "message": "HealWise backend running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all for now (hackathon safe)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pathlib import Path

CONV_FILE = Path("conversations.json")

def load_conversations():
    if CONV_FILE.exists():
        return json.loads(CONV_FILE.read_text())
    return {}

def save_conversations(convs):
    CONV_FILE.write_text(json.dumps(convs, indent=2))

conversations = load_conversations()

@app.post("/analyze/{conversation_id}", response_model=AnalysisOutput)
def analyze_conversation(conversation_id: str, user_input: UserInput):
    user_text = user_input.text.strip()
    if not user_text:
        return AnalysisOutput(
            probs={}, risk="NONE", supportive_message="Please enter some text.",
            suggested_next_steps=[], helpful_resources=[]
        )

    if conversation_id not in conversations:
        conversations[conversation_id] = []

    # Short memory from conversation context
    history = conversations[conversation_id][-3:]

    # Classifier
    probs = score_probs(user_text)
    risk = assess_crisis_signals(user_text, probs)

    # Tag
    if risk in (Risk.HIGH, Risk.CRISIS) and probs.get("suicide_prob", 0) > 0.5:
        tag = "suicide_high"
    elif probs.get("anxiety_prob", 0) > 0.6:
        tag = "anxiety_high"
    elif probs.get("depression_prob", 0) > 0.6:
        tag = "depression_high"
    else:
        tag = "neutral"

    # Message
    msg = empathize(tag, history)
    msg = de_stigmatize(msg)

    actions = ladder_actions_for(risk)
    resources = retrieve(user_text, k=2)

    # Save to history
    conversations[conversation_id].append({"user": user_text, "bot": msg})
    save_conversations(conversations)

    return AnalysisOutput(
        probs=probs,
        risk=risk.name if isinstance(risk, Risk) else str(risk),
        supportive_message=msg,
        suggested_next_steps=actions,
        helpful_resources=resources,
    )
