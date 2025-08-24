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

