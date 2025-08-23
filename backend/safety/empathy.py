"""
Empathy tagging module for mental health text analysis
"""

def tag_empathy_level(text: str, emotions: dict) -> str:
    """
    Analyze text and emotions to determine appropriate empathy level
    
    Args:
        text: User input text
        emotions: Dictionary of emotion probabilities from classifier
    
    Returns:
        Empathy level string: "high", "medium", "low"
    """
    # Check for high-empathy indicators
    high_empathy_keywords = [
        "hurt", "pain", "suffering", "alone", "scared", "terrified",
        "desperate", "hopeless", "worthless", "lost", "broken",
        "crying", "tears", "can't", "unable", "struggling"
    ]
    
    # Check for crisis-related emotions
    crisis_emotions = ["sadness", "fear", "grief", "disappointment", "nervousness"]
    
    text_lower = text.lower()
    
    # High empathy needed
    if any(keyword in text_lower for keyword in high_empathy_keywords):
        return "high"
    
    # Check emotion intensities
    total_negative = sum(emotions.get(emotion, 0) for emotion in crisis_emotions)
    
    if total_negative > 0.6:
        return "high"
    elif total_negative > 0.3:
        return "medium"
    else:
        return "low"

def get_empathy_response_style(empathy_level: str) -> dict:
    """
    Get response style configuration based on empathy level
    
    Args:
        empathy_level: "high", "medium", or "low"
    
    Returns:
        Dictionary with response style parameters
    """
    styles = {
        "high": {
            "tone": "deeply compassionate and validating",
            "length": "longer, more detailed",
            "validation": "extensive emotional validation",
            "questions": "gentle, open-ended questions",
            "urgency": "immediate support focus"
        },
        "medium": {
            "tone": "supportive and understanding", 
            "length": "moderate detail",
            "validation": "acknowledge feelings",
            "questions": "exploratory questions",
            "urgency": "balanced support and exploration"
        },
        "low": {
            "tone": "encouraging and positive",
            "length": "concise but warm",
            "validation": "affirm positive aspects",
            "questions": "forward-looking questions", 
            "urgency": "growth-oriented"
        }
    }
    
    return styles.get(empathy_level, styles["medium"])