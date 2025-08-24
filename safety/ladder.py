"""
Enhanced action ladder for HealWise with diverse therapeutic recommendations
Per copilot-instructions.md: ACTIONS mapping from risk → suggested user actions
"""
from enum import Enum
from typing import List, Dict, Any
import random

# Known issue per copilot-instructions.md: Risk enums differ between assessor and ladder
# Using assessor.Risk values but providing compatibility mapping
class Risk(Enum):
    """Risk levels for ladder compatibility"""
    SAFE = "SAFE"
    LOW = "LOW"  
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRISIS = "CRISIS"

# ACTIONS mapping per copilot-instructions.md
ACTIONS = {
    "SAFE": [
        "Keep nurturing your positive mindset",
        "Share your good energy with others", 
        "Try a new hobby or creative activity",
        "Practice gratitude journaling"
    ],
    "LOW": [
        "Take 5 deep breaths and ground yourself",
        "Go for a 10-minute walk outdoors",
        "Listen to calming music or nature sounds",
        "Talk to a trusted friend or family member"
    ],
    "MODERATE": [
        "Consider speaking with a counselor",
        "Try mindfulness or meditation apps",
        "Engage in gentle physical activity",
        "Reach out to your support network"
    ],
    "HIGH": [
        "Contact a mental health professional",
        "Call a crisis helpline for support", 
        "Stay with trusted friends/family",
        "Remove harmful items from reach"
    ],
    "CRISIS": [
        "Call 988 (Suicide & Crisis Lifeline) immediately",
        "Go to your nearest emergency room",
        "Call 911 or local emergency services",
        "Don't stay alone - reach out now"
    ]
}

def get_random_suggestions(risk: str, count: int = 3) -> List[str]:
    """Get random suggestions from ACTIONS for backward compatibility per copilot-instructions.md"""
    actions = ACTIONS.get(risk, ACTIONS["SAFE"])
    return random.sample(actions, min(count, len(actions)))

def get_actions_for_risk(risk_level: str) -> List[str]:
    """Get action suggestions for a specific risk level"""
    # Map assessor risk levels to ladder risk levels
    risk_mapping = {
        "SAFE": "SAFE",
        "LOW": "LOW", 
        "MODERATE": "MODERATE",
        "HIGH": "HIGH",
        "CRISIS": "CRISIS"
    }
    
    mapped_risk = risk_mapping.get(risk_level, "SAFE")
    return ACTIONS.get(mapped_risk, ACTIONS["SAFE"])

def get_supportive_resources() -> List[str]:
    """Get general supportive resources"""
    return [
        "National Suicide Prevention Lifeline: 988",
        "Crisis Text Line: Text HOME to 741741", 
        "SAMHSA National Helpline: 1-800-662-4357",
        "National Alliance on Mental Illness: nami.org",
        "Mental Health America: mhanational.org",
        "BetterHelp Online Therapy: betterhelp.com",
        "Psychology Today Therapist Directory: psychologytoday.com",
        "Headspace Meditation App: headspace.com"
    ]

def get_escalation_resources() -> List[str]:
    """Get emergency resources for high-risk situations"""
    return [
        "Emergency Services: 911",
        "National Suicide Prevention Lifeline: 988",
        "Crisis Text Line: Text HOME to 741741",
        "National Sexual Assault Hotline: 1-800-656-4673",
        "National Domestic Violence Hotline: 1-800-799-7233",
        "Veterans Crisis Line: 1-800-273-8255",
        "Trans Lifeline: 877-565-8860",
        "TrevorLifeline (LGBTQ): 1-866-488-7386"
    ]

