# backend/app.py
import sys
import os
from pathlib import Path

# Add the repo root to Python path for imports
backend_dir = Path(__file__).parent
repo_root = backend_dir.parent
sys.path.insert(0, str(repo_root))

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from typing import Optional, Dict, Any, List

# Import from repo root paths
from models.mental_classifier import score_probs
from models.pattern_analyzer import analyze_conversation_patterns
from safety.assessor import assess_crisis_signals
from safety.ladder import ACTIONS
from safety.bias import de_stigmatize
from kb.retriever import retrieve
from safety.early_warning import generate_early_warnings

app = FastAPI(title="HealWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

def get_creative_response(text: str, user_profile: Optional[Dict] = None) -> Optional[str]:
    """Generate creative responses for specific user requests"""
    text_lower = text.lower()
    
    # Song requests
    if any(phrase in text_lower for phrase in ["sing", "song", "music", "melody"]):
        songs = [
            "🎵 Here's a little tune for you:\n'Sunshine on your shoulders makes you happy,\nSunshine in your eyes can make you cry...' 🌞",
            "🎶 A gentle melody:\n'You are my sunshine, my only sunshine,\nYou make me happy when skies are gray...' ☀️",
            "🎵 Humming softly:\n'What a wonderful world it would be,\nIf we could see the beauty in everything...' 🌍",
        ]
        return songs[hash(text) % len(songs)]
    
    # Cheer up requests
    if any(phrase in text_lower for phrase in ["cheer me up", "make me happy", "need encouragement", "feeling down"]):
        cheers = [
            "🌟 Here's something to brighten your day: You are braver than you believe, stronger than you seem, and more loved than you know! Every challenge you face is just preparing you for something amazing ahead! 💪✨",
            "🌈 Let me paint you a picture with words: Imagine a garden where every flower bloomed despite the storms. You are that garden, beautiful and resilient, growing stronger with each passing day! 🌸🌺",
            "⭐ A little magic for your heart: Did you know that stars shine brightest in the darkest nights? You're someone's guiding star right now, even if you can't see it. Your light matters more than you know! 🌙✨",
        ]
        return cheers[hash(text) % len(cheers)]
    
    # Compliments and affirmations
    if any(phrase in text_lower for phrase in ["compliment", "nice words", "affirmation", "positive"]):
        compliments = [
            "✨ You have a beautiful way of expressing yourself. The fact that you're here, working on your mental health, shows incredible strength and self-awareness. That's truly admirable! 💜",
            "🌟 Your courage to share and seek support is inspiring. You're not just taking care of yourself, but showing others it's okay to prioritize mental wellness. That's leadership! 👑",
            "💎 You're like a rare gem - unique, valuable, and absolutely irreplaceable. The world is brighter because you're in it, even on days when you don't feel that way! ✨",
        ]
        return compliments[hash(text) % len(compliments)]
    
    # Story requests
    if any(phrase in text_lower for phrase in ["tell me a story", "story", "tale"]):
        stories = [
            "📖 Once upon a time, there was a little seed buried deep in dark soil. It felt scared and alone. But slowly, with patience and gentle care, it began to grow. Day by day, it reached toward the light, until one morning it bloomed into the most beautiful flower in the garden. Sometimes we need the darkness to appreciate how magnificent our light can be. 🌱🌸",
            "🦋 There once lived a caterpillar who was afraid of heights. All the other caterpillars would climb to the top of tall plants, but this little one stayed low. One day, something magical happened - it began to transform. When it emerged as a butterfly, it realized it was never meant to just climb... it was meant to soar! Your transformation is happening too, even when you can't see it. 🌟",
        ]
        return stories[hash(text) % len(stories)]
    
    return None

def generate_therapeutic_response(text: str, risk_level: str, user_profile: Optional[Dict] = None) -> str:
    """Generate personalized therapeutic responses based on risk level and user profile"""
    
    # First check for creative requests
    creative_response = get_creative_response(text, user_profile)
    if creative_response:
        return creative_response
    
    # Get persona style
    persona = user_profile.get('botPersona', 'friend') if user_profile else 'friend'
    personality = user_profile.get('personality', 'creative') if user_profile else 'creative'
    name = user_profile.get('name', 'friend') if user_profile else 'friend'
    
    # Persona-specific response styles
    persona_styles = {
        'friend': {
            'prefix': f"Hey {name}," if name != 'friend' else "Hey there,",
            'tone': "casual and supportive",
            'endings': ["I'm here for you! 💙", "You've got this! 🌟", "Sending you good vibes! ✨"]
        },
        'sibling': {
            'prefix': f"Hey {name}!" if name != 'friend' else "Hey sib!",
            'tone': "playful but caring",
            'endings': ["Love you! 💜", "You're awesome! 🎉", "Big hug! 🤗"]
        },
        'parent': {
            'prefix': f"Sweetheart {name}," if name != 'friend' else "Sweetheart,",
            'tone': "nurturing and wise",
            'endings': ["I'm so proud of you! 💕", "You're loved! 🌸", "Take care of yourself! 🤱"]
        },
        'mentor': {
            'prefix': f"I hear you, {name}," if name != 'friend' else "I hear you,",
            'tone': "wise and guiding",
            'endings': ["You're growing beautifully! 🌱", "Keep trusting your journey! 🗺️", "Your wisdom is emerging! 🧠"]
        }
    }
    
    style = persona_styles.get(persona, persona_styles['friend'])
    
    if risk_level in ['HIGH', 'CRISIS']:
        # Deep therapeutic response for high-risk situations
        responses = [
            f"{style['prefix']} I can sense you're going through something really difficult right now, and I want you to know that your feelings are completely valid. What you're experiencing is real and important. Let's take this one moment at a time together. Can you tell me more about what's feeling most overwhelming right now?",
            f"{style['prefix']} Thank you for trusting me with these feelings. I can hear the pain in your words, and I want you to know that you're not alone in this. Sometimes when everything feels too much, the bravest thing we can do is simply keep breathing. What's one small thing that might bring you even a tiny bit of comfort right now?",
            f"{style['prefix']} I'm really glad you're here and sharing this with me. These feelings you're having - they're telling us something important about what you need. You don't have to carry this weight by yourself. What would it feel like to imagine someone sitting beside you right now, just being present with you?"
        ]
        return responses[hash(text) % len(responses)] + "\n\n" + style['endings'][0]
    
    elif risk_level == 'MODERATE':
        # Supportive but probing responses
        responses = [
            f"{style['prefix']} I can sense there's quite a bit on your mind lately. It sounds like you're navigating some challenging waters. Sometimes when life feels heavy, it helps to just acknowledge that it's okay to not have everything figured out. What's been the most challenging part of your day?",
            f"{style['prefix']} You're dealing with some real stuff right now, and I appreciate you sharing it with me. Life has a way of throwing us curveballs sometimes. I'm curious - when you think about tomorrow, what's one small thing you're looking forward to, even if it's tiny?",
            f"{style['prefix']} It sounds like you're in a space where things feel a bit overwhelming. That's completely understandable. Sometimes the most healing thing we can do is simply name what we're feeling. How would you describe what's sitting heaviest on your heart right now?"
        ]
        return responses[hash(text) % len(responses)] + "\n\n" + style['endings'][1]
    
    else:  # LOW or SAFE
        # Encouraging and growth-focused responses
        personality_responses = {
            'foody': f"{style['prefix']} I love how you're sharing your thoughts with me! You know, just like cooking a great meal, taking care of our mental health is about the right ingredients - patience, self-compassion, and good company. What's nourishing your soul today?",
            'techy': f"{style['prefix']} Your mind works in such interesting ways! Think of this conversation like debugging code - we're not looking for what's broken, but understanding how everything connects. What patterns are you noticing in your thoughts lately?",
            'creative': f"{style['prefix']} There's something beautiful about how you express yourself. Your words paint a picture of someone who's really thinking deeply about life. If your current mood was a color, what would it be and why?",
            'genz': f"{style['prefix']} Okay, let's keep it real - you're absolutely valid for feeling whatever you're feeling right now. No cap. Mental health isn't aesthetic, it's authentic. What's your current vibe, honestly?",
            'fitness': f"{style['prefix']} Just like working out makes our bodies stronger, these conversations are strengthening your emotional resilience. You're putting in the work, and that's amazing! What's energizing you today?",
            'bookworm': f"{style['prefix']} I love the depth in your thoughts - you could write beautiful stories with insights like these. Every chapter of your life is adding to an incredible narrative. What wisdom are you discovering about yourself lately?"
        }
        
        base_response = personality_responses.get(personality, personality_responses['creative'])
        return base_response + "\n\n" + style['endings'][2]

@app.post("/analyze")
async def analyze_text(
    request: AnalyzeRequest,
    x_user_profile: Optional[str] = Header(None)
):
    try:
        # Parse user profile
        user_profile = None
        if x_user_profile:
            try:
                user_profile = json.loads(x_user_profile)
            except json.JSONDecodeError:
                pass
        
        text = request.text
        
        # Get emotion probabilities
        probs = score_probs(text, top_k=8)
        
        # Assess risk level
        risk = assess_crisis_signals(text, probs)
        
        # Apply bias reduction
        clean_text = de_stigmatize(text)
        
        # Generate personalized therapeutic response
        supportive_message = generate_therapeutic_response(text, risk.value, user_profile)
        
        # Get action suggestions based on risk
        suggested_actions = ACTIONS.get(risk.value, ["Take things one step at a time", "Practice self-compassion"])
        
        # Retrieve relevant resources
        resources = retrieve(text, k=2)
        
        # Enhanced therapeutic resources based on risk level and user profile
        if risk.value in ['HIGH', 'CRISIS']:
            additional_resources = [
                "🆘 Crisis Text Line: Text HOME to 741741",
                "📞 National Suicide Prevention Lifeline: 988",
                "🧘‍♀️ Guided breathing: Try 4-7-8 breathing technique",
                "💚 Remember: This feeling is temporary, you are permanent"
            ]
            resources.extend(additional_resources)
        elif risk.value == 'MODERATE':
            # Personalize resources based on user personality
            if user_profile:
                personality = user_profile.get('personality', 'creative')
                if personality == 'fitness':
                    additional_resources = [
                        "🏃‍♀️ Try a gentle 10-minute walk outside",
                        "🧘‍♀️ Do some light stretching or yoga",
                        "💪 Physical movement can boost your mood naturally"
                    ]
                elif personality == 'creative':
                    additional_resources = [
                        "🎨 Try drawing or doodling your feelings",
                        "📝 Write in a journal for a few minutes",
                        "🎵 Listen to music that matches your mood"
                    ]
                elif personality == 'techy':
                    additional_resources = [
                        "📱 Try a mindfulness or meditation app",
                        "🎧 Listen to a calming podcast or white noise",
                        "💻 Take a break from screens and step outside"
                    ]
                else:
                    additional_resources = [
                        "🌱 Try a 5-minute mindfulness meditation",
                        "📝 Consider journaling your thoughts",
                        "🚶‍♀️ A gentle walk might help clear your mind"
                    ]
            else:
                additional_resources = [
                    "🌱 Try a 5-minute mindfulness meditation",
                    "📝 Consider journaling your thoughts", 
                    "🚶‍♀️ A gentle walk might help clear your mind"
                ]
            resources.extend(additional_resources)
        
        return {
            "probs": probs,
            "risk": risk.value,
            "supportive_message": supportive_message,
            "suggested_next_steps": suggested_actions,
            "helpful_resources": resources[:6]  # Limit to top 6 resources
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-patterns")
async def analyze_patterns(
    conversations: List[Dict],
    x_user_profile: Optional[str] = Header(None)
):
    try:
        user_profile = None
        if x_user_profile:
            try:
                user_profile = json.loads(x_user_profile)
            except json.JSONDecodeError:
                pass
        
        # Server-side pattern analysis for validation
        patterns = analyze_conversation_patterns(conversations)
        warnings = generate_early_warnings(patterns, user_profile)
        
        return {
            "patterns": patterns,
            "early_warnings": warnings,
            "confidence": min(1.0, len(conversations) / 10),
            "recommendations": get_personalized_recommendations(patterns, user_profile)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pattern analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "HealWise API"}
