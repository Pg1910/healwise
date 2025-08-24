"""
HealWise FastAPI backend with enhanced therapy session management
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
from datetime import datetime
from typing import Optional

# Global variables for faster access
mental_classifier = None
recommendation_engine = None
session_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - load model once
    global mental_classifier, recommendation_engine, session_manager
    print("🚀 Initializing HealWise recommendation services...")
    try:
        from models.mental_classifier import MentalClassifier
        from services.content_loader import ContentLoader
        from services.recommendation_engine import RecommendationEngine
        from services.therapy_session import session_manager as sm
        
        mental_classifier = MentalClassifier()
        content_loader = ContentLoader()
        recommendation_engine = RecommendationEngine(content_loader)
        session_manager = sm
        print("✅ Recommendation services initialized successfully")
    except Exception as e:
        print(f"⚠️ Model loading failed: {e}")
        mental_classifier = None
        recommendation_engine = None
        session_manager = None
    
    yield
    
    # Shutdown
    print("🔄 Shutting down HealWise...")

app = FastAPI(
    title="HealWise API",
    description="AI-powered mental health support with therapy sessions",
    version="2.0.0",
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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str
    conversation_history: list = []
    session_id: Optional[str] = None
    user_profile: dict = {}

class AnalyzeResponse(BaseModel):
    probs: dict
    risk: str
    supportive_message: str
    suggested_next_steps: list
    helpful_resources: list
    recommendations: dict
    conversation_stage: str
    suggestion_mode: bool = False
    suggestion_types: list = []
    session_insights: dict = {}

@app.get("/")
async def root():
    return {"message": "HealWise Therapy API is running", "version": "2.0.0"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Enhanced analysis with therapy session context
    """
    try:
        return await asyncio.wait_for(
            _analyze_with_timeout(request),
            timeout=15.0
        )
    except asyncio.TimeoutError:
        print(f"⚠️ Analysis timeout for text: {request.text[:50]}...")
        return _get_fallback_response()
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return _get_fallback_response()

async def _analyze_with_timeout(request: AnalyzeRequest) -> AnalyzeResponse:
    """Enhanced analysis with therapy session context and personalization"""
    try:
        # Step 1: Get or create therapy session
        if session_manager:
            session = session_manager.get_or_create_session(request.session_id)
        else:
            # Fallback session
            from services.therapy_session import TherapySession
            session = TherapySession()
        
        # Step 2: Clean and prepare text
        text = request.text.strip()
        if not text:
            raise ValueError("Empty text provided")
        
        # Step 3: Add current message to conversation history
        user_message = {
            "type": "user", 
            "text": text,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history = request.conversation_history + [user_message]
        
        # Step 4: Emotion analysis
        try:
            if mental_classifier:
                probs = await asyncio.to_thread(mental_classifier.score_probs, text, top_k=5)
            else:
                print("⚠️ Using fallback emotions - model not loaded")
                probs = {"neutral": 0.7, "optimism": 0.2, "curiosity": 0.1}
        except Exception as e:
            print(f"⚠️ Emotion analysis failed: {e}")
            probs = {"neutral": 0.7, "optimism": 0.2, "curiosity": 0.1}
        
        # Step 5: Risk assessment
        try:
            from safety.assessor import assess_crisis_signals
            risk_result = await asyncio.wait_for(
                asyncio.to_thread(assess_crisis_signals, text, probs),
                timeout=10.0
            )
            risk = risk_result.value if hasattr(risk_result, 'value') else str(risk_result)
        except Exception as e:
            print(f"⚠️ Risk assessment failed: {e}")
            risk = "SAFE"
        
        # Step 6: Generate personalized therapeutic response
        try:
            supportive_message, suggestion_mode, suggestion_types = session.generate_personalized_response(
                text, probs, risk, conversation_history
            )
        except Exception as e:
            print(f"⚠️ Personalized response failed: {e}")
            supportive_message = _generate_fallback_message(text, probs, risk)
            suggestion_mode = False
            suggestion_types = []
        
        # Step 7: Bias mitigation
        try:
            from safety.bias import de_stigmatize
            supportive_message = de_stigmatize(supportive_message)
        except Exception as e:
            print(f"⚠️ Bias mitigation failed: {e}")
        
        # Step 8: Get contextual actions and resources (only if not in suggestion mode)
        if not suggestion_mode:
            try:
                from safety.ladder import get_actions_for_risk, get_supportive_resources
                suggested_next_steps = get_actions_for_risk(risk)
                helpful_resources = get_supportive_resources()
            except Exception as e:
                print(f"⚠️ Resource generation failed: {e}")
                suggested_next_steps = _get_contextual_suggestions(text, probs, risk)
                helpful_resources = _get_contextual_resources(risk)
        else:
            suggested_next_steps = []
            helpful_resources = []
        
        # Step 9: Generate recommendations only if in suggestion mode
        comprehensive_recommendations = {}
        if suggestion_mode and recommendation_engine:
            try:
                print(f"📋 Generating suggestions for types: {suggestion_types}")
                all_recommendations = recommendation_engine.get_personalized_recommendations(risk, probs)
                
                # Filter recommendations based on requested types
                if suggestion_types:
                    type_mapping = {
                        "feel_good_films": "movies",
                        "healing_reads": "books", 
                        "mindful_movement": "exercises",
                        "nourishing_care": "nutrition",
                        "peaceful_places": "activities",
                        "support_resources": "resources",
                        "gentle_steps": "quotes",
                        "words_of_comfort": "quotes"
                    }
                    
                    for suggestion_type in suggestion_types:
                        recommendation_key = type_mapping.get(suggestion_type, suggestion_type)
                        if recommendation_key in all_recommendations:
                            comprehensive_recommendations[recommendation_key] = all_recommendations[recommendation_key]
                else:
                    comprehensive_recommendations = all_recommendations
                    
            except Exception as e:
                print(f"⚠️ Recommendation generation failed: {e}")
                comprehensive_recommendations = {}
        
        # Step 10: Update session insights
        try:
            session_insights = session.extract_user_insights(text, probs)
        except Exception as e:
            print(f"⚠️ Session insights failed: {e}")
            session_insights = {}
        
        return AnalyzeResponse(
            probs=probs,
            risk=risk,
            supportive_message=supportive_message,
            suggested_next_steps=suggested_next_steps[:4],
            helpful_resources=helpful_resources[:3],
            recommendations=comprehensive_recommendations,
            conversation_stage=session.session_stage if session else "initial",
            suggestion_mode=suggestion_mode,
            suggestion_types=suggestion_types,
            session_insights=session_insights
        )
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return _get_fallback_response()

def _generate_fallback_message(text: str, probs: dict, risk: str) -> str:
    """Generate a fallback therapeutic message"""
    messages = [
        "I'm here to listen and support you. Thank you for sharing with me.",
        "I can sense you're going through something difficult. You're not alone in this.",
        "Your feelings are valid, and I want to help you work through them.",
        "It takes courage to reach out. I'm glad you're here with me right now."
    ]
    import random
    return random.choice(messages)

def _get_contextual_suggestions(text: str, probs: dict, risk: str) -> list:
    """Generate contextual suggestions based on emotion and risk"""
    suggestions = [
        "Take a moment to breathe deeply and center yourself",
        "Consider writing down your thoughts in a journal",
        "Try a short walk or gentle movement",
        "Reach out to someone you trust"
    ]
    return suggestions

def _get_contextual_resources(risk: str) -> list:
    """Get contextual resources based on risk level"""
    resources = [
        "Crisis Text Line: Text HOME to 741741",
        "National Suicide Prevention Lifeline: 988",
        "SAMHSA National Helpline: 1-800-662-4357"
    ]
    return resources

def _get_fallback_response() -> AnalyzeResponse:
    """Fallback response when analysis fails"""
    return AnalyzeResponse(
        probs={"neutral": 0.8, "optimism": 0.2},
        risk="SAFE",
        supportive_message="I'm here to listen and support you. Could you tell me a bit more about what's on your mind?",
        suggested_next_steps=[
            "Take a moment to breathe deeply",
            "Consider talking to someone you trust"
        ],
        helpful_resources=[
            "National Mental Health Hotline: 988"
        ],
        recommendations={},
        conversation_stage="initial",
        suggestion_mode=False,
        suggestion_types=[],
        session_insights={}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
