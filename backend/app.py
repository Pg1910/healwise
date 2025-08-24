"""
HealWise FastAPI backend with enhanced recommendations
Per copilot-instructions.md: app.py mutates sys.path to import safety, kb, utils from repo root
"""

import sys
import os
from pathlib import Path

# Follow HealWise convention: app.py mutates sys.path per copilot-instructions.md
repo_root = Path(__file__).parent.parent.absolute()
backend_path = Path(__file__).parent.absolute()

for path in [str(repo_root), str(backend_path)]:
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Any
import importlib

# Import using module path per copilot-instructions.md
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Any
import importlib

# Import using module path per copilot-instructions.md
mental_classifier = importlib.import_module('models.mental_classifier')

# Import safety, kb, utils from repo root per copilot-instructions.md
from safety.assessor import assess_crisis_signals, Risk
from safety.ladder import ACTIONS, get_random_suggestions
from safety.bias import de_stigmatize
from kb.retriever import retrieve

# Import enhanced recommendation services
from services.content_loader import ContentLoader
from services.recommendation_engine import RecommendationEngine

app = FastAPI(title="HealWise API", version="1.0.0")

# Initialize services at module level per HealWise conventions
print("🚀 Initializing HealWise recommendation services...")
try:
    content_loader = ContentLoader()
    recommendation_engine = RecommendationEngine(content_loader)
    print("✅ Recommendation services initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize recommendation services: {e}")
    # Fallback services for graceful degradation
    content_loader = None
    recommendation_engine = None

# CORS per copilot-instructions.md: allows http://localhost:5173 (Vite default) and 5174
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="User input text for analysis")

class AnalyzeResponse(BaseModel):
    probs: Dict[str, float]
    risk: str
    supportive_message: str
    suggested_next_steps: List[str]
    helpful_resources: List[str]
    recommendations: Dict[str, Any]

def generate_supportive_message(text: str, risk: Risk, probs: Dict[str, float]) -> str:
    """Generate comprehensive therapeutic supportive message"""
    # Get top 3 emotions for detailed analysis
    top_emotions = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:3]
    primary_emotion = top_emotions[0][0] if top_emotions else "neutral"
    emotion_analysis = ", ".join([f"{emotion} ({prob:.1%})" for emotion, prob in top_emotions])
    
    # Analyze text for specific concerns
    concerns = []
    if any(word in text.lower() for word in ["work", "job", "interview", "career"]):
        concerns.append("career challenges")
    if any(word in text.lower() for word in ["relationship", "family", "friend", "alone"]):
        concerns.append("interpersonal dynamics")
    if any(word in text.lower() for word in ["anxious", "worry", "stress", "nervous"]):
        concerns.append("anxiety patterns")
    if any(word in text.lower() for word in ["sad", "depressed", "hopeless", "down"]):
        concerns.append("mood concerns")
    
    concern_text = f" around {' and '.join(concerns)}" if concerns else ""
    
    # Generate contextual responses based on risk level
    if risk == Risk.CRISIS:
        message = f"I'm deeply concerned about you right now. I can see you're experiencing intense {primary_emotion} and possibly other overwhelming emotions. What you're going through{concern_text} is incredibly difficult, and I want you to know that you're not alone in this moment. Your life has value, and there are people who care about you. Please reach out for immediate support - you deserve help and there is hope, even when it feels impossible to see."
    
    elif risk == Risk.HIGH:
        message = f"I can hear how much pain you're experiencing right now. The {primary_emotion} you're feeling{concern_text} is valid and understandable given what you're going through. These intense emotions can feel overwhelming, but they are temporary, even though they don't feel that way right now. You've survived difficult times before, and while this feels different or harder, you have more strength than you realize. Please consider reaching out to someone you trust or a mental health professional who can provide additional support during this challenging time."
    
    elif risk == Risk.MODERATE:
        message = f"It sounds like you're navigating some challenging emotions right now, particularly {primary_emotion}{concern_text}. What you're experiencing is a normal human response to difficult circumstances, and acknowledging these feelings shows self-awareness and courage. While this period feels difficult, remember that emotions are temporary and changeable. You have coping strategies and support systems available to you. Consider this an opportunity to practice self-compassion and perhaps explore what these feelings might be telling you about what you need right now."
    
    elif risk == Risk.LOW:
        message = f"I appreciate you sharing what you're experiencing. Feeling {primary_emotion}{concern_text} is a natural part of the human experience, and recognizing these emotions shows emotional intelligence. You seem to have good awareness of your internal state, which is a strength. These feelings, while uncomfortable, often provide valuable information about our needs and circumstances. This could be a good time to practice some self-care strategies or reflect on what might help you feel more balanced."
    
    else:  # SAFE
        message = f"Thank you for sharing your experience. I notice you're experiencing {primary_emotion}{concern_text}, and it's wonderful that you're in touch with your emotional landscape. This level of self-awareness is a real asset for your mental well-being. You seem to be in a good space to explore these feelings with curiosity rather than judgment. Consider this an opportunity to build on your existing emotional resilience and perhaps try some new wellness practices that interest you."
    
    # Add emotion validation
    message += f"\n\nYour current emotional experience includes {emotion_analysis}. All emotions serve a purpose and provide information about our inner world and needs."
    
    return de_stigmatize(message)

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Enhanced analyze endpoint with diverse therapeutic recommendations
    Per copilot-instructions.md: emotions → risk → therapeutic response → actions → resources
    """
    try:
        text = request.text.strip()
        
        # 1) Emotions via score_probs (SamLowe/roberta-base-go_emotions)
        try:
            probs = mental_classifier.score_probs(text, top_k=5)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Mental classifier error: {str(e)}")
        
        # 2) Risk assessment (may call Ollama per copilot-instructions.md)
        risk = assess_crisis_signals(text, probs)
        risk_str = risk.value if hasattr(risk, 'value') else str(risk)
        
        # 3) Generate supportive message
        supportive_message = generate_supportive_message(text, risk, probs)
        
        # 4) Get shortened suggested actions from ACTIONS per copilot-instructions.md
        suggested_next_steps = get_random_suggestions(risk_str, count=3)
        
        # 5) Get diverse therapeutic recommendations
        recommendations = {}
        if recommendation_engine:
            try:
                recommendations = recommendation_engine.get_personalized_recommendations(
                    risk_level=risk_str.lower(),  # Ensure lowercase per JSON structure
                    emotions=probs
                )
                print(f"Debug: Calling recommendation engine with risk_level='{risk_str.lower()}', emotions={list(probs.keys())[:3]}")
                print(f"Debug: Generated {sum(len(v) for v in recommendations.values())} total recommendation items")
            except Exception as e:
                print(f"Warning: Recommendation engine error: {e}")
                import traceback
                traceback.print_exc()
                # Fallback to empty recommendations
                recommendations = {
                    "quotes": [],
                    "movies": [], 
                    "books": [],
                    "exercises": [],
                    "nutrition": [],
                    "activities": [],
                    "resources": []
                }
        else:
            # Fallback when services not initialized
            recommendations = {
                "quotes": ["You are stronger than you think."],
                "movies": [],
                "books": [],
                "exercises": [],
                "nutrition": [],
                "activities": [],
                "resources": []
            }
        
        # 6) Retrieve helpful resources from kb per copilot-instructions.md
        try:
            helpful_resources = retrieve(text, k=2)
        except Exception:
            # Per copilot-instructions.md: kb assumes .md files present, handle gracefully
            helpful_resources = ["Professional mental health resources available 24/7"]
        
        # Ensure crisis resources for high-risk cases per safety protocols
        if risk in [Risk.HIGH, Risk.CRISIS]:
            if not any("988" in resource or "crisis" in resource.lower() for resource in helpful_resources):
                helpful_resources.insert(0, "Crisis Support: Call 988 or text HOME to 741741")
        
        return AnalyzeResponse(
            probs=probs,
            risk=risk_str,
            supportive_message=supportive_message,
            suggested_next_steps=suggested_next_steps,
            helpful_resources=helpful_resources[:3],
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.options("/analyze")
async def analyze_options():
    """Handle CORS preflight for /analyze endpoint per copilot-instructions.md"""
    return {"message": "OK"}

@app.get("/health")
async def health():
    """Health check endpoint per copilot-instructions.md"""
    service_status = {
        "status": "healthy", 
        "service": "HealWise API",
        "recommendations_enabled": recommendation_engine is not None
    }
    
    if content_loader:
        service_status["data_loaded"] = {
            "quotes": len(content_loader.quotes),
            "movies": len(content_loader.movies),
            "books": len(content_loader.books),
            "exercises": len(content_loader.exercises),
            "nutrition": len(content_loader.nutrition),
            "activities": len(content_loader.activities),
            "resources": len(content_loader.resources)
        }
    
    return service_status

@app.get("/test-recommendations")
async def test_recommendations():
    """Test endpoint to verify recommendation system (temporary)"""
    if not recommendation_engine:
        return {"status": "error", "message": "Recommendation engine not initialized"}
    
    try:
        test_emotions = {"nervousness": 0.8, "fear": 0.3}
        recommendations = recommendation_engine.get_personalized_recommendations(
            risk_level="low",
            emotions=test_emotions
        )
        
        return {
            "status": "success",
            "test_input": {"risk": "low", "emotions": test_emotions},
            "recommendations": recommendations,
            "total_items": sum(len(v) for v in recommendations.values())
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Per copilot-instructions.md: dead code (history unused) 
analyze.history = []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
