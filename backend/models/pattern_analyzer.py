"""
Pattern analyzer for HealWise conversation analysis
Per copilot-instructions.md: New models under backend/models/
"""

def analyze_conversation_patterns(text, history=None):
    """
    Analyze conversation patterns for HealWise
    
    Args:
        text (str): Current user input
        history (list, optional): Previous conversation history (currently unused per instructions)
    
    Returns:
        dict: Pattern analysis results
    """
    # Basic implementation following HealWise conventions
    patterns = {
        "repetitive_concerns": False,
        "escalating_risk": False,
        "improvement_indicators": False,
        "engagement_level": "medium"
    }
    
    if not text or not text.strip():
        return patterns
    
    text_lower = text.lower()
    
    # Check for repetitive concerns
    concern_keywords = ["again", "still", "keep", "always", "never stops"]
    patterns["repetitive_concerns"] = any(keyword in text_lower for keyword in concern_keywords)
    
    # Check for escalating risk indicators
    escalation_keywords = ["worse", "getting bad", "can't handle", "giving up"]
    patterns["escalating_risk"] = any(keyword in text_lower for keyword in escalation_keywords)
    
    # Check for improvement indicators
    improvement_keywords = ["better", "improving", "helping", "progress", "hope"]
    patterns["improvement_indicators"] = any(keyword in text_lower for keyword in improvement_keywords)
    
    # Determine engagement level
    if len(text_lower) < 10:
        patterns["engagement_level"] = "low"
    elif len(text_lower) > 100:
        patterns["engagement_level"] = "high"
    else:
        patterns["engagement_level"] = "medium"
    
    return patterns

def get_conversation_insights(patterns, risk_level=None):
    """
    Generate insights based on conversation patterns
    
    Args:
        patterns (dict): Results from analyze_conversation_patterns
        risk_level (str, optional): Current risk assessment
    
    Returns:
        dict: Conversation insights and recommendations
    """
    insights = {
        "summary": "Standard conversation pattern",
        "recommendations": [],
        "flags": []
    }
    
    if patterns.get("repetitive_concerns"):
        insights["flags"].append("repetitive_concerns")
        insights["recommendations"].append("Consider exploring new coping strategies")
    
    if patterns.get("escalating_risk"):
        insights["flags"].append("escalating_risk")
        insights["recommendations"].append("Monitor for increasing distress levels")
    
    if patterns.get("improvement_indicators"):
        insights["flags"].append("positive_progress")
        insights["recommendations"].append("Acknowledge and reinforce positive changes")
    
    if patterns.get("engagement_level") == "low":
        insights["recommendations"].append("Encourage more detailed expression")
    elif patterns.get("engagement_level") == "high":
        insights["recommendations"].append("Validate detailed sharing")
    
    return insights