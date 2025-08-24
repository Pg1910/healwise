# backend/models/mental_classifier.py
"""
Simple emotion classifier for HealWise per copilot-instructions.md
Uses HuggingFace SamLowe/roberta-base-go_emotions model
"""
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

# Global model loading per copilot-instructions.md
MODEL_NAME = "SamLowe/roberta-base-go_emotions"
print(f"Loading emotion classifier: {MODEL_NAME}")

try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
    model.eval()
    
    # Get emotion labels
    id2label = model.config.id2label
    print(f"✅ Mental classifier loaded with {len(id2label)} emotions")
    
except Exception as e:
    print(f"❌ Failed to load mental classifier: {e}")
    # Fallback for development
    tokenizer = None
    model = None
    id2label = {
        0: "sadness", 1: "joy", 2: "love", 3: "anger", 4: "fear", 
        5: "surprise", 6: "disgust", 7: "shame", 8: "guilt", 9: "embarrassment",
        10: "excitement", 11: "nervousness", 12: "admiration", 13: "amusement", 14: "approval"
    }

def score_probs(text: str, top_k: int = 5):
    """
    Return top emotions with probabilities for given text
    Per copilot-instructions.md: robust error handling
    """
    if not text or not text.strip():
        return {"neutral": 0.5, "calm": 0.3, "content": 0.2}
    
    # Fallback emotion detection if model fails
    if not tokenizer or not model:
        print("Warning: Using fallback emotion detection")
        return _fallback_emotion_detection(text.lower(), top_k)
    
    try:
        # Tokenize and analyze
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = F.softmax(logits, dim=-1)
        
        # Convert to emotion probabilities
        emotion_probs = {}
        for i, prob in enumerate(probs[0]):
            if i in id2label:
                emotion_probs[id2label[i]] = float(prob)
        
        # Sort and return top_k
        sorted_emotions = sorted(emotion_probs.items(), key=lambda x: x[1], reverse=True)
        result = dict(sorted_emotions[:top_k])
        
        print(f"Emotions detected: {list(result.keys())[:3]}")
        return result
        
    except Exception as e:
        print(f"Error in emotion classification: {e}")
        return _fallback_emotion_detection(text.lower(), top_k)

def _fallback_emotion_detection(text: str, top_k: int = 5):
    """Simple keyword-based emotion detection fallback"""
    emotions = {}
    
    # Sadness indicators
    if any(word in text for word in ["sad", "depressed", "down", "hopeless", "empty", "lonely"]):
        emotions["sadness"] = 0.8
        emotions["disappointment"] = 0.6
    
    # Anxiety indicators  
    if any(word in text for word in ["anxious", "worried", "nervous", "stress", "panic", "overwhelmed"]):
        emotions["nervousness"] = 0.7
        emotions["fear"] = 0.5
        emotions["anxiety"] = 0.6
    
    # Anger indicators
    if any(word in text for word in ["angry", "mad", "furious", "annoyed", "frustrated", "rage"]):
        emotions["anger"] = 0.7
        emotions["annoyance"] = 0.5
    
    # Joy indicators
    if any(word in text for word in ["happy", "joy", "excited", "great", "amazing", "wonderful", "good"]):
        emotions["joy"] = 0.7
        emotions["excitement"] = 0.5
        emotions["optimism"] = 0.4
    
    # Fear indicators
    if any(word in text for word in ["afraid", "scared", "terrified", "frightened", "fearful"]):
        emotions["fear"] = 0.8
        emotions["nervousness"] = 0.4
    
    # Love indicators
    if any(word in text for word in ["love", "adore", "cherish", "care", "affection"]):
        emotions["love"] = 0.7
        emotions["gratitude"] = 0.4
    
    # Default emotions if nothing detected
    if not emotions:
        emotions = {
            "neutral": 0.4,
            "curiosity": 0.3,
            "realization": 0.2,
            "approval": 0.1
        }
    
    # Sort and return top_k
    sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
    return dict(sorted_emotions[:top_k])

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
