"""
HealWise FastAPI backend with enhanced recommendations
Per copilot-instructions.md: app.py mutates sys.path to import safety, kb, utils from repo root
Data flow: emotions via score_probs → risk via assess_crisis_signals → ACTIONS[risk] → de_stigmatize
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import asyncio
from contextlib import asynccontextmanager

# Global variables for faster access
mental_classifier = None
recommendation_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - load model once
    global mental_classifier, recommendation_engine
    print("🚀 Initializing HealWise recommendation services...")
    try:
        from models.mental_classifier import MentalClassifier
        from services.content_loader import ContentLoader
        from services.recommendation_engine import RecommendationEngine
        
        mental_classifier = MentalClassifier()
        content_loader = ContentLoader()
        recommendation_engine = RecommendationEngine(content_loader)
        print("✅ Recommendation services initialized successfully")
    except Exception as e:
        print(f"⚠️ Model loading failed: {e}")
        mental_classifier = None
        recommendation_engine = None
    
    yield
    
    # Shutdown
    print("🔄 Shutting down HealWise...")

app = FastAPI(
    title="HealWise API",
    description="AI-powered mental health support",
    version="1.0.0",
    lifespan=lifespan
)

# Add custom middleware to handle OPTIONS requests BEFORE CORS
@app.middleware("http")
async def cors_handler(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content={"message": "OK"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    response = await call_next(request)
    return response

# CORS configuration per copilot instructions - allows http://localhost:5173 (Vite default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for maximum compatibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    probs: dict
    risk: str
    supportive_message: str
    suggested_next_steps: list
    helpful_resources: list
    recommendations: dict  # New field for comprehensive recommendations

@app.get("/health")
async def health_check():
    """Health check endpoint per copilot instructions"""
    return {
        "status": "healthy",
        "model_loaded": mental_classifier is not None,
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Analyze text for emotions and mental health risk.
    Contract per copilot instructions: { text } -> { probs, risk, supportive_message, suggested_next_steps, helpful_resources }
    Data flow: emotions via score_probs → risk via assess_crisis_signals → ACTIONS[risk] → de_stigmatize
    """
    try:
        # Add timeout for the entire analysis (15s per optimization)
        return await asyncio.wait_for(
            _analyze_with_timeout(request.text),
            timeout=15.0
        )
    except asyncio.TimeoutError:
        print(f"⚠️ Analysis timeout for text: {request.text[:50]}...")
        # Return fallback response matching exact contract
        return _get_fallback_response()
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return _get_fallback_response()

async def _analyze_with_timeout(text: str) -> AnalyzeResponse:
    """
    Internal analysis function following copilot instructions data flow:
    1. emotions via score_probs 
    2. risk via assess_crisis_signals (may call Ollama)
    3. empathy tag 
    4. de_stigmatize 
    5. ACTIONS[risk]
    6. kb.retrieve(k=2) - currently unused
    """
    
    # Clean text to handle Unicode issues
    try:
        # Remove problematic characters and normalize text
        text = text.encode('utf-8', errors='ignore').decode('utf-8')
        text = text.replace('\x8f', '').replace('\x9f', '')  # Remove specific problematic bytes
        text = ''.join(char for char in text if char.isprintable())
    except Exception as e:
        print(f"⚠️ Text cleaning failed: {e}")
        # Fallback to basic cleaning
        text = ''.join(char for char in text if char.isprintable())
    
    # Step 1: Emotions via score_probs (per copilot instructions)
    try:
        if mental_classifier:
            probs = await asyncio.to_thread(mental_classifier.score_probs, text, top_k=5)
        else:
            print("⚠️ Using fallback emotions - model not loaded")
            probs = {"neutral": 0.7, "optimism": 0.2, "curiosity": 0.1}
    except Exception as e:
        print(f"⚠️ Emotion analysis failed: {e}")
        probs = {"neutral": 0.7, "optimism": 0.2, "curiosity": 0.1}
    
    # Step 2: Risk via assess_crisis_signals (may call Ollama per copilot instructions)
    try:
        from safety.assessor import assess_crisis_signals
        risk_result = await asyncio.wait_for(
            asyncio.to_thread(assess_crisis_signals, text, probs),
            timeout=10.0
        )
        # Convert Risk enum to string per copilot instructions contract
        risk = risk_result.value if hasattr(risk_result, 'value') else str(risk_result)
    except (asyncio.TimeoutError, Exception) as e:
        print(f"⚠️ Risk assessment failed/timeout: {e}")
        risk = "SAFE"  # Fallback to SAFE per copilot instructions
    
    # Step 3: Empathy tag + de_stigmatize (per copilot instructions)
    supportive_message = _generate_supportive_message(text, probs, risk)
    try:
        from safety.bias import de_stigmatize
        supportive_message = de_stigmatize(supportive_message)
    except Exception:
        pass  # Optional step per copilot instructions
    
    # Step 4: ACTIONS[risk] from ladder per copilot instructions
    try:
        from safety.ladder import get_actions_for_risk, get_supportive_resources
        suggested_next_steps = get_actions_for_risk(risk)
        helpful_resources = get_supportive_resources()
    except Exception as e:
        print(f"⚠️ Resource generation failed: {e}")
        # Rich fallback suggestions based on emotion and risk
        suggested_next_steps = _get_contextual_suggestions(text, probs, risk)
        helpful_resources = _get_contextual_resources(risk)
    
    # Step 5: Generate comprehensive recommendations using RecommendationEngine
    try:
        if recommendation_engine:
            print(f"📋 Generating recommendations for risk={risk}, emotions={list(probs.keys())[:3]}")
            comprehensive_recommendations = recommendation_engine.get_personalized_recommendations(risk, probs)
            print(f"✅ Generated {len(comprehensive_recommendations)} recommendation categories")
        else:
            print("⚠️ RecommendationEngine not available, using fallback")
            comprehensive_recommendations = _get_fallback_recommendations(risk, probs)
    except Exception as e:
        print(f"⚠️ Recommendation generation failed: {e}")
        import traceback
        traceback.print_exc()
        comprehensive_recommendations = _get_fallback_recommendations(risk, probs)
    
    # Step 6: kb.retrieve(k=2) - currently unused per copilot instructions
    # Note: copilot instructions mention kb retrieval but it's not implemented in current flow
    
    return AnalyzeResponse(
        probs=probs,
        risk=risk,
        supportive_message=supportive_message,
        suggested_next_steps=suggested_next_steps[:4],  # Limit for UI
        helpful_resources=helpful_resources[:3],  # Limit for UI
        recommendations=comprehensive_recommendations
    )

def _generate_supportive_message(text: str, probs: dict, risk: str) -> str:
    """Generate contextual, thoughtful supportive message with empathy per copilot instructions"""
    top_emotion = max(probs.keys(), key=lambda k: probs[k]) if probs else "neutral"
    text_lower = text.lower()
    
    # More thoughtful, personalized messages based on the copilot instructions empathy tag
    if "anxious" in text_lower or "worried" in text_lower or top_emotion == "anxiety":
        return "I can really hear the anxiety in what you're sharing, and I want you to know that feeling anxious is completely natural - especially when you're dealing with something that feels overwhelming. Your mind is trying to protect you by thinking through all the possibilities, but I know that can feel exhausting. You're not alone in this feeling, and it's okay to take things one moment at a time."
    
    elif "sad" in text_lower or "depressed" in text_lower or top_emotion == "sadness":
        return "I can sense the heaviness in your words, and I want to acknowledge how difficult it must be to feel this way right now. Sadness can feel like it's taking up so much space, and that's valid - your feelings deserve to be honored. It takes real courage to share something this personal, and I'm grateful you trusted me with these feelings."
    
    elif "angry" in text_lower or "frustrated" in text_lower or top_emotion == "anger":
        return "I can feel the intensity of your frustration, and anger is such a valid response when things feel unfair or out of control. Sometimes anger is our heart's way of saying 'this matters to me' or 'this isn't okay.' It's completely natural to feel this way, and expressing it here shows real self-awareness."
    
    elif "stressed" in text_lower or "overwhelmed" in text_lower:
        return "It sounds like you're carrying a lot right now, and feeling overwhelmed makes complete sense when life feels like too much all at once. Sometimes our minds and bodies need us to slow down and breathe, even when everything feels urgent. You're handling more than anyone should have to manage alone."
    
    else:
        return "Thank you for sharing what's on your mind and heart with me. I can tell there's depth to what you're experiencing, and I want you to know that whatever you're feeling right now is completely valid. Sometimes just putting our thoughts into words can be the first step toward understanding ourselves better."

def _get_contextual_suggestions(text: str, probs: dict, risk: str) -> list:
    """Generate contextual suggestions based on emotions and risk level"""
    top_emotion = max(probs.keys(), key=lambda k: probs[k]) if probs else "neutral"
    text_lower = text.lower()
    
    suggestions = []
    
    # Emotion-based suggestions
    if "anxious" in text_lower or top_emotion == "anxiety":
        suggestions.extend([
            "Practice the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8",
            "Try the 5-4-3-2-1 grounding technique: notice 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste",
            "Consider writing down your worries to externalize anxious thoughts"
        ])
    elif "sad" in text_lower or top_emotion == "sadness":
        suggestions.extend([
            "Allow yourself to feel this sadness without judgment - emotions need space to be processed",
            "Consider gentle movement like a slow walk or stretching to support your mood",
            "Reach out to someone you trust when you feel ready to share"
        ])
    else:
        suggestions.extend([
            "Take a few moments to check in with your body and breath",
            "Consider what one small thing might bring you comfort right now",
            "Practice self-compassion by speaking to yourself as you would a good friend"
        ])
    
    return suggestions

def _get_contextual_resources(risk: str) -> list:
    """Get contextual resources based on risk level"""
    if risk in ["HIGH", "CRISIS"]:
        return [
            "National Suicide Prevention Lifeline: 988 (available 24/7)",
            "Crisis Text Line: Text HOME to 741741",
            "Emergency Services: 911 if you're in immediate danger"
        ]
    else:
        return [
            "Mental Health America resources: mhanational.org",
            "Crisis Text Line: Text HOME to 741741 (always available)",
            "7 Cups free emotional support: 7cups.com"
        ]

def _get_fallback_recommendations(risk: str, probs: dict) -> dict:
    """Generate fallback recommendations when RecommendationEngine is unavailable"""
    return {
        "quotes": [
            "Every moment is a fresh beginning.",
            "You are stronger than you know.",
            "This too shall pass."
        ],
        "movies": [
            "Paddington - A heartwarming family film",
            "The Grand Budapest Hotel - Whimsical and uplifting",
            "Studio Ghibli films - Peaceful and healing"
        ],
        "books": [
            "The Book of Joy by Dalai Lama",
            "Mindfulness for Beginners by Jon Kabat-Zinn",
            "The Gifts of Imperfection by Brené Brown"
        ],
        "exercises": [
            "5-minute breathing exercise",
            "Gentle stretching routine",
            "Short mindful walk"
        ],
        "nutrition": [
            "Herbal tea (chamomile, lavender)",
            "Dark leafy greens for magnesium",
            "Omega-3 rich foods (walnuts, salmon)"
        ],
        "activities": [
            "Listen to calming music",
            "Practice gratitude journaling",
            "Try a creative hobby"
        ],
        "resources": [
            "Crisis Text Line: Text HOME to 741741",
            "National Suicide Prevention Lifeline: 988",
            "Mental Health America: mhanational.org"
        ]
    }

def _get_fallback_response() -> AnalyzeResponse:
    """Fallback response when analysis fails"""
    fallback_recommendations = _get_fallback_recommendations("SAFE", {"neutral": 0.8})
    
    return AnalyzeResponse(
        probs={"neutral": 0.8, "optimism": 0.2},
        risk="SAFE",
        supportive_message="Thank you for sharing. I'm here to support you.",
        suggested_next_steps=[
            "Take a moment to breathe deeply",
            "Consider journaling your thoughts",
            "Try a short walk outside"
        ],
        helpful_resources=[
            "Crisis Text Line: Text HOME to 741741",
            "National Suicide Prevention Lifeline: 988"
        ],
        recommendations=fallback_recommendations
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
