from models.mental_classifier import score_probs

tests = ["I feel empty and nothing matters. I don't want to wake up tomorrow.",
    "My heart races before work presentations and I can't focus.",
    "I feel as the happiest person alive "]

for t in tests:
    print("\n text:",t)
    print("scores:",score_probs(t))
    