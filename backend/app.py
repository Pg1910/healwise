# backend/app.py
import sys
import os
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI
from pydantic import BaseModel
from backend.models.mental_classifier import score_probs
from safety.assessor import assess_crisis_signals, Risk
from utils.empathy import empathize
from safety.bias import de_stigmatize
from kb.retriever import retrieve
from safety.ladder import ACTIONS
from fastapi.middleware.cors import CORSMiddleware

print(sys.path)
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

@app.post("/analyze", response_model=AnalysisOutput)
def analyze(user_input: UserInput):
    user_text = user_input.text.strip()

    if not user_text:
        return {
            "probs": {},
            "risk": "NONE",
            "supportive_message": "Please enter some text.",
            "suggested_next_steps": [],
            "helpful_resources": []
        }
    # keep a short memory (last 3 turns)
    if not hasattr(analyze, "history"):
        analyze.history = []

    # 1. Get probabilities from classifier
    probs = score_probs(user_text)

    # 2. Risk assessment
    risk = assess_crisis_signals(user_text, probs)

    # 3. Empathy tag
    if risk in (Risk.HIGH, Risk.CRISIS) and probs.get("suicide_prob", 0) > 0.5:
        tag = "suicide_high"
    elif probs.get("anxiety_prob", 0) > 0.6:
        tag = "anxiety_high"
    elif probs.get("depression_prob", 0) > 0.6:
        tag = "depression_high"
    else:
        tag = "neutral"


    # 4. Generate supportive message
    msg = empathize(tag, analyze.history)
    msg = de_stigmatize(msg)

    # 5. Suggested actions
    actions = ACTIONS.get(risk, [])

    # 6. Helpful resources
    resources = retrieve(user_text, k=2)

    return AnalysisOutput(
        probs=probs,
        risk=risk.name if isinstance(risk, Risk) else str(risk),
        supportive_message=msg,
        suggested_next_steps=actions,
        helpful_resources=resources,
    )
    # update conversation history
    analyze.history.append(user_text)
    if len(analyze.history) > 3:
        analyze.history.pop(0)
        
        
@app.get("/health")
def health():
    return {"status": "ok", "message": "HealWise backend running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)