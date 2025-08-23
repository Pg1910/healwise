"""
Early warning system for HealWise crisis prevention
Per copilot instructions: extension point for safety tuning
"""

from typing import List, Dict, Any
from .assessor import Risk

def generate_early_warnings(text: str, probs: Dict[str, float], risk: Risk) -> List[str]:
    """
    Generate early warning signals for mental health monitoring
    
    Args:
        text (str): User input text
        probs (Dict[str, float]): Emotion probabilities from SamLowe/roberta-base-go_emotions
        risk (Risk): Risk level from assess_crisis_signals (SAFE/LOW/MODERATE/HIGH/CRISIS)
    
    Returns:
        List[str]: Early warning messages for escalating concerns
    """
    warnings = []
    
    if not text or not text.strip():
        return warnings
    
    text_lower = text.lower()
    
    # Crisis-level warnings per HealWise Risk enum
    if risk == Risk.CRISIS:
        warnings.append("Immediate crisis support recommended - please contact emergency services or crisis hotline")
        return warnings[:1]  # Only show crisis warning for CRISIS level
    
    elif risk == Risk.HIGH:
        warnings.append("High distress detected - professional mental health support strongly recommended")
    
    elif risk == Risk.MODERATE:
        # Check for specific warning patterns at moderate risk
        isolation_keywords = ["alone", "nobody", "no one cares", "isolated"]
        if any(keyword in text_lower for keyword in isolation_keywords):
            warnings.append("Social isolation detected - connecting with others can provide valuable support")
        
        hopelessness_keywords = ["hopeless", "pointless", "no future", "give up"]
        if any(keyword in text_lower for keyword in hopelessness_keywords):
            warnings.append("Hopelessness indicators present - perspective can be restored with support")
    
    # Emotion-based warnings using go_emotions categories
    high_sadness = probs.get("sadness", 0) > 0.7
    high_fear = probs.get("fear", 0) > 0.7
    high_anxiety = probs.get("nervousness", 0) > 0.6  # nervousness maps to anxiety in go_emotions
    
    if high_sadness and high_fear and risk != Risk.SAFE:
        warnings.append("Multiple distressing emotions detected - additional support may be helpful")
    
    if high_anxiety and any(word in text_lower for word in ["panic", "overwhelmed", "can't breathe"]):
        warnings.append("Anxiety symptoms present - grounding techniques or professional guidance available")
    
    # Limit to top 2 warnings to avoid overwhelming user
    return warnings[:2]

def get_warning_urgency(risk: Risk) -> str:
    """
    Get urgency level for warnings based on risk assessment
    
    Args:
        risk (Risk): Risk level from assessor.Risk enum
    
    Returns:
        str: Urgency level (low/medium/high/critical)
    """
    urgency_map = {
        Risk.SAFE: "low",
        Risk.LOW: "low", 
        Risk.MODERATE: "medium",
        Risk.HIGH: "high",
        Risk.CRISIS: "critical"
    }
    return urgency_map.get(risk, "low")