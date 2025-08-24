# backend/models/mental_classifier.py
"""
Simple emotion classifier for HealWise per copilot-instructions.md
Fallback implementation when transformers not available
"""

def score_probs(text: str, top_k: int = 5):
    """
    Return top emotions with probabilities for given text
    Uses keyword-based detection when ML model unavailable
    """
    if not text or not text.strip():
        return {"neutral": 0.5, "calm": 0.3, "content": 0.2}
    
    text_lower = text.lower()
    emotions = {}
    
    # Sadness indicators
    if any(word in text_lower for word in ["sad", "depressed", "down", "hopeless", "empty", "lonely", "miserable", "heartbroken"]):
        emotions["sadness"] = 0.8
        emotions["disappointment"] = 0.6
        emotions["grief"] = 0.4
    
    # Anxiety/Nervousness indicators  
    if any(word in text_lower for word in ["anxious", "worried", "nervous", "stress", "panic", "overwhelmed", "scared", "afraid"]):
        emotions["nervousness"] = 0.7
        emotions["fear"] = 0.6
        emotions["anxiety"] = 0.5
    
    # Anger indicators
    if any(word in text_lower for word in ["angry", "mad", "furious", "annoyed", "frustrated", "rage", "hate", "irritated"]):
        emotions["anger"] = 0.7
        emotions["annoyance"] = 0.5
        emotions["frustration"] = 0.4
    
    # Joy/Happiness indicators
    if any(word in text_lower for word in ["happy", "joy", "excited", "great", "amazing", "wonderful", "good", "fantastic", "thrilled"]):
        emotions["joy"] = 0.7
        emotions["excitement"] = 0.5
        emotions["optimism"] = 0.4
    
    # Fear indicators
    if any(word in text_lower for word in ["terrified", "frightened", "fearful", "scary", "nightmare"]):
        emotions["fear"] = 0.8
        emotions["nervousness"] = 0.4
    
    # Love indicators
    if any(word in text_lower for word in ["love", "adore", "cherish", "care", "affection", "grateful", "thankful"]):
        emotions["love"] = 0.7
        emotions["gratitude"] = 0.5
        emotions["caring"] = 0.4
    
    # Embarrassment indicators
    if any(word in text_lower for word in ["embarrassed", "ashamed", "humiliated", "awkward"]):
        emotions["embarrassment"] = 0.7
        emotions["shame"] = 0.5
    
    # Guilt indicators
    if any(word in text_lower for word in ["guilty", "regret", "sorry", "fault", "blame"]):
        emotions["guilt"] = 0.6
        emotions["remorse"] = 0.4
    
    # Surprise indicators
    if any(word in text_lower for word in ["surprised", "shocked", "amazed", "unexpected", "wow"]):
        emotions["surprise"] = 0.6
        emotions["realization"] = 0.4
    
    # Approval indicators
    if any(word in text_lower for word in ["approve", "agree", "like", "support", "yes", "right", "correct"]):
        emotions["approval"] = 0.5
        emotions["admiration"] = 0.3
    
    # Disapproval indicators  
    if any(word in text_lower for word in ["disapprove", "disagree", "dislike", "wrong", "bad", "terrible", "awful"]):
        emotions["disapproval"] = 0.6
        emotions["annoyance"] = 0.3
    
    # Curiosity indicators
    if any(word in text_lower for word in ["curious", "wonder", "interesting", "question", "why", "how", "what"]):
        emotions["curiosity"] = 0.5
        emotions["realization"] = 0.3
    
    # Default neutral emotions if nothing specific detected
    if not emotions:
        emotions = {
            "neutral": 0.4,
            "curiosity": 0.3,
            "realization": 0.2,
            "approval": 0.1
        }
    
    # Normalize probabilities to sum to ~1.0
    total = sum(emotions.values())
    if total > 0:
        emotions = {emotion: prob/total for emotion, prob in emotions.items()}
    
    # Sort by probability and return top_k
    sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
    result = dict(sorted_emotions[:top_k])
    
    print(f"Emotion detection for '{text[:50]}...': {list(result.keys())}")
    return result

# Test if run directly
if __name__ == "__main__":
    test_texts = [
        "I feel very sad and hopeless",
        "I'm anxious about my job interview", 
        "I'm so happy and excited!",
        "I feel angry and frustrated"
    ]
    
    for text in test_texts:
        emotions = score_probs(text, top_k=3)
        print(f"'{text}' -> {emotions}")
