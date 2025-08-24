# backend/models/mental_classifier.py
"""
Simple emotion classifier for HealWise per copilot-instructions.md
"""

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import time

class MentalClassifier:
    def __init__(self):
        print("📦 Loading mental health classifier...")
        start_time = time.time()
        
        try:
            # Use CPU for faster loading and lower memory usage
            self.device = torch.device("cpu")
            
            model_name = "SamLowe/roberta-base-go_emotions"
            print(f"🔽 Loading tokenizer from {model_name}...")
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            print(f"🔽 Loading model from {model_name}...")
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.model.to(self.device)
            self.model.eval()  # Set to evaluation mode per copilot instructions
            
            # Cache emotion labels
            self.emotion_labels = list(self.model.config.id2label.values())
            
            load_time = time.time() - start_time
            print(f"✅ Mental classifier loaded in {load_time:.2f}s")
            
        except Exception as e:
            print(f"❌ Failed to load mental classifier: {e}")
            raise
    
    def score_probs(self, text: str, top_k: int = 5) -> dict:
        """
        Score emotion probabilities for given text.
        Returns dict of {emotion: probability} for top_k emotions.
        """
        try:
            # Quick validation
            if not text or len(text.strip()) == 0:
                return {"neutral": 1.0}
            
            # Tokenize with truncation for speed
            inputs = self.tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                padding=True, 
                max_length=256  # Limit for speed
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Forward pass with no gradients for speed
            with torch.no_grad():
                outputs = self.model(**inputs)
                probabilities = torch.softmax(outputs.logits, dim=-1)
            
            # Get top-k emotions
            probs = probabilities[0].cpu().numpy()
            top_indices = probs.argsort()[-top_k:][::-1]
            
            result = {}
            for idx in top_indices:
                emotion = self.emotion_labels[idx]
                prob = float(probs[idx])
                result[emotion] = prob
            
            return result
            
        except Exception as e:
            print(f"⚠️ Emotion scoring failed: {e}")
            # Fallback response
            return {"neutral": 0.8, "optimism": 0.2}

# Test if run directly
if __name__ == "__main__":
    classifier = MentalClassifier()
    
    test_texts = [
        "I feel very sad and hopeless",
        "I'm anxious about my job interview", 
        "I'm so happy and excited!",
        "I feel angry and frustrated"
    ]
    
    for text in test_texts:
        emotions = classifier.score_probs(text, top_k=3)
        print(f"'{text}' -> {emotions}")
