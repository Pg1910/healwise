"""
Early warning system for HealWise mental health monitoring
Per copilot-instructions.md: safety extension point for crisis prevention
"""

from typing import List, Dict, Any
from .assessor import Risk

def generate_early_warnings(text: str, probs: Dict[str, float], risk: Risk, history: List[str] = None) -> List[str]:
    """
    Generate early warning signals based on text analysis and risk assessment
    
    Args:
        text (str): Current user input
        probs (Dict[str, float]): Emotion probabilities from mental_classifier
        risk (Risk): Risk level from assess_crisis_signals
        history (List[str], optional): Conversation history (currently unused per instructions)
    
    Returns:
        List[str]: Early warning messages for escalating mental health concerns
    """
    warnings = []
    
    if not text or not text.strip():
        return warnings
    
    text_lower = text.lower()
    
    # Risk-based warnings per HealWise Risk enum (SAFE/LOW/MODERATE/HIGH/CRISIS)
    if risk in [Risk.HIGH, Risk.CRISIS]:
        warnings.append("Immediate support recommended - please consider contacting a mental health professional")
        
        if "hurt" in text_lower or "harm" in text_lower:
            warnings.append("Crisis indicators detected - emergency resources available 24/7")
    
    elif risk == Risk.MODERATE:
        warnings.append("Elevated emotional distress detected - additional support may be helpful")
    
    # Emotion-based early warnings using SamLowe/roberta-base-go_emotions categories
    high_sadness = probs.get("sadness", 0) > 0.7
    high_fear = probs.get("fear", 0) > 0.7
    high_anxiety = probs.get("nervousness", 0) > 0.6  # nervousness maps to anxiety in go_emotions
    
    if high_sadness and high_fear:
        warnings.append("Multiple distressing emotions detected - consider reaching out for support")
    
    if high_anxiety and any(word in text_lower for word in ["panic", "overwhelmed", "can't breathe"]):
        warnings.append("Anxiety symptoms may benefit from grounding techniques or professional guidance")
    
    # Pattern-based warnings following HealWise safety conventions
    isolation_keywords = ["alone", "nobody", "no one cares", "isolated"]
    if any(keyword in text_lower for keyword in isolation_keywords):
        warnings.append("Social isolation detected - connecting with others can provide valuable support")
    
    hopelessness_keywords = ["hopeless", "pointless", "no future", "give up"]
    if any(keyword in text_lower for keyword in hopelessness_keywords):
        warnings.append("Hopelessness indicators present - professional support can help restore perspective")
    
    # Sleep/appetite disruption warnings (common depression indicators)
    sleep_issues = any(word in text_lower for word in ["can't sleep", "insomnia", "nightmares", "no sleep"])
    appetite_issues = any(word in text_lower for word in ["can't eat", "no appetite", "not eating"])
    
    if sleep_issues or appetite_issues:
        warnings.append("Basic self-care disruption noted - maintaining routines supports mental health")
    
    # Substance use concerns
    substance_keywords = ["drinking", "drugs", "high", "drunk", "pills", "escape"]
    if any(keyword in text_lower for keyword in substance_keywords) and risk != Risk.SAFE:
        warnings.append("Substance use mentioned - healthy coping strategies are available")
    
    # Remove duplicates while preserving order
    seen = set()
    unique_warnings = []
    for warning in warnings:
        if warning not in seen:
            seen.add(warning)
            unique_warnings.append(warning)
    
    return unique_warnings[:3]  # Limit to top 3 most relevant warnings

def assess_warning_urgency(warnings: List[str], risk: Risk) -> str:
    """
    Assess the urgency level of early warnings
    
    Args:
        warnings (List[str]): Generated warning messages
        risk (Risk): Current risk assessment
    
    Returns:
        str: Urgency level (low/medium/high/critical)
    """
    if not warnings:
        return "low"
    
    # Crisis-level risk always critical urgency
    if risk == Risk.CRISIS:
        return "critical"
    
    # High risk with multiple warnings
    if risk == Risk.HIGH and len(warnings) >= 2:
        return "high"
    
    # Moderate risk or single high-priority warning
    if risk == Risk.MODERATE or len(warnings) >= 2:
        return "medium"
    
    return "low"

def format_warnings_for_display(warnings: List[str], urgency: str) -> Dict[str, Any]:
    """
    Format warnings for frontend display following HealWise UI conventions
    
    Args:
        warnings (List[str]): Warning messages
        urgency (str): Urgency level
    
    Returns:
        Dict[str, Any]: Formatted warning data for frontend
    """
    if not warnings:
        return {"show_warnings": False}
    
    # Color coding per urgency level
    urgency_colors = {
        "low": "#FFA500",      # Orange
        "medium": "#FF6B35",   # Red-orange  
        "high": "#FF4444",     # Red
        "critical": "#CC0000"  # Dark red
    }
    
    return {
        "show_warnings": True,
        "messages": warnings,
        "urgency": urgency,
        "color": urgency_colors.get(urgency, "#FFA500"),
        "icon": "⚠️" if urgency in ["low", "medium"] else "🚨",
        "timestamp": None  # Frontend can add timestamp
    }

def get_warning_resources(warnings: List[str]) -> List[str]:
    """
    Get specific resources based on warning types
    
    Args:
        warnings (List[str]): Generated warnings
    
    Returns:
        List[str]: Relevant resource texts from kb/ or external sources
    """
    resources = []
    
    for warning in warnings:
        if "crisis" in warning.lower() or "emergency" in warning.lower():
            resources.append("National Suicide Prevention Lifeline: 988")
            resources.append("Crisis Text Line: Text HOME to 741741")
        
        elif "anxiety" in warning.lower():
            resources.append("Anxiety grounding technique: 5-4-3-2-1 sensory method")
            resources.append("Deep breathing: 4-7-8 technique (inhale 4, hold 7, exhale 8)")
        
        elif "isolation" in warning.lower():
            resources.append("Social connection ideas: reach out to one trusted person today")
            resources.append("Support groups: NAMI.org for local mental health communities")
        
        elif "self-care" in warning.lower():
            resources.append("Sleep hygiene: consistent sleep schedule and relaxing bedtime routine")
            resources.append("Nutrition support: small, regular meals even when appetite is low")
    
    # Remove duplicates
    return list(dict.fromkeys(resources))