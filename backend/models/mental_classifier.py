# backend/models/mental_classifier.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Correct model name (underscore!)
MODEL_NAME = "SamLowe/roberta-base-go_emotions"

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.eval()

# Get labels from config
id2label = model.config.id2label

def score_probs(text: str, top_k: int = 5):
    """Return top emotions with probabilities for a given text."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]

    # Map emotions to probabilities
    results = {id2label[i]: float(probs[i]) for i in range(len(probs))}

    # Sort by highest probability
    sorted_results = sorted(results.items(), key=lambda x: x[1], reverse=True)

    # Return only top_k if specified
    return dict(sorted_results[:top_k])


# --- Quick sanity check ---
if __name__ == "__main__":
    text = "I feel happy and nothing matters."
    print("Text:", text)
    print("Top emotions:", score_probs(text, top_k=5))
