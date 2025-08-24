"""
Enhanced action ladder for HealWise with diverse therapeutic recommendations
Per copilot-instructions.md: ACTIONS mapping from risk → suggested user actions
"""
from enum import Enum
from typing import List, Dict, Any

# Known issue per copilot-instructions.md: Risk enums differ between assessor and ladder
class Risk(Enum):
    SAFE = "SAFE"
    ELEVATED = "ELEVATED"  # Maps to assessor's LOW/MODERATE
    HIGH = "HIGH"
    CRISIS = "CRISIS"

# ACTIONS mapping from risk level to suggested user actions
ACTIONS: Dict[str, List[str]] = {
    "SAFE": [
        "Continue practicing self-care and mindfulness",
        "Consider journaling about your thoughts and feelings",
        "Engage in activities that bring you joy",
        "Maintain regular sleep and exercise routines",
        "Connect with friends or family when you feel like it"
    ],
    
    "LOW": [  # Maps to ELEVATED in this enum
        "Try some deep breathing exercises or meditation",
        "Take a short walk outside or do light physical activity",
        "Listen to calming music or practice a hobby you enjoy",
        "Reach out to a trusted friend or family member",
        "Consider writing in a gratitude journal"
    ],
    
    "MODERATE": [  # Maps to ELEVATED in this enum
        "Practice grounding techniques like the 5-4-3-2-1 method",
        "Engage in gentle physical activity like yoga or stretching",
        "Try progressive muscle relaxation exercises",
        "Consider talking to a counselor or therapist",
        "Limit exposure to stressful news or social media",
        "Focus on basic self-care: nutrition, sleep, hygiene"
    ],
    
    "HIGH": [
        "Reach out to a mental health professional or counselor immediately",
        "Contact a trusted friend, family member, or support person",
        "Use crisis text lines or mental health hotlines for immediate support",
        "Practice safety planning and remove potential harmful items",
        "Stay in a safe environment with supportive people if possible",
        "Consider visiting an emergency room if you feel unsafe"
    ],
    
    "CRISIS": [
        "Call 988 (Suicide & Crisis Lifeline) or emergency services immediately",
        "Go to your nearest emergency room or call 911",
        "Stay with a trusted person and do not be alone",
        "Contact your therapist, psychiatrist, or healthcare provider urgently",
        "Use the Crisis Text Line: Text HOME to 741741",
        "Implement your safety plan if you have one"
    ]
}

def get_actions_for_risk(risk_level: str) -> List[str]:
    """
    Get suggested actions for a given risk level.
    
    Args:
        risk_level: Risk level from assessor (SAFE/LOW/MODERATE/HIGH/CRISIS)
        
    Returns:
        List of suggested action strings
    """
    # Handle the enum mismatch mentioned in copilot instructions
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
    """
    Get general supportive resources for lower-risk situations.
    
    Returns:
        List of supportive resource strings
    """
    return [
        "Mental Health America: mhanational.org",
        "National Alliance on Mental Illness (NAMI): nami.org", 
        "Anxiety and Depression Association: adaa.org",
        "7 Cups - Free emotional support: 7cups.com",
        "Crisis Text Line: Text HOME to 741741",
        "Therapy finder tools: psychologytoday.com"
    ]

def get_escalation_resources() -> List[str]:
    """
    Get crisis escalation resources for high-risk situations.
    
    Returns:
        List of crisis resource strings
    """
    return [
        "National Suicide Prevention Lifeline: 988",
        "Crisis Text Line: Text HOME to 741741",
        "SAMHSA National Helpline: 1-800-662-4357",
        "Emergency Services: 911",
        "National Domestic Violence Hotline: 1-800-799-7233",
        "LGBT National Hotline: 1-888-843-4564",
        "Veterans Crisis Line: 1-800-273-8255, Press 1"
    ]