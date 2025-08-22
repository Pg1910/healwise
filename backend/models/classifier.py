from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_ID = "bhadresh-savani/distilbert-base-uncased-emotion"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID)

labels = ["sadness", "joy", "love", "anger", "fear", "surprise"]

def classify_text(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]

    return {label: float(prob) for label, prob in zip(labels, probs)}
