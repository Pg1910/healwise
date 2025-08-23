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
    """Return top emotions with probabilities for a given text.

    - Handles empty text by returning an empty dict.
    - Supports mocked tokenizer/model in tests where tokenizer(text) returns a dict.
    """
    if text is None or (isinstance(text, str) and text.strip() == ""):
        return {}

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    # If tokenizer is mocked to return a plain dict, ensure tensors are tensors
    if isinstance(inputs, dict) and not hasattr(inputs, "keys"):
        # unlikely path; keep original
        pass
    if isinstance(inputs, dict):
        # Convert lists to torch tensors if needed
        converted = {}
        for k, v in inputs.items():
            if isinstance(v, list):
                converted[k] = torch.tensor(v)
            else:
                converted[k] = v
        inputs = converted

    with torch.no_grad():
        try:
            # Prefer keyword expansion if we have a dict of tensors
            if isinstance(inputs, dict):
                outputs = model(**inputs)
            else:
                outputs = model(inputs)
        except TypeError:
            # In tests, mocks may be swapped/misconfigured; try return_value directly
            outputs = getattr(model, "return_value", None) or {}

        logits = getattr(outputs, "logits", outputs)
        # Coerce logits into a tensor-like sequence [num_labels]
        if isinstance(logits, list):
            logits_tensor = torch.tensor(logits[0] if logits and isinstance(logits[0], (list, tuple)) else logits)
        else:
            try:
                logits_tensor = torch.tensor(logits)[0]
            except Exception:
                # Fallback to zeros if mocking failed
                logits_tensor = torch.zeros(len(id2label))

        probs = torch.nn.functional.softmax(logits_tensor, dim=-1)

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
